import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(request) {
    try {
        await dbConnect();

        const { name, email, password } = await request.json();

        // Validate input
        if (!name || !email || !password) {
            return NextResponse.json(
                { message: 'Please provide all required fields' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { message: 'User with this email already exists' },
                { status: 400 }
            );
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password,
        });

        // Remove password from response
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
        };

        return NextResponse.json(
            { message: 'User registered successfully', user: userResponse },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { message: error.message || 'Error registering user' },
            { status: 500 }
        );
    }
} 