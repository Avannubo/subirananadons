import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import BirthList from '@/models/BirthList';
import Product from '@/models/Product';
import mongoose from 'mongoose';

// Helper function to check if a MongoDB ObjectId is valid
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// Helper function to check if user has access to the birth list
const hasAccess = (birthList, userId, role) => {
    return role === 'admin' || birthList.user.toString() === userId;
};

// GET: Retrieve items from a birth list
export async function GET(request, { params }) {
    try {
        // Ensure params is properly awaited
        const resolvedParams = await Promise.resolve(params);
        const { id } = resolvedParams;

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
            .populate('items.product')
            .select('items');

        if (!birthList) {
            return NextResponse.json(
                { success: false, message: 'Birth list not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: birthList.items
        });
    } catch (error) {
        console.error('Error fetching birth list items:', error);
        return NextResponse.json(
            { success: false, message: 'Error fetching birth list items', error: error.message },
            { status: 500 }
        );
    }
}

// POST: Add a new product to the birth list
export async function POST(request, { params }) {
    try {
        // Ensure params is properly awaited
        const resolvedParams = await Promise.resolve(params);
        const { id } = resolvedParams;

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
        const { product, quantity = 1, priority = 2 } = await request.json();

        if (!product || !isValidObjectId(product)) {
            return NextResponse.json(
                { success: false, message: 'Invalid product ID' },
                { status: 400 }
            );
        }

        // Check if product already exists in the list
        const existingItemIndex = birthList.items.findIndex(
            item => item.product.toString() === product
        );

        if (existingItemIndex !== -1) {
            // Update quantity if product already exists
            birthList.items[existingItemIndex].quantity += parseInt(quantity);
            birthList.items[existingItemIndex].priority = parseInt(priority);
        } else {
            // Add new product to the list
            birthList.items.push({
                product,
                quantity: parseInt(quantity),
                reserved: 0,
                priority: parseInt(priority)
            });
        }

        // Save the updated birth list
        await birthList.save();

        // Return the updated birth list with populated items
        const updatedBirthList = await BirthList.findById(id)
            .populate('items.product')
            .select('items');

        return NextResponse.json({
            success: true,
            message: 'Product added to birth list successfully',
            data: updatedBirthList.items
        });
    } catch (error) {
        console.error('Error adding product to birth list:', error);
        return NextResponse.json(
            { success: false, message: 'Error adding product to birth list', error: error.message },
            { status: 500 }
        );
    }
}

// PUT: Update multiple items in the birth list at once
export async function PUT(request, { params }) {
    try {
        // Ensure params is properly awaited
        const resolvedParams = await Promise.resolve(params);
        const { id } = resolvedParams;

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

        // Parse request body - expecting an array of items
        const { items } = await request.json();

        if (!Array.isArray(items)) {
            return NextResponse.json(
                { success: false, message: 'Invalid items format. Expected an array of items.' },
                { status: 400 }
            );
        }

        // Replace all items with the new list
        birthList.items = items.map(item => ({
            product: item.product,
            quantity: parseInt(item.quantity),
            reserved: parseInt(item.reserved || 0),
            priority: parseInt(item.priority || 2)
        }));

        // Save the updated birth list
        await birthList.save();

        // Return the updated birth list with populated items
        const updatedBirthList = await BirthList.findById(id)
            .populate('items.product')
            .select('items');

        return NextResponse.json({
            success: true,
            message: 'Birth list items updated successfully',
            data: updatedBirthList.items
        });
    } catch (error) {
        console.error('Error updating birth list items:', error);
        return NextResponse.json(
            { success: false, message: 'Error updating birth list items', error: error.message },
            { status: 500 }
        );
    }
}

// DELETE: Remove a product from the birth list
export async function DELETE(request, { params }) {
    try {
        // Ensure params is properly awaited
        const resolvedParams = await Promise.resolve(params);
        const { id } = resolvedParams;
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

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

        if (!productId || !isValidObjectId(productId)) {
            return NextResponse.json(
                { success: false, message: 'Invalid product ID' },
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

        // Remove the product from the items array
        birthList.items = birthList.items.filter(
            item => item.product.toString() !== productId
        );

        // Save the updated birth list
        await birthList.save();

        // Return the updated birth list with populated items
        const updatedBirthList = await BirthList.findById(id)
            .populate('items.product')
            .select('items');

        return NextResponse.json({
            success: true,
            message: 'Product removed from birth list successfully',
            data: updatedBirthList.items
        });
    } catch (error) {
        console.error('Error removing product from birth list:', error);
        return NextResponse.json(
            { success: false, message: 'Error removing product from birth list', error: error.message },
            { status: 500 }
        );
    }
} 