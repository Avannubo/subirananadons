import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
export async function POST(request) {
    try {
        await dbConnect();
        // Parse the request body
        const body = await request.json();
        console.log('Add to cart request:', JSON.stringify(body, null, 2));
        const { productId, quantity, isGift, giftInfo } = body;
        if (!productId || !quantity) {
            return NextResponse.json({
                success: false,
                message: 'Product ID and quantity are required'
            }, { status: 400 });
        }
        try {
            // Fetch product information to get price
            let product;
            // Check if productId is a valid ObjectId
            const isValidObjectId = mongoose.Types.ObjectId.isValid(productId);
            console.log(`Searching for product with ID: ${productId}, valid MongoDB ID: ${isValidObjectId}`);
            if (isValidObjectId) {
                product = await Product.findById(productId);
            }
            // If not found by ID, try searching by other fields
            if (!product) {
                console.log('Product not found by ID, trying to find by other fields...');
                product = await Product.findOne({
                    $or: [
                        { _id: productId },
                        { reference: productId }
                    ]
                });
            }
            if (!product) {
                console.log(`Product not found: ${productId}`);
                return NextResponse.json({
                    success: false,
                    message: `Product not found with ID: ${productId}`
                }, { status: 404 });
            }
            console.log(`Found product: ${product.name} (ID: ${product._id})`);
            // Get the session for authenticated users
            let session;
            try {
                session = await getServerSession(authOptions);
            } catch (authError) {
                console.error('Authentication error:', authError);
                // Continue without session
            }
            const userId = session?.user?.id;
            // Format the cart item with product price
            const price = product.price_incl_tax || product.price || 0;
            // Create cart response for guest users if no session
            if (!userId) {
                console.log('Guest user adding to cart - returning product info only');
                const cartItem = {
                    product: product._id.toString(),
                    quantity: Number(quantity),
                    price: price,
                    isGift: !!isGift,
                    giftInfo: isGift ? giftInfo : undefined,
                    id: product._id.toString(), // Add this for client-side compatibility
                    name: product.name,
                    image: product.image,
                    priceValue: price
                };
                return NextResponse.json({
                    success: true,
                    message: 'Product info retrieved for guest cart',
                    cart: {
                        items: [cartItem]
                    },
                    product: cartItem
                });
            }
            // For authenticated users, process cart in database
            let cart = { items: [] };
            try {
                const existingCart = await Cart.findOne({ user: userId });
                if (existingCart) {
                    cart = existingCart.toObject();
                }
            } catch (cartError) {
                console.error('Error finding user cart:', cartError);
                // Continue with empty cart
            }
            // Check if product already exists in cart
            const existingItemIndex = cart.items.findIndex(
                item => item.product?.toString() === product._id.toString()
            );
            if (existingItemIndex > -1) {
                // Update existing item quantity
                cart.items[existingItemIndex].quantity += Number(quantity);
            } else {
                // Add new item
                cart.items.push({
                    product: product._id.toString(),
                    quantity: Number(quantity),
                    price: price,
                    isGift: !!isGift,
                    giftInfo: isGift ? giftInfo : undefined
                });
            }
            // Save cart for authenticated users
            try {
                if (cart._id) {
                    await Cart.findByIdAndUpdate(cart._id, {
                        items: cart.items,
                        lastUpdated: new Date()
                    });
                } else {
                    const newCart = await Cart.create({
                        user: userId,
                        items: cart.items
                    });
                    cart._id = newCart._id;
                }
            } catch (saveError) {
                console.error('Error saving cart to database:', saveError);
                return NextResponse.json({
                    success: false,
                    message: 'Error saving cart to database',
                    error: saveError.message
                }, { status: 500 });
            }
            // Format response to include extra product details for client-side
            const formattedItems = cart.items.map(item => {
                if (item.product.toString() === product._id.toString()) {
                    return {
                        ...item,
                        id: product._id.toString(),
                        name: product.name,
                        image: product.image,
                        priceValue: price
                    };
                }
                return item;
            });
            return NextResponse.json({
                success: true,
                message: 'Product added to cart',
                cart: {
                    items: formattedItems,
                    _id: cart._id
                }
            });
        } catch (dbError) {
            console.error('Database error:', dbError);
            return NextResponse.json({
                success: false,
                message: 'Database error',
                error: dbError.message,
                stack: dbError.stack
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        return NextResponse.json({
            success: false,
            message: 'Error adding product to cart',
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
} 