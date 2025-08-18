import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import mongoose from 'mongoose';

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        console.log('[order-count] Received userId:', userId);

        if (!userId) {
            return NextResponse.json({ message: 'Missing userId parameter' }, { status: 400 });
        }

        // Create query to match either string or ObjectId format of userId
        const query = {
            user: userId,
            status: { $ne: 'cancelled' } // Exclude cancelled orders
        };

        console.log('[order-count] Query:', JSON.stringify(query));

        const count = await Order.countDocuments(query);
        console.log('[order-count] Found orders:', count);

        return NextResponse.json({ count });
    } catch (error) {
        console.error('[order-count] Error:', error);
        return NextResponse.json({
            message: error.message || 'Error fetching order count',
            error: error.toString()
        }, { status: 500 });
    }
}

// Add POST method for flexibility
export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { userId, client, email } = body;

        if (!userId && !email) {
            return NextResponse.json({ message: 'Missing both userId and email in request body' }, { status: 400 });
        }

        // Convert userId to ObjectId if it's a valid format
        let userIdQuery;
        try {
            userIdQuery = new mongoose.Types.ObjectId(userId);
        } catch (err) {
            userIdQuery = userId;
        }

        // First, let's find a sample order to debug
        const sampleOrder = await Order.findOne().lean();
        console.log('[order-count] Sample order structure:', JSON.stringify(sampleOrder, null, 2));

        // Create a more comprehensive query using $or to check multiple possible fields
        const query = {
            $or: [
                { user: userIdQuery },
                { 'shippingAddress.email': client?.email },  // Check shipping email
                { 'items.buyerInfo.userId': userIdQuery },   // Check buyer info
                { 'items.buyerInfo.email': client?.email }   // Check buyer email
            ],
            status: { $nin: ['cancelado', 'cancelled'] }     // Check both status variations
        };

        console.log('[order-count] UserId:', userId);
        console.log('[order-count] Query:', JSON.stringify(query, null, 2));

        // Find orders first to debug
        const orders = await Order.find(query).lean();
        console.log('[order-count] Found orders:', orders.length);
        console.log('[order-count] Order IDs:', orders.map(o => o._id));

        const count = orders.length;
        return NextResponse.json({ count });
    } catch (error) {
        console.error('[order-count] Error:', error);
        return NextResponse.json({
            message: error.message || 'Error fetching order count',
            error: error.toString()
        }, { status: 500 });
    }
}
