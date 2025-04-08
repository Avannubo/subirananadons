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

        // Generate a JWT token
        const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

        // Set the token in an HTTP-only cookie
        return new Response(JSON.stringify({ message: 'Login successful' }), {
            status: 200,
            headers: {
                'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=3600;`
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Error logging in user' }), { status: 500 });
    }
};