import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;


export default async function dbConnect() {
    try {
        const conn = await mongoose.connect(String(MONGODB_URI));
        console.log('MongoDB connected.');
        return conn;
    }
    catch (error) {
        console.error('MongoDB connection error:', error.message);
        throw new Error('MongoDB connection failed');
    }
}