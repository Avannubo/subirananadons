import { NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';

export async function POST(request) {
    await dbConnect();

    try {
        const { name, email, password } = await request.json();

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 400 }
            );
        }

        // Split full name into first and last names
        const nameParts = name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Create new user with only essential fields
        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            // All other fields will use their default values from the schema
        });

        return NextResponse.json({
            success: true,
            user: {
                _id: user._id,
                name: `${user.firstName} ${user.lastName}`.trim(),
                email: user.email,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        return NextResponse.json(
            { error: error.message || 'Registration failed' },
            { status: 400 }
        );
    }
}