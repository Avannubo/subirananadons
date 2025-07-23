// pages/api/users/index.js
import { NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';
import { populateUser } from '@/utils/populateUser';

export async function GET(request) {
    await dbConnect();

    try {
        // Get query parameters
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const search = searchParams.get('search') || '';

        // Build query
        const query = {};
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Get paginated results
        const users = await populateUser(
            User.find(query)
                .select('-password -__v')
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ createdAt: -1 })
        );

        // Get total count for pagination
        const total = await User.countDocuments(query);

        return NextResponse.json({
            success: true,
            data: users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }
}

export async function POST(request) {
    await dbConnect();

    try {
        const { firstName, lastName, email, password } = await request.json();

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already in use' },
                { status: 400 }
            );
        }

        // Create new user
        const user = await User.create({
            firstName,
            lastName,
            email,
            password
        });

        // Return without password
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;
        delete userWithoutPassword.__v;

        return NextResponse.json(
            { success: true, user: userWithoutPassword },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }
}