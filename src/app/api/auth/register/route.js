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
                { message: 'Si us plau, omple tots els camps obligatoris' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { message: 'Ja existeix un usuari amb aquest correu electrònic' },
                { status: 400 }
            );
        }

        // Create new user, set emailVerified to now (auto-verify)
        const user = await User.create({
            name,
            email,
            password,
            emailVerified: new Date(),
            IsActive: true, // Set user as active by default
        });

        // Remove password from response
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
        };

        return NextResponse.json(
            { message: 'Usuari registrat correctament', user: userResponse },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error de registre:', error);
        return NextResponse.json(
            { message: error.message || 'Error en registrar l\'usuari' },
            { status: 500 }
        );
    }
} 