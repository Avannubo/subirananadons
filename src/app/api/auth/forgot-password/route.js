import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import crypto from 'crypto';
import EmailService from '@/services/EmailService';

export async function POST(request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { message: 'Email is required' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Find user by email
        const user = await User.findOne({ email });

        // Even if we don't find the user, we send a success response for security
        if (!user) {
            return NextResponse.json(
                { message: 'If the email exists, you will receive recovery instructions' },
                { status: 200 }
            );
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now        // Save reset token to user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        // Send password reset email
        await EmailService.sendPasswordResetEmail(email, resetToken);

        return NextResponse.json(
            { message: 'If the email exists, you will receive recovery instructions' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Password reset error:', error);
        return NextResponse.json(
            { message: 'An error occurred while processing your request' },
            { status: 500 }
        );
    }
}
