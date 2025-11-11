import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { id } = params;
        if (!id) {
            return NextResponse.json({ message: 'Order ID is required' }, { status: 400 });
        }
        const order = await Order.findById(id)
            .populate({
                path: 'items.product',
                model: 'Product',
                select: 'name reference'
            })
            .lean();
        if (!order) {
            return new NextResponse('Pedido no encontrado', { status: 404 });
        }
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<invoice>\n`;
        xml += `  <logo>SUBIRANANADONS</logo>\n`;
        xml += `  <invoiceDetails>\n`;
        xml += `    <title>TICKET</title>\n`;
        xml += `    <orderNumber>${order.orderNumber}</orderNumber>\n`;
        xml += `    <createdAt>${new Date(order.createdAt).toISOString()}</createdAt>\n`;
        xml += `  </invoiceDetails>\n`;
        xml += `  <info>\n`;
        if (order.deliveryMethod === 'delivery' && order.shippingAddress) {
            xml += `    <billingData>\n`;
            xml += `      <name>${order.shippingAddress.name} ${order.shippingAddress.lastName}</name>\n`;
            xml += `      <address>${order.shippingAddress.address}</address>\n`;
            xml += `      <city>${order.shippingAddress.city}</city>\n`;
            xml += `      <province>${order.shippingAddress.province}</province>\n`;
            xml += `      <postalCode>${order.shippingAddress.postalCode}</postalCode>\n`;
            xml += `      <country>${order.shippingAddress.country}</country>\n`;
            xml += `    </billingData>\n`;
        }
        xml += `    <contactData>\n`;
        xml += `      <email>${order.shippingAddress?.email || ''}</email>\n`;
        xml += `      <phone>${order.shippingAddress?.phone || ''}</phone>\n`;
        xml += `      <deliveryMethod>${order.deliveryMethod === 'delivery' ? 'Envío a domicilio' : 'Recogida en tienda'}</deliveryMethod>\n`;
        xml += `    </contactData>\n`;
        xml += `  </info>\n`;
        xml += `  <items>\n`;
        order.items.forEach(item => {
            const discount = item.priceDetails?.discountAmount || 0;
            const discountPercent = item.priceDetails?.discountPercentage || 0;
            const originalPrice = item.priceDetails?.originalPrice || item.price;
            const finalPrice = item.priceDetails?.finalPrice || item.price;
            xml += `    <item>\n`;
            xml += `      <name>${item.product ? (item.product.name?.ca || item.product.name?.es || item.product.name || 'Producto') : 'Producto'}</name>\n`;
            xml += `      <type>${item.type === 'gift' ? 'Regalo' : 'Personal'}</type>\n`;
            xml += `      <quantity>${item.quantity}</quantity>\n`;
            xml += `      <originalPrice>${originalPrice.toFixed(2)}</originalPrice>\n`;
            xml += `      <discount>${discount > 0 ? `${discountPercent}% (-${discount.toFixed(2)})` : '-'}</discount>\n`;
            xml += `      <finalPrice>${finalPrice.toFixed(2)}</finalPrice>\n`;
            xml += `    </item>\n`;
        });
        xml += `  </items>\n`;
        xml += `  <totals>\n`;
        xml += `    <subtotal>${order.subtotal.toFixed(2)}</subtotal>\n`;
        xml += `    <tax>${order.tax.toFixed(2)}</tax>\n`;
        if (order.discounts && order.discounts.total > 0) {
            xml += `    <discountTotal>-${order.discounts.total.toFixed(2)}</discountTotal>\n`;
        }
        xml += `    <shippingCost>${order.shippingCost.toFixed(2)}</shippingCost>\n`;
        xml += `    <totalAmount>${order.totalAmount.toFixed(2)}</totalAmount>\n`;
        xml += `  </totals>\n`;
        xml += `  <footer>\n`;
        xml += `    <thanks>Gracias por su compra</thanks>\n`;
        xml += `    <legal>Este documento sirve como ticket simplificada según el Real Decreto 1619/2012</legal>\n`;
        xml += `  </footer>\n`;
        xml += `</invoice>`;
        return new NextResponse(xml, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml',
                'Content-Disposition': `attachment; filename=ORDER-${order.orderNumber}.xml`
            }
        });
    } catch (error) {
        console.error('Error generating order XML:', error);
        return NextResponse.json({
            success: false,
            message: 'Error generating order XML: ' + error.message,
            error: error.stack || error.message
        }, { status: 500 });
    }
}
