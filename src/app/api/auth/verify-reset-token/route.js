import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(request) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json(
                { message: 'Token is required' },
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

        return NextResponse.json({ message: 'Token is valid' });
    } catch (error) {
        console.error('Token verification error:', error);
        return NextResponse.json(
            { message: 'An error occurred while verifying the token' },
            { status: 500 }
        );
    }
}
