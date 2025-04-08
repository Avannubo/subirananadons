import { NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';

export async function POST(request) {
    await dbConnect();

    try {
        const { name, email, password } = await request.json();

        // Registration logic here
        const user = await User.create({ name, email, password });

        return NextResponse.json({ success: true, user });
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }
}