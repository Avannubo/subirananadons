import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
export async function POST(request) {
    try {
        const { token, password } = await request.json();
        if (!token || !password) {
            return NextResponse.json(
                { message: 'El token i la contrasenya són obligatoris' },
                { status: 400 }
            );
        }
        if (password.length < 6) {
            return NextResponse.json(
                { message: 'La contrasenya ha de tenir almenys 6 caràcters' },
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
                { message: 'Token invàlid o caducat' },
                { status: 400 }
            );
        }
        // Update password (it will be hashed by the User model pre-save hook)
        user.password = password;        // Clear reset token and expiry
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.markModified('password'); // Ensure mongoose knows the password was modified
        // Save the updated user
        await user.save();
        return NextResponse.json({
            message: 'La contrasenya s\'ha restablert correctament'
        });
    } catch (error) {
        console.error('Error en restablir la contrasenya:', error);
        return NextResponse.json(
            { message: 'Hi ha hagut un error en restablir la contrasenya' },
            { status: 500 }
        );
    }
}
