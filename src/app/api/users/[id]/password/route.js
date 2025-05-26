import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';
export async function PUT(request, context) {
    try {        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.isAdmin) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get and validate params
        const params = await Promise.resolve(context.params);
        const id = params.id;
        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Missing user ID' },
                { status: 400 }
            );
        }

        const { password } = await request.json();
        await dbConnect();
        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Update the user's password
        const updatedUser = await User.findByIdAndUpdate(
            id,
            {
                password: hashedPassword,
                updatedAt: new Date()
            },
            { new: true }
        ).select('-password');
        if (!updatedUser) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }
        return NextResponse.json({
            success: true,
            message: 'Password updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error updating password:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update password' },
            { status: 500 }
        );
    }
}
