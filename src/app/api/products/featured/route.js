import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);

        // Optional limit parameter (default: 8)
        const limit = parseInt(searchParams.get('limit')) || 8;

        await dbConnect();

        // Find featured and active products
        const featuredProducts = await Product.find({
            featured: true,
            status: 'active'
        }).limit(limit);

        // Format products for frontend consumption
        const formattedProducts = featuredProducts.map(product => ({
            id: product._id.toString(),
            name: product.name,
            category: product.category,
            price: `${product.price_incl_tax.toFixed(2).replace('.', ',')} €`,
            priceValue: product.price_incl_tax,
            imageUrl: product.image || '/assets/images/Screenshot_4.png',
            imageUrlHover: product.imageHover || product.image || '/assets/images/Screenshot_4.png',
            description: product.description || '',
            reference: product.reference || '',
            brand: product.brand || ''
        }));

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