import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        if (!userId) {
            return NextResponse.json({ message: 'Missing userId parameter' }, { status: 400 });
        }
        const count = await Order.countDocuments({ user: userId });
        return NextResponse.json({ count });
    } catch (error) {
        return NextResponse.json({ message: error.message || 'Error fetching order count' }, { status: 500 });
    }
}
