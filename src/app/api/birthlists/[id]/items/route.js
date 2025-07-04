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
        console.log(birthList);

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
        const { id } = params;

        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { success: false, message: 'Invalid list ID format' },
                { status: 400 }
            );
        }

        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

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
        const { product: productId, quantity = 1, priority = 2, state = 0 } = await request.json();

        if (!productId || !isValidObjectId(productId)) {
            return NextResponse.json(
                { success: false, message: 'Invalid product ID' },
                { status: 400 }
            );
        }

        // Fetch the full product details to create a snapshot
        const productDetails = await Product.findById(productId);
        if (!productDetails) {
            return NextResponse.json(
                { success: false, message: 'Product not found' },
                { status: 404 }
            );
        }

        // Create product snapshot
        const productSnapshot = {
            name: productDetails.name,
            reference: productDetails.reference,
            price: productDetails.price || productDetails.priceValue,
            image: productDetails.image,
            brand: productDetails.brand,
            category: productDetails.category
        };

        // Check if product already exists in the list
        const existingItemIndex = birthList.items.findIndex(
            item => item.product.toString() === productId
        );

        if (existingItemIndex !== -1) {
            // Update quantity if product already exists
            birthList.items[existingItemIndex].quantity = parseInt(quantity);
            birthList.items[existingItemIndex].priority = parseInt(priority);
            birthList.items[existingItemIndex].state = parseInt(state);
            // Do not update product snapshot to preserve original data
        } else {            // Add new product to the list with snapshot
            birthList.items.push({
                product: productId,
                productSnapshot,
                quantity: parseInt(quantity),
                state: parseInt(state),
                reserved: 0,
                priority: parseInt(priority)
            });

            // If status is Completada and adding new item, change to Activa
            if (birthList.status === 'Completada') {
                birthList.status = 'Activa';
            }
        }

        // Save the updated birth list - status will be automatically checked by pre-save hook
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
        const { id } = params;

        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { success: false, message: 'Invalid list ID format' },
                { status: 400 }
            );
        }

        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        // Get birth list and validate
        let birthList = await BirthList.findById(id);

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
        const { items } = await request.json();

        if (!Array.isArray(items)) {
            return NextResponse.json(
                { success: false, message: 'Items must be an array' },
                { status: 400 }
            );
        }

        try {
            // Map through items and only update allowed fields
            birthList.items = await Promise.all(birthList.items.map(async existingItem => {
                const updatedItem = items.find(i =>
                    i._id && i._id.toString() === existingItem._id.toString()
                );

                if (updatedItem) {
                    // Only update mutable fields, preserve product and snapshot data
                    return {
                        ...existingItem.toObject(),
                        quantity: parseInt(updatedItem.quantity || existingItem.quantity),
                        state: parseInt(updatedItem.state ?? existingItem.state),
                        priority: parseInt(updatedItem.priority || existingItem.priority),
                        userData: updatedItem.userData || existingItem.userData
                    };
                }
                return existingItem;
            }));

            // Handle new items (if any)
            const existingIds = birthList.items.map(item => item._id.toString());
            const newItems = items.filter(item => !item._id || !existingIds.includes(item._id.toString())); for (const newItem of newItems) {
                if (!newItem.product || !isValidObjectId(newItem.product)) continue;

                // Fetch product details for new items
                const productDetails = await Product.findById(newItem.product);
                if (!productDetails) continue;

                // Create snapshot for new item
                const productSnapshot = {
                    name: productDetails.name,
                    reference: productDetails.reference,
                    price: productDetails.price || productDetails.priceValue,
                    image: productDetails.image,
                    brand: productDetails.brand,
                    category: productDetails.category
                };

                birthList.items.push({
                    product: newItem.product,
                    productSnapshot,
                    quantity: parseInt(newItem.quantity || 1),
                    state: parseInt(newItem.state || 0),
                    priority: parseInt(newItem.priority || 2),
                    userData: newItem.userData || null
                });
            }

            // If status is Completada and adding new items, change to Activa
            if (birthList.status === 'Completada' && newItems.length > 0) {
                birthList.status = 'Activa';
            }

            // Save the changes - status will be automatically checked by pre-save hook
            await birthList.save();

            // Fetch the updated list with populated products (for backwards compatibility)
            const updatedBirthList = await BirthList.findById(id)
                .populate('items.product');

            return NextResponse.json({
                success: true,
                message: 'Items updated successfully',
                data: updatedBirthList.items
            });
        } catch (error) {
            console.error('Error updating items:', error);
            return NextResponse.json(
                { success: false, message: 'Error updating items: ' + error.message },
                { status: 500 }
            );
        }
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
        const { id } = resolvedParams; const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');
        const itemId = searchParams.get('itemId');

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

        if (!productId && !itemId) {
            return NextResponse.json(
                { success: false, message: 'Either product ID or item ID is required' },
                { status: 400 }
            );
        }

        if ((productId && !isValidObjectId(productId)) || (itemId && !isValidObjectId(itemId))) {
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

        // Check if user has permission to update this list
        if (!hasAccess(birthList, session.user.id, session.user.role)) {
            return NextResponse.json(
                { success: false, message: 'Forbidden: You do not have permission to update this birth list' },
                { status: 403 }
            );
        }        // Remove the item from the items array
        birthList.items = birthList.items.filter(item => {
            if (itemId) {
                return item._id.toString() !== itemId;
            }
            // Fall back to removing by product ID if no item ID is provided
            return item.product.toString() !== productId;
        });

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