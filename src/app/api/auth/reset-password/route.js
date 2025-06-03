import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(request) {
    try {
        const { token, password } = await request.json();

        // Log the token being used for password reset
        console.log('\x1b[36m%s\x1b[0m', '🔑 Password Reset Attempt with Token:', token);

        if (!token || !password) {
            return NextResponse.json(
                { message: 'Token and password are required' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Find user with valid token and not expired
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return NextResponse.json(
                { message: 'Invalid or expired token' },
                { status: 400 }
            );
        }

        // Update password
        user.password = password;
        // Clear reset token and expiry
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.markModified('password'); // Ensure mongoose knows the password was modified

        await user.save();

        return NextResponse.json({
            message: 'Password has been reset successfully',
        });
    } catch (error) {
        console.error('Password reset error:', error);
        return NextResponse.json(
            { message: 'An error occurred while resetting the password' },
            { status: 500 }
        );
    }
}
