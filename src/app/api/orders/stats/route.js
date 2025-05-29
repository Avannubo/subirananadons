import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Order from '@/models/Order';
import dbConnect from '@/lib/dbConnect';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({
                success: false,
                message: 'Unauthorized'
            }, { status: 401 });
        }

        // Only admin users can access statistics
        const isAdmin = session.user.role === 'admin';
        if (!isAdmin) {
            return NextResponse.json({
                success: false,
                message: 'Only administrators can view statistics'
            }, { status: 403 });
        }

        await dbConnect();

        // Get the period from query params (default to 30 days)
        const { searchParams } = new URL(request.url);
        const period = parseInt(searchParams.get('period')) || 30;

        // Calculate the date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period);

        // Calculate previous period for trend comparison
        const prevStartDate = new Date(startDate);
        prevStartDate.setDate(prevStartDate.getDate() - period);

        // Get orders in the current period
        const currentPeriodOrders = await Order.find({
            createdAt: { $gte: startDate, $lte: endDate }
        });

        // Get orders in the previous period
        const prevPeriodOrders = await Order.find({
            createdAt: { $gte: prevStartDate, $lte: startDate }
        });

        // Calculate total orders
        const totalOrders = currentPeriodOrders.length;
        const prevTotalOrders = prevPeriodOrders.length;

        // Calculate total orders trend
        const totalOrdersTrend = prevTotalOrders === 0
            ? 100
            : Math.round(((totalOrders - prevTotalOrders) / prevTotalOrders) * 100);

        // Calculate accepted orders
        const acceptedOrders = currentPeriodOrders.filter(
            order => order.status === 'processing'
        ).length;

        const prevAcceptedOrders = prevPeriodOrders.filter(
            order => order.status === 'processing'
        ).length;

        // Calculate accepted orders trend
        const acceptedOrdersTrend = prevAcceptedOrders === 0
            ? 100
            : Math.round(((acceptedOrders - prevAcceptedOrders) / prevAcceptedOrders) * 100);

        // Calculate cancelled orders
        const cancelledOrders = currentPeriodOrders.filter(
            order => order.status === 'cancelled'
        ).length;

        const prevCancelledOrders = prevPeriodOrders.filter(
            order => order.status === 'cancelled'
        ).length;

        // Calculate cancelled orders trend
        const cancelledOrdersTrend = prevCancelledOrders === 0
            ? 0
            : Math.round(((cancelledOrders - prevCancelledOrders) / prevCancelledOrders) * 100);

        return NextResponse.json({
            success: true,
            stats: {
                totalOrders,
                totalOrdersTrend,
                acceptedOrders,
                acceptedOrdersTrend,
                cancelledOrders,
                cancelledOrdersTrend
            }
        });
    } catch (error) {
        console.error('Error fetching order stats:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch order statistics',
            error: error.message
        }, { status: 500 });
    }
}