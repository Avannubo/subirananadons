import { NextResponse } from 'next/server';


export const POST = async (request) => {
    const { name, email, password } = await request.json();
    const User = require('@/models/User');
    const dbConnect = require('@/lib/dbConnect');

    await dbConnect();

    try {
        const user = new User({ name, email, password });
        await user.save();
        NextResponse
        return new Response(JSON.stringify({ message: 'User registered successfully' }), { status: 201 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Error registering user' }), { status: 500 });
    }
}