import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import EmailService from '@/services/EmailService';

export async function POST(request, { params }) {
    try {
        await dbConnect();

        // Get and validate params
        const { id } = await Promise.resolve(params);
        if (!id) {
            return NextResponse.json(
                { message: 'Order ID is required' },
                { status: 400 }
            );
        }

        // Find order and populate product information
        const order = await Order.findById(id)
            .populate({
                path: 'items.product',
                model: 'Product',
                select: 'name price slug image description brand category'
            })
            .lean();

        if (!order) {
            return NextResponse.json(
                { message: 'Order not found' },
                { status: 404 }
            );
        }

        // Validate essential order data
        const requiredFields = ['orderNumber', 'items', 'shippingAddress', 'totalAmount'];
        const missingFields = requiredFields.filter(field => !order[field]);
        
        if (missingFields.length > 0) {
            return NextResponse.json(
                { 
                    message: 'Incomplete order data', 
                    details: `Missing required fields: ${missingFields.join(', ')}`
                },
                { status: 400 }
            );
        }

        // Validate shipping address
        const requiredAddressFields = ['email', 'name'];
        const missingAddressFields = requiredAddressFields.filter(
            field => !order.shippingAddress[field]
        );

        if (missingAddressFields.length > 0) {
            return NextResponse.json(
                { 
                    message: 'Incomplete shipping address', 
                    details: `Missing required address fields: ${missingAddressFields.join(', ')}`
                },
                { status: 400 }
            );
        }

        console.log('Original order:', JSON.stringify(order, null, 2));
        
        // Transform the order data
        const transformedOrder = {
            ...order,
            items: order.items.map(item => {                const productData = item.product || {};
                // Use the price from the order item, not from the product
                const price = Number(item.price || 0);
                const quantity = Number(item.quantity || 1);
                
                return {
                    product: {
                        name: productData.name || 'Producto no disponible',
                        description: productData.description || '',
                        image: productData.image || '',
                        brand: productData.brand || '',
                        category: productData.category || '',
                        slug: productData.slug || ''
                    },
                    quantity: quantity,
                    price: price,
                    subtotal: quantity * price,
                    giftInfo: item.type
                };
            }),
            shippingAddress: {
                ...order.shippingAddress,
                name: order.shippingAddress?.name || '',
                lastName: order.shippingAddress?.lastName || '',
                email: order.shippingAddress?.email || '',
                phone: order.shippingAddress?.phone || '',
                address: order.shippingAddress?.address || '',
                city: order.shippingAddress?.city || '',
                postalCode: order.shippingAddress?.postalCode || '',
                province: order.shippingAddress?.province || '',
                country: order.shippingAddress?.country || 'España'
            },
            totalAmount: Number(order.totalAmount || 0),
            subtotal: Number(order.subtotal || 0),
            tax: Number(order.tax || 0),
            shippingCost: Number(order.shippingCost || 0),
            createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
            updatedAt: order.updatedAt ? new Date(order.updatedAt) : new Date(),
            orderNumber: order.orderNumber || 'N/A',
            deliveryMethod: order.deliveryMethod || 'pickup',
            status: order.status || 'processing',
            paymentMethod: order.paymentMethod || 'pending',
            notes: order.notes || ''
        };

        console.log('Transformed order:', JSON.stringify(transformedOrder, null, 2));

        // Send confirmation email with transformed data
        await EmailService.sendOrderConfirmation(transformedOrder);

        return NextResponse.json({
            message: 'Order confirmation email sent successfully',
            orderId: order._id
        });
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
        return NextResponse.json(
            { message: 'Error sending confirmation email', error: error.message },
            { status: 500 }
        );
    }
}
