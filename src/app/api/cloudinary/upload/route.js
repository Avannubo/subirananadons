import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
// Configure Cloudinary with your credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dmv3sqzfp',
    api_key: process.env.CLOUDINARY_API_KEY || '544412284116647',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'HCTqDgizlCuVT2hFf2tTCiFYWbA',
});
export async function POST(request) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'No autoritzat' },
                { status: 401 }
            );
        }
        // Get the base64 image data from the request
        const { image } = await request.json();
        if (!image) {
            return NextResponse.json(
                { error: 'No s\'ha proporcionat cap imatge' },
                { status: 400 }
            );
        }
        // Log that we're starting the upload
        //console.log('Iniciant la pujada a Cloudinary des del servidor...');
        // Upload the image to Cloudinary
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload(
                image,
                {
                    folder: 'user_profiles',
                    // Add a unique identifier based on user ID to avoid duplicates
                    public_id: `user_${session.user.id}_${Date.now()}`,
                    // Remove transformation to keep original quality
                },
                (error, result) => {
                    if (error) {
                        console.error('Error en pujar a Cloudinary:', error);
                        reject(error);
                    } else {
                        //console.log('Pujada a Cloudinary completada amb èxit:', result.secure_url);
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
        console.error('Error de pujada al servidor:', error);
        return NextResponse.json(
            { error: error.message || 'Error en pujar la imatge' },
            { status: 500 }
        );
    }
}