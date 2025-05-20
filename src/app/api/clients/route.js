import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

// Get all clients (users with role 'user')
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

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const searchId = searchParams.get('searchId') || '';
        const searchName = searchParams.get('searchName') || '';
        const searchLastName = searchParams.get('searchLastName') || '';
        const searchEmail = searchParams.get('searchEmail') || '';
        const active = searchParams.get('active');
        const newsletter = searchParams.get('newsletter');
        const partnerOffers = searchParams.get('partnerOffers');

        // Build query
        const query = { role: 'user' };

        // Add search filters
        if (searchId) {
            // MongoDB ObjectId is 24 hex characters. If searchId is valid, search by _id, otherwise ignore
            if (/^[0-9a-fA-F]{24}$/.test(searchId)) {
                query._id = searchId;
            }
        }

        if (searchName) {
            query.name = { $regex: searchName, $options: 'i' };
        }

        if (searchEmail) {
            query.email = { $regex: searchEmail, $options: 'i' };
        }

        // Handle boolean filters
        if (active !== null && active !== undefined) {
            query.emailVerified = active === 'true' ? { $ne: null } : null;
        }

        if (newsletter !== null && newsletter !== undefined) {
            query.newsletter = newsletter === 'true';
        }

        if (partnerOffers !== null && partnerOffers !== undefined) {
            query.partnerOffers = partnerOffers === 'true';
        }

        // Execute query with pagination
        const users = await User.find(query)
            .select('-password -resetPasswordToken -resetPasswordExpires -__v')
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        // Get total count for pagination
        const total = await User.countDocuments(query);

        // Transform data to client format
        const clients = users.map(user => ({
            id: user._id.toString(),
            name: user.name.split(' ')[0] || '',
            lastName: user.name.split(' ').slice(1).join(' ') || '',
            email: user.email,
            registrationDate: user.createdAt.toISOString().split('T')[0],
            active: user.emailVerified !== null,
            newsletter: user.newsletter || false,
            partnerOffers: user.partnerOffers || false,
            sales: 0 // This would need to come from an Orders collection in a real app
        }));

        // Return paginated results
        return NextResponse.json({
            success: true,
            clients,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                limit
            }
        });
    } catch (error) {
        console.error('Error fetching clients:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// Create a new client (user with role 'user')
export async function POST(request) {
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

        // Get request body
        const data = await request.json();
        const { name, lastName, email, active, newsletter, partnerOffers } = data;

        // Validate required fields
        if (!name || !lastName || !email) {
            return NextResponse.json(
                { success: false, message: 'Name, last name and email are required' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { success: false, message: 'Email already in use' },
                { status: 400 }
            );
        }

        // Create temporary password (in a real app, you'd send an email to the user to set their password)
        const tempPassword = Math.random().toString(36).slice(-8);

        // Create new user
        const newUser = new User({
            name: `${name} ${lastName}`,
            email,
            password: tempPassword,
            role: 'user',
            emailVerified: active ? new Date() : null,
            newsletter: newsletter || false,
            partnerOffers: partnerOffers || false
        });

        await newUser.save();

        // Transform to client format for response
        const client = {
            id: newUser._id.toString(),
            name,
            lastName,
            email,
            registrationDate: newUser.createdAt.toISOString().split('T')[0],
            active: active || false,
            newsletter: newsletter || false,
            partnerOffers: partnerOffers || false,
            sales: 0
        };

        return NextResponse.json({
            success: true,
            message: 'Client created successfully',
            client
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating client:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
} 