import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dmv3sqzfp',
    api_key: process.env.CLOUDINARY_API_KEY || '544412284116647',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'HCTqDgizlCuVT2hFf2tTCiFYWbA',
});
export async function GET() {
    try {
        const result = await cloudinary.api.resources({
            type: 'upload',
            max_results: 500
        });
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error en obtenir les imatges de Cloudinary:', error);
        return NextResponse.json(
            { error: error.message || 'Error en obtenir les imatges' },
            { status: 500 }
        );
    }
}