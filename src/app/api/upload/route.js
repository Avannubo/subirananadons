import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Configure Cloudinary with your credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dmv3sqzfp',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get the base64 image data from the request
        const { image } = await request.json();

        if (!image) {
            return NextResponse.json(
                { error: 'No image data provided' },
                { status: 400 }
            );
        }

        // Log that we're starting the upload
        console.log('Starting Cloudinary upload from server...');

        // Upload the image to Cloudinary
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload(
                image,
                {
                    folder: 'user_profiles',
                    // Add a unique identifier based on user ID to avoid duplicates
                    public_id: `user_${session.user.id}_${Date.now()}`,
                    // Optimize image quality and size
                    transformation: [
                        { width: 500, height: 500, crop: 'limit', quality: 'auto' }
                    ]
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(error);
                    } else {
                        console.log('Cloudinary upload success:', result.secure_url);
                        resolve(result);
                    }
                }
            );
        });

        // Return the secure URL
        return NextResponse.json({
            url: result.secure_url,
            publicId: result.public_id
        });
    } catch (error) {
        console.error('Server upload error:', error);
        return NextResponse.json(
            { error: error.message || 'Error uploading image' },
            { status: 500 }
        );
    }
} 