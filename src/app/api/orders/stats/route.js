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

        // Calculate completed orders (shipped or delivered)
        const completedOrders = currentPeriodOrders.filter(
            order => order.status === 'shipped' || order.status === 'delivered'
        ).length;

        const prevCompletedOrders = prevPeriodOrders.filter(
            order => order.status === 'shipped' || order.status === 'delivered'
        ).length;

        // Calculate completed orders trend
        const completedOrdersTrend = prevCompletedOrders === 0
            ? 100
            : Math.round(((completedOrders - prevCompletedOrders) / prevCompletedOrders) * 100);

        // Calculate pending orders
        const pendingOrders = currentPeriodOrders.filter(
            order => order.status === 'pending' || order.status === 'processing'
        ).length;

        const prevPendingOrders = prevPeriodOrders.filter(
            order => order.status === 'pending' || order.status === 'processing'
        ).length;

        // Calculate pending orders trend
        const pendingOrdersTrend = prevPendingOrders === 0
            ? 100
            : Math.round(((pendingOrders - prevPendingOrders) / prevPendingOrders) * 100);

        // For customer queries, we would need to add a new model
        // For now, let's simulate this data
        const customerQueries = Math.floor(totalOrders * 1.2);
        const prevCustomerQueries = Math.floor(prevTotalOrders * 1.2);

        // Calculate customer queries trend
        const customerQueriesTrend = prevCustomerQueries === 0
            ? 100
            : Math.round(((customerQueries - prevCustomerQueries) / prevCustomerQueries) * 100);

        return NextResponse.json({
            success: true,
            stats: {
                totalOrders,
                totalOrdersTrend,
                completedOrders,
                completedOrdersTrend,
                pendingOrders,
                pendingOrdersTrend,
                customerQueries,
                customerQueriesTrend
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