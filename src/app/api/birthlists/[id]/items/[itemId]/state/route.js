import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import BirthList from '@/models/BirthList';
import mongoose from 'mongoose';

// Helper function to check if a MongoDB ObjectId is valid
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// PUT: Update item state and user data
export async function PUT(request, { params }) {
    try {
        const { id, itemId } = params;

        // Validate ID formats
        if (!isValidObjectId(id) || !isValidObjectId(itemId)) {
            return NextResponse.json(
                { success: false, message: 'Invalid ID format' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Find the birth list
        const birthList = await BirthList.findById(id);

        if (!birthList) {
            return NextResponse.json(
                { success: false, message: 'Birth list not found' },
                { status: 404 }
            );
        }

        // Find the item in the birth list
        const itemIndex = birthList.items.findIndex(item => item._id.toString() === itemId);

        if (itemIndex === -1) {
            return NextResponse.json(
                { success: false, message: 'Item not found in birth list' },
                { status: 404 }
            );
        }

        // Parse request body
        const { state, userData } = await request.json();

        // Validate state
        if (typeof state !== 'number' || state < 0 || state > 2) {
            return NextResponse.json(
                { success: false, message: 'Invalid state value. Must be 0, 1, or 2.' },
                { status: 400 }
            );
        }

        // Validate user data if state > 0
        if (state > 0) {
            if (!userData || !userData.name || !userData.email) {
                return NextResponse.json(
                    { success: false, message: 'User data (name and email) required for reservations and purchases' },
                    { status: 400 }
                );
            }
        }

        // Update the item
        birthList.items[itemIndex] = {
            ...birthList.items[itemIndex].toObject(),
            state,
            userData: state > 0 ? {
                name: userData.name,
                email: userData.email,
                phone: userData.phone || '',
                message: userData.message || '',
                date: new Date().toISOString()
            } : null
        };

        // Save the changes
        await birthList.save();

        // Fetch the updated list with populated products
        const updatedBirthList = await BirthList.findById(id).populate('items.product');

        return NextResponse.json({
            success: true,
            message: 'Item state updated successfully',
            data: updatedBirthList.items[itemIndex]
        });

    } catch (error) {
        console.error('Error updating item state:', error);
        return NextResponse.json(
            { success: false, message: 'Error updating item state', error: error.message },
            { status: 500 }
        );
    }
}
