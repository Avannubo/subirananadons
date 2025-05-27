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

export async function GET(request, { params }) {
    try {
        const { id } = params;

        // Validate ID format
        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { success: false, message: 'Invalid birth list ID format' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Find the birth list
        const birthList = await BirthList.findById(id)
            .populate('user', 'name email')
            .populate('items.product');

        if (!birthList) {
            return NextResponse.json(
                { success: false, message: 'Birth list not found' },
                { status: 404 }
            );
        }

        const session = await getServerSession(authOptions);
        const isPublic = birthList.isPublic;

        // Only allow access if:
        // 1. The birth list is public, OR
        // 2. The user is logged in AND (is admin OR is the owner)
        if (!isPublic) {
            if (!session?.user) {
                return NextResponse.json(
                    { success: false, message: 'Unauthorized: Authentication required for private lists' },
                    { status: 401 }
                );
            }

            if (!hasAccess(birthList, session.user.id, session.user.role)) {
                return NextResponse.json(
                    { success: false, message: 'Forbidden: You do not have access to this birth list' },
                    { status: 403 }
                );
            }
        }

        return NextResponse.json({ success: true, data: birthList });
    } catch (error) {
        console.error('Error fetching birth list:', error);
        return NextResponse.json(
            { success: false, message: 'Error fetching birth list', error: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = params;

        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized: Authentication required' },
                { status: 401 }
            );
        }

        // Validate ID format
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

        // Parse request body
        const updates = await request.json();

        // Don't allow changing the user
        delete updates.user;

        // Update the birth list        const updatedBirthList = await BirthList.findByIdAndUpdate(
        id,
            { $set: updates },
            { new: true, runValidators: true } 
        .populate('user', 'name email')
            .populate('items.product');

        return NextResponse.json({
            success: true,
            message: 'Birth list updated successfully',
            data: updatedBirthList
        });
    } catch (error) {
        console.error('Error updating birth list:', error);
        return NextResponse.json(
            { success: false, message: 'Error updating birth list', error: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = params;

        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized: Authentication required' },
                { status: 401 }
            );
        }

        // Validate ID format
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

        // Check if user has permission to delete this list
        if (!hasAccess(birthList, session.user.id, session.user.role)) {
            return NextResponse.json(
                { success: false, message: 'Forbidden: You do not have permission to delete this birth list' },
                { status: 403 }
            );
        }

        // Delete the birth list
        await BirthList.findByIdAndDelete(id);

        return NextResponse.json({
            success: true,
            message: 'Birth list deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting birth list:', error);
        return NextResponse.json(
            { success: false, message: 'Error deleting birth list', error: error.message },
            { status: 500 }
        );
    }
} 