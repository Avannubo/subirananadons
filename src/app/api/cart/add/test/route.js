import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export async function POST(request) {
    try {
        await dbConnect();

        // Parse the request body
        const body = await request.json();
        console.log('Test add to cart request:', JSON.stringify(body, null, 2));

        const { productId, quantity, isGift, giftInfo } = body;

        if (!productId || !quantity) {
            return NextResponse.json({
                success: false,
                message: 'Product ID and quantity are required'
            }, { status: 400 });
        }

        // Fetch product information to get price
        const product = await Product.findById(productId);
        if (!product) {
            return NextResponse.json({
                success: false,
                message: 'Product not found'
            }, { status: 404 });
        }

        // Format the cart item with product price
        const cartItem = {
            product: productId,
            quantity: Number(quantity),
            price: product.price_incl_tax || product.price || 0,
            isGift: !!isGift,
            giftInfo: isGift ? giftInfo : undefined
        };

        // This is a test endpoint, so we're just returning the item that would be added
        return NextResponse.json({
            success: true,
            message: 'Test successful',
            cartItem
        });
    } catch (error) {
        console.error('Error in test endpoint:', error);
        return NextResponse.json({
            success: false,
            message: 'Error processing request',
            error: error.message
        }, { status: 500 });
    }
} 