import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function GET() {
    try {
        const result = await cloudinary.api.resources({
            type: 'upload',
            max_results: 500
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching Cloudinary images:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch images' },
            { status: 500 }
        );
    }
}