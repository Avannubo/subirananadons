import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import BirthList from '@/models/BirthList';

export async function GET(request) {
    try {
        // Check if user is authenticated
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized: Authentication required' },
                { status: 401 }
            );
        }

        // Check if user is admin (only admins can see all stats)
        if (session.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, message: 'Forbidden: Admin access required' },
                { status: 403 }
            );
        }

        await dbConnect();

        // Get the current date
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Calculate stats
        const totalLists = await BirthList.countDocuments();
        const activeLists = await BirthList.countDocuments({ status: 'Activa' });
        const completedLists = await BirthList.countDocuments({ status: 'Completada' });
        const canceledLists = await BirthList.countDocuments({ status: 'InActiva' });

        // Count lists created this month
        const listsThisMonth = await BirthList.countDocuments({
            createdAt: { $gte: firstDayOfMonth }
        });

        // Count active lists created this month
        const activeListsThisMonth = await BirthList.countDocuments({
            status: 'Activa',
            createdAt: { $gte: firstDayOfMonth }
        });

        // Count completed lists this month
        const completedListsThisMonth = await BirthList.countDocuments({
            status: 'Completada',
            createdAt: { $gte: firstDayOfMonth }
        });

        // Count canceled lists this month
        const canceledListsThisMonth = await BirthList.countDocuments({
            status: 'InActiva',
            createdAt: { $gte: firstDayOfMonth }
        });

        // Format response
        const stats = {
            totalLists,
            activeLists,
            completedLists,
            canceledLists,
            listsThisMonth,
            activeListsThisMonth,
            completedListsThisMonth,
            canceledListsThisMonth
        };

        return NextResponse.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Error fetching birth list statistics:', error);
        return NextResponse.json(
            { success: false, message: 'Error fetching birth list statistics', error: error.message },
            { status: 500 }
        );
    }
} 