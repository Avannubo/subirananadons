import { NextResponse } from 'next/server';
import EmailService from '@/services/EmailService';

export async function GET(request) {
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Test endpoint only available in development' }, { status: 403 });
    }

    try {
        // Get email from query params
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({
                success: false,
                message: 'Email is required'
            }, { status: 400 });
        }

        // Generate a test token
        const testToken = 'test-token-' + Date.now();

        // Send test email
        await EmailService.sendPasswordResetEmail(email, testToken);

        return NextResponse.json({
            success: true,
            message: 'Test reset password email sent',
            token: testToken
        });
    } catch (error) {
        console.error('Test email error:', error);
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}
