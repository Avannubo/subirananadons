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

// Helper function to check if user has access to the birth list
const hasAccess = (birthList, userId, role) => {
    return role === 'admin' || birthList.user.toString() === userId;
};

// DELETE: Remove a specific item from the birth list
export async function DELETE(request, { params }) {
    try {
        // Get list ID and item ID from params
        const { id, itemId } = params;

        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized: Authentication required' },
                { status: 401 }
            );
        }

        // Validate ID formats
        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { success: false, message: 'Invalid birth list ID format' },
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

        // Check if user has permission to update this list
        if (!hasAccess(birthList, session.user.id, session.user.role)) {
            return NextResponse.json(
                { success: false, message: 'Forbidden: You do not have permission to update this birth list' },
                { status: 403 }
            );
        }

        // Find and remove the specific item
        const itemIndex = birthList.items.findIndex(item => item._id.toString() === itemId);

        if (itemIndex === -1) {
            return NextResponse.json(
                { success: false, message: 'Item not found in birth list' },
                { status: 404 }
            );
        }

        // Remove the item from the array
        birthList.items.splice(itemIndex, 1);

        // Save the updated birth list
        await birthList.save();

        // Return the updated birth list with populated items
        const updatedBirthList = await BirthList.findById(id)
            .populate('items.product')
            .select('items');

        return NextResponse.json({
            success: true,
            message: 'Item removed from birth list successfully',
            data: updatedBirthList.items
        });

    } catch (error) {
        console.error('Error removing item from birth list:', error);
        return NextResponse.json(
            { success: false, message: 'Error removing item from birth list', error: error.message },
            { status: 500 }
        );
    }
}
