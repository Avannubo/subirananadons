import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export async function POST(request) {
    try {
        const { productId } = await request.json();
        // console.log('[toggle-featured] Received productId:', productId);

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

        // Find the product by ID to get current featured value
        const product = await Product.findById(productId);
        console.log('[toggle-featured] Product found:', product ? product._id : null, 'Current featured:', product ? product.featured : null);

        if (!product) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Product not found with ID: ${productId}`
                },
                { status: 404 }
            );
        }

        // Toggle the featured status using findByIdAndUpdate to avoid full validation
        const newFeatured = !product.featured;
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { $set: { featured: newFeatured } },
            { new: true, runValidators: false }
        );
        console.log('[toggle-featured] Updated product from DB:', updatedProduct ? updatedProduct.featured : null);

        return NextResponse.json({
            success: true,
            message: `Product ${updatedProduct.featured ? 'marked as featured' : 'unmarked as featured'}`,
            product: {
                id: updatedProduct._id,
                name: updatedProduct.name,
                featured: updatedProduct.featured
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