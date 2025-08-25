import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { formatProduct } from '@/services/ProductService';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);

        // Optional limit parameter (default: 8)
        const limit = parseInt(searchParams.get('limit')) || 8;

        await dbConnect();

        // Find featured and active products, populate brand and category for translations
        const featuredProducts = await Product.find({
            featured: true,
            status: 'active'
        })
            .populate('brand')
            .populate('category')
            .limit(limit);

        // Format products for frontend consumption using the shared formatProduct function
        const formattedProducts = featuredProducts.map(product => formatProduct(product));

        return NextResponse.json({
            success: true,
            products: formattedProducts
        });
    } catch (error) {
        console.error('Error fetching featured products:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Error fetching featured products',
                error: error.message
            },
            { status: 500 }
        );
    }
} 