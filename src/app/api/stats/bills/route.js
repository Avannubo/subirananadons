import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';

export async function GET() {
    try {
        console.log('Connecting to database...');
        await dbConnect();
        console.log('Database connected.');

        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        // Get counts for the current month
        const [totalBills, paidBills, pendingBills, notificationsSent] = await Promise.all([
            Order.countDocuments({
                createdAt: {
                    $gte: firstDayOfMonth,
                    $lte: lastDayOfMonth
                },
                'invoice.number': { $exists: true }
            }),
            Order.countDocuments({
                createdAt: {
                    $gte: firstDayOfMonth,
                    $lte: lastDayOfMonth
                },
                'invoice.number': { $exists: true },
                'payment.status': 'paid'
            }),
            Order.countDocuments({
                createdAt: {
                    $gte: firstDayOfMonth,
                    $lte: lastDayOfMonth
                },
                'invoice.number': { $exists: true },
                'payment.status': { $ne: 'paid' }
            }),
            Order.countDocuments({
                createdAt: {
                    $gte: firstDayOfMonth,
                    $lte: lastDayOfMonth
                },
                'invoice.number': { $exists: true },
                'notifications.invoice': { $exists: true }
            })
        ]);
        console.log({
            totalBills,
            paidBills,
            pendingBills,
            notificationsSent
        });

        return NextResponse.json({
            success: true,
            data: {
                totalBills,
                paidBills,
                pendingBills,
                notificationsSent
            }
        });
    } catch (error) {
        console.error('Error fetching billing stats:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch billing statistics' },
            { status: 500 }
        );
    }
}
