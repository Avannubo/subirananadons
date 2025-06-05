import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Order from '@/models/Order';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import BirthList from '@/models/BirthList';

// Generate a unique order number
function generateOrderNumber() {
    const timestamp = new Date().getTime().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${timestamp}-${random}`;
}

// Create a new order
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        await dbConnect();

        const data = await request.json();
        const { items, shippingDetails, deliveryMethod, totals } = data;

        if (!items || !items.length || !shippingDetails) {
            return NextResponse.json({
                success: false,
                message: 'Missing required order information'
            }, { status: 400 });
        }

        // Prepare order data
        const orderData = {
            orderNumber: generateOrderNumber(),
            items: items.map(item => {
                const productId = typeof item.id === 'string' && /^[0-9a-fA-F]{24}$/.test(item.id)
                    ? item.id
                    : item.id.toString();

                return {
                    product: productId,
                    quantity: item.quantity,
                    price: item.priceValue || parseFloat(item.price.replace(',', '.')),
                    isGift: item.type === 'gift',
                    giftInfo: item.type === 'gift' ? item.listInfo : undefined,
                    buyerInfo: item.buyerInfo
                };
            }),
            shippingAddress: {
                name: shippingDetails.name,
                lastName: shippingDetails.lastName,
                email: shippingDetails.email,
                phone: shippingDetails.phone,
                address: shippingDetails.address,
                city: shippingDetails.city,
                postalCode: shippingDetails.postalCode,
                province: shippingDetails.province,
                country: shippingDetails.country || 'España'
            },
            deliveryMethod: deliveryMethod,
            status: 'processing', // Set initial status to processing (Acceptado)
            totalAmount: totals.total,
            subtotal: totals.subtotal,
            tax: totals.tax,
            shippingCost: totals.shipping,
            notes: shippingDetails.notes || '',
            giftNote: shippingDetails.giftNote || ''
        };

        // If user is logged in, link the order to the user
        if (session?.user?.id) {
            orderData.user = session.user.id;
        }

        // Create the order
        const order = await Order.create(orderData);

        // For gift items, update the birth list items to mark them as purchased
        const giftItems = items.filter(item => item.type === 'gift' && item.listInfo);
        if (giftItems.length > 0) {
            for (const item of giftItems) {
                if (!item.listInfo.listId || !item.listInfo.itemId) continue;

                try {
                    // Find the birth list
                    const birthList = await BirthList.findById(item.listInfo.listId);
                    if (!birthList) {
                        console.error(`Birth list not found: ${item.listInfo.listId}`);
                        continue;
                    }

                    // Find the specific item in the birth list
                    const birthListItem = birthList.items.id(item.listInfo.itemId);
                    if (!birthListItem) {
                        console.error(`Item not found in birth list: ${item.listInfo.itemId}`);
                        continue;
                    }

                    // Create buyer info with notes
                    const buyerInfoWithNote = {
                        ...item.buyerInfo,
                        message: shippingDetails.giftNote || '', // This will be stored in both userData.message and messages.note
                        quantity: item.quantity
                    };

                    if (session?.user?.id) {
                        buyerInfoWithNote.userId = session.user.id;
                    }

                    // Update the item's state to purchased (2) and include buyer info with note
                    await birthList.updateItemState(item.listInfo.itemId, 2, buyerInfoWithNote);

                } catch (error) {
                    console.error(`Error updating birth list item state: ${error.message}`);
                    // Continue processing other items even if one fails
                }
            }
        }

        // Return success response
        return NextResponse.json({
            success: true,
            message: 'Order created successfully',
            order: {
                id: order._id,
                orderNumber: order.orderNumber
            }
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({
            success: false,
            message: 'An error occurred while processing your order',
            error: error.message
        }, { status: 500 });
    }
}

// Get all orders for the current user
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        console.log('Session in Orders API:', session);

        if (!session?.user?.id) {
            console.error('No user ID in session - unauthorized');
            return NextResponse.json({
                success: false,
                message: 'Unauthorized'
            }, { status: 401 });
        }

        await dbConnect();

        // Get query params for filtering/pagination
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;

        // Admin can see all orders, regular users can only see their own
        const isAdmin = session.user.role === 'admin';
        const query = isAdmin ? {} : { user: session.user.id };
        console.log(`User role: ${session.user.role}, query filter:`, query);

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('user', 'name email')
            .lean();

        console.log(`Found ${orders.length} orders for user ${session.user.id}`);
        const total = await Order.countDocuments(query);

        return NextResponse.json({
            success: true,
            orders,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                limit
            }
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
        }, { status: 500 });
    }
}