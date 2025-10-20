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
                { message: 'Se requiere ID del pedido' },
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
                { message: 'Pedido no encontrado' },
                { status: 404 }
            );
        }
        // Validate essential order data
        const requiredFields = ['orderNumber', 'items', 'shippingAddress', 'totalAmount'];
        const missingFields = requiredFields.filter(field => !order[field]);
        if (missingFields.length > 0) {
            return NextResponse.json(
                {
                    message: 'Datos del pedido incompletos',
                    details: `Faltan campos obligatorios: ${missingFields.join(', ')}`
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
                    message: 'Dirección de envío incompleta',
                    details: `Faltan campos obligatorios en la dirección: ${missingAddressFields.join(', ')}`
                },
                { status: 400 }
            );
        }
        //console.log('Original order:', JSON.stringify(order, null, 2));
        // Transform the order data
        const transformedOrder = {
            ...order,
            items: order.items.map(item => {
                //console.log(item);
                const productData = item.product || {};
                const price = Number(item.price || 0);
                const quantity = Number(item.quantity || 1);
                return {
                    product: {
                        name: productData.name.es || 'Producto no disponible',
                        description: productData.description || '',
                        image: productData.image || '',
                        brand: productData.brand.name || '',
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
        //console.log('Transformed order:', JSON.stringify(transformedOrder, null, 2));
        // Send confirmation email with transformed data
        await EmailService.sendOrderConfirmation(transformedOrder);
        // Send gift notifications for items that are gifts
        if (order.items && order.items.length > 0) {

            for (const item of order.items) {
                console.log(item);
                if (item.type === 'gift' && item.giftInfo) {
                    try {
                        await EmailService.sendGiftPurchaseNotification({
                            _id: item.giftInfo.listId,
                            title: item.giftInfo.babyName,
                            email: item.giftInfo.listOwnerEmail || '',
                            user: { email: item.giftInfo.listOwnerEmail || '' }
                        }, {
                            product: item.product,
                            userData: item.buyerInfo
                        }, item.giftInfo.status || 'comprado', item.giftInfo.state || 2);
                    } catch (error) {
                        console.error('Error sending gift notification:', error);
                        // Continue with other items even if one fails
                    }
                }
            }
        }
        return NextResponse.json({
            message: 'Correo de confirmación de pedido enviado correctamente',
            orderId: order._id
        });
    } catch (error) {
        console.error('Error al enviar el correo de confirmación del pedido:', error);
        return NextResponse.json(
            { message: 'Error al enviar el correo de confirmación', error: error.message },
            { status: 500 }
        );
    }
}
