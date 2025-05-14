import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import BirthList from '@/models/BirthList';
import User from '@/models/User';
import mongoose from 'mongoose';

// Helper function to check if a MongoDB ObjectId is valid
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

export async function POST(request, { params }) {
    try {
        const { id } = params;

        // Validate birth list ID
        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { success: false, message: 'Invalid birth list ID format' },
                { status: 400 }
            );
        }

        // Parse request body
        const {
            itemId,
            quantity = 1,
            buyerName,
            buyerEmail,
            buyerPhone,
            paymentMethod = 'store' // 'store', 'online'
        } = await request.json();

        // Validate required fields
        if (!itemId || !isValidObjectId(itemId)) {
            return NextResponse.json(
                { success: false, message: 'Invalid item ID' },
                { status: 400 }
            );
        }

        if (!buyerName || !buyerEmail) {
            return NextResponse.json(
                { success: false, message: 'Buyer name and email are required' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Find the birth list with the specified item
        const birthList = await BirthList.findById(id).populate('user', 'email name');

        if (!birthList) {
            return NextResponse.json(
                { success: false, message: 'Birth list not found' },
                { status: 404 }
            );
        }

        // Find the specific item in the birth list
        const itemIndex = birthList.items.findIndex(item => item._id.toString() === itemId);

        if (itemIndex === -1) {
            return NextResponse.json(
                { success: false, message: 'Item not found in birth list' },
                { status: 404 }
            );
        }

        const item = birthList.items[itemIndex];

        // Check if the requested quantity is available
        const availableQuantity = item.quantity - item.reserved;

        if (availableQuantity < quantity) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Not enough available quantity',
                    availableQuantity
                },
                { status: 400 }
            );
        }

        // Get current user session if available (optional for guests)
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id || null;

        // Record the purchase
        const purchase = {
            buyerName,
            buyerEmail,
            buyerPhone: buyerPhone || '',
            userId,
            quantity,
            paymentMethod,
            status: 'pending', // pending, completed, cancelled
            purchaseDate: new Date()
        };

        // Update the item's reserved count and add the purchase info
        birthList.items[itemIndex].reserved += quantity;

        if (!birthList.items[itemIndex].purchases) {
            birthList.items[itemIndex].purchases = [];
        }

        birthList.items[itemIndex].purchases.push(purchase);

        // Add contributor to list if they're not already there
        if (userId) {
            const contributorExists = birthList.contributors.some(
                contributor => contributor.user && contributor.user.toString() === userId
            );

            if (!contributorExists) {
                birthList.contributors.push({
                    user: userId,
                    contributedAt: new Date()
                });
            }
        }

        // Check if the list is now complete
        const isListComplete = birthList.items.every(item => item.reserved >= item.quantity);
        if (isListComplete && birthList.status === 'Activa') {
            birthList.status = 'Completada';

            // TODO: Send notification to list owner - this would be handled by a notification service
            // For now, we'll just log it
            console.log(`Birth list ${birthList._id} is now complete. Notifying owner: ${birthList.user.email}`);
        }

        // Save the updated birth list
        await birthList.save();

        return NextResponse.json({
            success: true,
            message: 'Gift purchase recorded successfully',
            data: {
                item: birthList.items[itemIndex],
                isListComplete,
                purchaseId: birthList.items[itemIndex].purchases.slice(-1)[0]._id,
                listOwner: {
                    name: birthList.user.name,
                    email: birthList.user.email
                }
            }
        });
    } catch (error) {
        console.error('Error processing gift purchase:', error);
        return NextResponse.json(
            { success: false, message: 'Error processing gift purchase', error: error.message },
            { status: 500 }
        );
    }
} 