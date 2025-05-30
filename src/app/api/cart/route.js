import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Cart from '@/models/Cart';
import dbConnect from '@/lib/dbConnect';

// Create a new cart
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        console.log('Session:', JSON.stringify(session, null, 2));

        if (!session?.user?.id) {
            console.log('No valid session or user ID');
            return NextResponse.json({ error: 'Unauthorized - No valid user ID' }, { status: 401 });
        }

        await dbConnect();
        console.log('Connected to database');

        const body = await request.json();
        console.log('Request body:', JSON.stringify(body, null, 2));

        if (!body.items || !Array.isArray(body.items)) {
            console.log('Invalid items data:', body);
            return NextResponse.json({ error: 'Invalid items data' }, { status: 400 });
        }

        const cartData = {
            user: session.user.id,
            items: body.items.map(item => {
                console.log('Processing item:', item);
                if (!item.id || !item.quantity || !(item.priceValue || item.price)) {
                    throw new Error(`Invalid item data: ${JSON.stringify(item)}`);
                }
                return {
                    product: item.id.toString(),
                    quantity: Number(item.quantity),
                    price: Number(item.priceValue || item.price)
                };
            })
        };

        console.log('Cart data to save:', JSON.stringify(cartData, null, 2));

        const cart = await Cart.create(cartData);
        console.log('Created cart:', JSON.stringify(cart.toObject(), null, 2));

        return NextResponse.json({ id: cart._id }, { status: 201 });
    } catch (error) {
        console.error('Error creating cart:', error);
        console.error('Error stack:', error.stack);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}

// Update cart
export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized - No valid user ID' }, { status: 401 });
        }

        await dbConnect();

        // Update the cart with the new items, preserving giftInfo
        console.log('Connected to database');

        const { items, cartId } = await request.json();
        console.log('Updating cart:', cartId);
        console.log('With items:', items);

        const cart = await Cart.findOneAndUpdate(
            { _id: cartId, user: session.user.id }, {
            items: items.map(item => ({
                product: item.id.toString(),
                quantity: Number(item.quantity),
                price: Number(item.priceValue || item.price),
                isGift: item.isGift || false,
                giftInfo: item.giftInfo
            })),
            lastUpdated: new Date()
        },
            { new: true }
        );

        if (!cart) {
            console.log('Cart not found:', cartId);
            return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
        }

        console.log('Updated cart:', cart);
        return NextResponse.json(cart);
    } catch (error) {
        console.error('Error updating cart:', error);
        console.error('Error stack:', error.stack);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}

// Delete cart
export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized - No valid user ID' }, { status: 401 });
        }

        await dbConnect();
        console.log('Connected to database');

        const { cartId } = await request.json();
        console.log('Deleting cart:', cartId);

        const cart = await Cart.findOneAndDelete({
            _id: cartId,
            user: session.user.id
        });

        if (!cart) {
            console.log('Cart not found:', cartId);
            return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
        }

        console.log('Deleted cart:', cart);
        return NextResponse.json({ message: 'Cart deleted successfully' });
    } catch (error) {
        console.error('Error deleting cart:', error);
        console.error('Error stack:', error.stack);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}

// Get cart
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized - No valid user ID' }, { status: 401 });
        }

        await dbConnect();
        console.log('Connected to database');
        console.log('User ID:', session.user.id);

        const cart = await Cart.findOne({ user: session.user.id });

        if (!cart) {
            console.log('No cart found for user:', session.user.id);
            return NextResponse.json({ items: [] });
        }

        console.log('Found cart:', cart);
        return NextResponse.json(cart);
    } catch (error) {
        console.error('Error fetching cart:', error);
        console.error('Error stack:', error.stack);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message,
            stack: error.stack
        }, { status: 500 });
    }
} 