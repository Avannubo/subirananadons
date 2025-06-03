import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import crypto from 'crypto';

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
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

        // Save reset token to user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();        // Create reset URL with dynamic route
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${resetToken}`;

        // Log the URL for testing purposes (remove in production)
        console.log('\x1b[32m%s\x1b[0m', '🔐 Test Reset Password URL:', resetUrl);

        // TODO: Replace this with your email sending logic
        // Example using a hypothetical email service:
        /*
        await sendEmail({
            to: email,
            subject: 'Restablecimiento de contraseña - Subirana Nadons',
            html: `
                <h1>Restablecimiento de contraseña</h1>
                <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
                <p><a href="${resetUrl}">Restablecer contraseña</a></p>
                <p><strong>IMPORTANTE:</strong> Este es un enlace de un solo uso y expirará en 1 hora. 
                Si necesitas restablecer tu contraseña nuevamente, deberás solicitar un nuevo enlace.</p>
                <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este mensaje.</p>
            `
        });
        */

        // For development, log the URL
        console.log('Password reset URL:', resetUrl);

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
