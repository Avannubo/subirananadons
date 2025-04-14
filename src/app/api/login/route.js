import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'your_secret_key'; // Replace with a secure key

export const POST = async (request) => {
    const { email, password } = await request.json();

    await dbConnect();

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
        }

        // Check if the user is an admin and include the admin status in the token payload
        const isAdmin = user.role === 'admin'; // Assuming `role` field exists in the user model

        // Generate a JWT token with admin status
        const token = jwt.sign(
            { id: user._id, email: user.email },
            SECRET_KEY,
            { expiresIn: '12h' }
        );

        // Set the token in an HTTP-only cookie
        return new Response(JSON.stringify({ message: 'Login successful' }), {
            status: 200,
            headers: {
            'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=100000;`
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Error logging in user' }), { status: 500 });
    }
};