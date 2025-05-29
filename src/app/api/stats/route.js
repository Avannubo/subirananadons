'use server';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';

export async function GET() {
    try {
        await dbConnect();

        // Get current month data
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Get previous month data
        const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // Current month stats
        const currentMonthSales = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$total' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Previous month stats for comparison
        const lastMonthSales = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: firstDayOfLastMonth, $lte: lastDayOfLastMonth },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$total' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get monthly sales data for the chart (last 6 months)
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        const monthlySales = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    total: { $sum: '$total' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Get total customers and products
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const lastMonthCustomers = await User.countDocuments({
            role: 'customer',
            createdAt: { $gte: firstDayOfLastMonth, $lte: lastDayOfLastMonth }
        });

        const totalProducts = await Product.countDocuments();
        const lastMonthProducts = await Product.countDocuments({
            createdAt: { $gte: firstDayOfLastMonth, $lte: lastDayOfLastMonth }
        });

        // Calculate percentage changes
        const currentMonthTotal = currentMonthSales[0]?.total || 0;
        const lastMonthTotal = lastMonthSales[0]?.total || 0;
        const salesPercentChange = lastMonthTotal ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

        const currentMonthOrders = currentMonthSales[0]?.count || 0;
        const lastMonthOrders = lastMonthSales[0]?.count || 0;
        const ordersPercentChange = lastMonthOrders ? ((currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100 : 0;

        // Transform monthly sales data for the chart
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const chartData = {
            labels: monthlySales.map(item => monthNames[item._id.month - 1]),
            salesData: monthlySales.map(item => item.total),
            ordersData: monthlySales.map(item => item.count)
        };

        return NextResponse.json({
            success: true,
            data: {
                currentMonth: {
                    sales: currentMonthTotal,
                    orders: currentMonthOrders,
                    customers: totalCustomers,
                    products: totalProducts
                },
                percentChanges: {
                    sales: salesPercentChange,
                    orders: ordersPercentChange,
                    customers: ((totalCustomers - lastMonthCustomers) / lastMonthCustomers) * 100,
                    products: ((totalProducts - lastMonthProducts) / lastMonthProducts) * 100
                },
                chartData
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
