import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
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
        if (searchName || searchLastName) {
            const nameParts = [];
            if (searchName) nameParts.push(searchName);
            if (searchLastName) nameParts.push(searchLastName);
            const nameRegex = nameParts.join(' ');
            query.name = { $regex: nameRegex, $options: 'i' };
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
        // Execute query without pagination
        const users = await User.find(query)
            .select('-password -resetPasswordToken -resetPasswordExpires -__v')
            .sort({ createdAt: -1 });
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
        // Return all clients
        return NextResponse.json({
            success: true,
            clients
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
        const { name, lastName, email, password, active, newsletter, partnerOffers } = data;
        // Validate required fields
        if (!name || !lastName || !email) {
            return NextResponse.json(
                { success: false, message: 'Name, last name and email are required' },
                { status: 400 }
            );
        }
        // Validate password when creating new user
        if (!password) {
            return NextResponse.json(
                { success: false, message: 'Password is required for new users' },
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
        // Hash the provided password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // Create new user
        const newUser = new User({
            name: `${name} ${lastName}`,
            email,
            password: hashedPassword,
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