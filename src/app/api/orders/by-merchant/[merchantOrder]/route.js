import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const merchantOrder = params.merchantOrder;
        if (!merchantOrder) {
            return NextResponse.json({ success: false, message: 'Missing merchantOrder parameter' }, { status: 400 });
        }
        // Find the order by MerchantOrder (case-insensitive, string match)
        const order = await Order.findOne({ MerchantOrder: { $regex: `^${merchantOrder}$`, $options: 'i' } });
        if (!order) {
            return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, order });
    } catch (error) {
        console.error('Error fetching order by merchantOrder:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
