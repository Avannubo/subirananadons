import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is authenticated
        if (!session?.user?.id) {
            return NextResponse.json(
                { message: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Connect to the database
        await dbConnect();

        // Get request body
        const data = await request.json();
        const { name, email, birthDate, image, newsletter, partnerOffers, password } = data;

        console.log('Update user request:', { userId: session.user.id, name, email, hasImage: !!image });

        // Find user
        const user = await User.findById(session.user.id);
        if (!user) {
            console.error('User not found:', session.user.id);
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        // Check if email is already in use by another user
        if (email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser && existingUser._id.toString() !== user._id.toString()) {
                return NextResponse.json(
                    { message: 'Email already in use' },
                    { status: 400 }
                );
            }
        }

        // Update user data
        user.name = name || user.name;
        user.email = email || user.email;

        // Only update these fields if they are provided
        if (birthDate !== undefined) user.birthDate = birthDate;
        if (image !== undefined) user.image = image;
        if (newsletter !== undefined) user.newsletter = newsletter;
        if (partnerOffers !== undefined) user.partnerOffers = partnerOffers;

        // Update password if provided
        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        // Save updated user
        await user.save();
        console.log('User updated successfully:', user._id);

        // Return success response
        return NextResponse.json(
            {
                message: 'Profile updated successfully',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    birthDate: user.birthDate,
                    newsletter: user.newsletter,
                    partnerOffers: user.partnerOffers
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json(
            { message: 'Error updating profile', error: error.message },
            { status: 500 }
        );
    }
}

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is authenticated
        if (!session?.user?.id) {
            return NextResponse.json(
                { message: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Connect to the database
        await dbConnect();

        // Find user
        const user = await User.findById(session.user.id).select('-password');
        if (!user) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        // Return user data
        return NextResponse.json(
            {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    birthDate: user.birthDate,
                    newsletter: user.newsletter,
                    partnerOffers: user.partnerOffers
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json(
            { message: 'Error fetching profile', error: error.message },
            { status: 500 }
        );
    }
} 