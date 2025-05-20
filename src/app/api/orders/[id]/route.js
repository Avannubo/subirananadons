import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Order from '@/models/Order';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

// Get a single order by ID
export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        console.log('Order Detail API - Session:', session);
        console.log('Order Detail API - Request Params:', params);

        if (!session?.user?.id) {
            console.error('Order Detail API - No user ID in session');
            return NextResponse.json({
                success: false,
                message: 'Unauthorized'
            }, { status: 401 });
        }

        await dbConnect();
        const { id } = params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.error('Order Detail API - Invalid order ID:', id);
            return NextResponse.json({
                success: false,
                message: 'Invalid order ID'
            }, { status: 400 });
        }

        const order = await Order.findById(id).populate('user', 'name email');
        console.log('Order Detail API - Order found:', order ? 'Yes' : 'No');

        // Check if order exists
        if (!order) {
            console.error('Order Detail API - Order not found:', id);
            return NextResponse.json({
                success: false,
                message: 'Order not found'
            }, { status: 404 });
        }

        // Check if user is authorized to view this order
        const isAdmin = session.user.role === 'admin';
        const isOrderOwner = order.user?._id.toString() === session.user.id;
        console.log('Order Detail API - Auth check:', { isAdmin, isOrderOwner, userId: session.user.id, orderUserId: order.user?._id.toString() });

        if (!isAdmin && !isOrderOwner) {
            console.error('Order Detail API - User not authorized to view order');
            return NextResponse.json({
                success: false,
                message: 'You are not authorized to view this order'
            }, { status: 403 });
        }

        return NextResponse.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch order',
            error: error.message
        }, { status: 500 });
    }
}

// Update an order
export async function PATCH(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({
                success: false,
                message: 'Unauthorized'
            }, { status: 401 });
        }

        const isAdmin = session.user.role === 'admin';
        if (!isAdmin) {
            return NextResponse.json({
                success: false,
                message: 'Only administrators can update orders'
            }, { status: 403 });
        }

        await dbConnect();
        const { id } = params;
        const data = await request.json();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid order ID'
            }, { status: 400 });
        }

        // Validate the update data
        const allowedFields = ['status', 'trackingNumber', 'notes', 'paymentDetails'];
        const updateData = {};

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updateData[field] = data[field];
            }
        }

        // If no valid fields to update
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({
                success: false,
                message: 'No valid fields to update'
            }, { status: 400 });
        }

        // Find and update the order
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        // Check if order exists
        if (!updatedOrder) {
            return NextResponse.json({
                success: false,
                message: 'Order not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Order updated successfully',
            order: updatedOrder
        });
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to update order',
            error: error.message
        }, { status: 500 });
    }
}

// Delete an order
export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({
                success: false,
                message: 'Unauthorized'
            }, { status: 401 });
        }

        const isAdmin = session.user.role === 'admin';
        if (!isAdmin) {
            return NextResponse.json({
                success: false,
                message: 'Only administrators can delete orders'
            }, { status: 403 });
        }

        await dbConnect();
        const { id } = params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid order ID'
            }, { status: 400 });
        }

        // Find and delete the order
        const deletedOrder = await Order.findByIdAndDelete(id);

        // Check if order exists
        if (!deletedOrder) {
            return NextResponse.json({
                success: false,
                message: 'Order not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Order deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting order:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to delete order',
            error: error.message
        }, { status: 500 });
    }
} 