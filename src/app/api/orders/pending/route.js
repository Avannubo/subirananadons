import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PendingOrder from '@/models/PendingOrder';

// Create a pending order
export async function POST(request) {
    try {
        await dbConnect();
        const data = await request.json();
        const { orderData, sessionId, merchantOrder, userId } = data;

        if (!orderData) {
            return NextResponse.json({ error: 'Missing orderData' }, { status: 400 });
        }
        if (!merchantOrder) {
            return NextResponse.json({ error: 'Missing merchantOrder' }, { status: 400 });
        }

        const pendingOrder = await PendingOrder.create({
            merchantOrder,
            orderData,
            sessionId: sessionId || Date.now().toString(),
            userId: userId || undefined,
            status: 'pending'
        });

        return NextResponse.json({ pendingOrderId: pendingOrder._id, merchantOrder }, { status: 201 });
    } catch (error) {
        console.error('Error creating pending order:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
