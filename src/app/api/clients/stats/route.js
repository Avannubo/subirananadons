import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET(request) {
    try {
        // Check authorization
        const session = await getServerSession(authOptions);
        if (!session?.user?.role === 'admin') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized: Admin access required' },
                { status: 403 }
            );
        }

        // Connect to database
        await dbConnect();

        // Get total clients count
        const totalClients = await User.countDocuments({ role: 'user' });

        // Get active clients count
        const activeClients = await User.countDocuments({
            role: 'user',
            emailVerified: { $ne: null }
        });

        // Get newsletter subscribers count
        const newsletterSubscribers = await User.countDocuments({
            role: 'user',
            newsletter: true
        });

        // Get partner offers subscribers count
        const partnerOffersSubscribers = await User.countDocuments({
            role: 'user',
            partnerOffers: true
        });

        // Calculate average age (if birth dates are available)
        // In this example, we'll use a placeholder value
        const averageAge = 38;

        // Calculate orders per client (would typically involve joining with an Orders collection)
        // Here we'll use a placeholder value
        const ordersPerClient = 1.5;

        return NextResponse.json({
            success: true,
            stats: {
                totalClients,
                activeClients,
                inactiveClients: totalClients - activeClients,
                newsletterSubscribers,
                partnerOffersSubscribers,
                averageAge,
                ordersPerClient
            }
        });
    } catch (error) {
        console.error('Error fetching client stats:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
} 