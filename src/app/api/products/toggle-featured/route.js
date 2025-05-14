import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export async function POST(request) {
    try {
        // Only allow in development environment
        if (process.env.NODE_ENV !== 'development') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'This API is only available in development mode'
                },
                { status: 403 }
            );
        }

        const { productId } = await request.json();

        if (!productId) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Product ID is required'
                },
                { status: 400 }
            );
        }

        await dbConnect();

        // Find the product by ID
        const product = await Product.findById(productId);

        if (!product) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Product not found with ID: ${productId}`
                },
                { status: 404 }
            );
        }

        // Toggle the featured status
        product.featured = !product.featured;
        await product.save();

        return NextResponse.json({
            success: true,
            message: `Product ${product.featured ? 'marked as featured' : 'unmarked as featured'}`,
            product: {
                id: product._id,
                name: product.name,
                featured: product.featured
            }
        });
    } catch (error) {
        console.error('Error toggling featured status:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Error toggling featured status',
                error: error.message
            },
            { status: 500 }
        );
    }
} 