import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import puppeteer from 'puppeteer';
import { join } from 'path';
import { mkdir } from 'fs/promises';
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
        //console.log('Order:', order);
        if (!order) {
            return new NextResponse('Order not found', { status: 404 });
        }
        // HTML template for the invoice
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
            <meta charset="UTF-8">
            <title>Ticket - ${order.orderNumber}</title>
            <style>
                @page { size: A4; margin: 0; }
                body { 
                    font-family: Arial, sans-serif;
                    margin: 40px;
                    color: #333;
                    font-size: 14px;
                }
                .header { 
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 40px;
                    align-items: flex-start;
                }
                .logo { 
                    font-size: 24px;
                    font-weight: bold;
                    color: #36A9E1;
                    white-space: nowrap;
                }
                .invoice-details {
                    text-align: right;
                    white-space: nowrap;
                }
                .invoice-details h2 {
                    margin: 0 0 10px 0;
                }
                .invoice-box {
                    background: #fff;
                    padding: 30px;
                    max-width: 1000px;
                    margin: 0 auto;
                }
                .info {
                    margin-bottom: 30px;
                }
                .info h3 {
                    margin: 0 0 10px 0;
                    color: #333;
                }
                .info div {
                    line-height: 1.5;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                th, td {
                    padding: 12px;
                    border-bottom: 1px solid #eee;
                }
                th {
                    background: #36A9E1;
                    color: white;
                    font-weight: normal;
                    text-align: left;
                    white-space: nowrap;
                }
                th:first-child {
                    width: 45%;
                }
                th:nth-child(2) { width: 15%; }
                th:nth-child(3) { width: 10%; text-align: center; }
                th:nth-child(4) { width: 10%; text-align: right; }
                th:nth-child(5) { width: 10%; text-align: right; }
                th:nth-child(6) { width: 10%; text-align: right; }
                
                td {
                    vertical-align: top;
                }
                td:first-child {
                    max-width: 0;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                td:nth-child(2) { text-align: left; }
                td:nth-child(3) { text-align: center; }
                td:nth-child(4) { text-align: right; }
                td:nth-child(5) { text-align: right; }
                td:nth-child(6) { text-align: right; }
                
                .item-type {
                    font-weight: normal;
                    text-align: left;
                }
                .personal-type {
                    color: #36A9E1;
                }
                .gift-type {
                    color: #FF0080;
                }
                .discount {
                    color: #FF0080;
                }
                .totals {
                    width: auto;
                    min-width: 300px;
                    margin: 20px 0 20px auto;
                }
                .totals td {
                    padding: 8px 12px;
                    border: none;
                    text-align: right;
                    white-space: normal;
                }
                .totals td:first-child {
                    text-align: right;
                    padding-right: 40px;
                }
                .total-row td {
                    padding-top: 12px;
                    font-weight: bold;
                    border-top: 2px solid #36A9E1;
                }
                .discount-row td {
                    color: #FF0080;
                }
                .totals tr:not(.total-row):not(.discount-row) td:first-child {
                    color: #666;
                }
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    color: #666;
                    font-size: 0.9em;
                }
            </style>
            </head>
            <body>
            <div class="invoice-box">
                <div class="header">
                <div class="logo">SUBIRANANADONS</div>
                <div class="invoice-details">
                    <h2>TICKET</h2>
                    <div>Nº: ${order.orderNumber}</div>
                    <div>Fecha: ${new Date(order.createdAt).toLocaleDateString('es-ES')}</div>
                </div>
                </div>
                <div class="info">
            ${order.deliveryMethod === 'delivery' ? ` 
                <div>
                    <h3>Datos de Facturación</h3>
                    <div>${order.shippingAddress.name} ${order.shippingAddress.lastName}</div>
                        <div>${order.shippingAddress.address}</div>
                        <div>${order.shippingAddress.city}, ${order.shippingAddress.province}</div>
                        <div>${order.shippingAddress.postalCode}</div>
                        <div>${order.shippingAddress.country}</div>
                </div> ` : ''}
                <div>
                    <h3>Datos de Contacto</h3>
                    <div>Email: ${order.shippingAddress.email}</div>
                    <div>Teléfono: ${order.shippingAddress.phone}</div>
                    <div>Método de entrega: ${order.deliveryMethod === 'delivery' ? 'Envío a domicilio' : 'Recogida en tienda'}</div>
                </div>
                </div>                  
                <table>
                <thead>
                    <tr>
                    <th>Producto</th>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Descuento</th>
                    <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => {
            const discount = item.priceDetails?.discountAmount || 0;
            const discountPercent = item.priceDetails?.discountPercentage || 0;
            const originalPrice = item.priceDetails?.originalPrice || item.price;
            const finalPrice = item.priceDetails?.finalPrice || item.price;
            return `
                        <tr>
                        <td title="${item.product ? (item.product.name?.ca || item.product.name?.es || item.product.name || 'Producto') : 'Producto'}">
                            ${item.product ? (item.product.name?.ca || item.product.name?.es || item.product.name || 'Producto') : 'Producto'}
                        </td>
                        <td class="item-type ${item.type === 'gift' ? 'gift-type' : 'personal-type'}">
                            ${item.type === 'gift' ? 'Regalo' : 'Personal'}
                        </td>
                        <td>${item.quantity}</td>
                        <td>${originalPrice.toFixed(2)}€</td>
                        <td class="discount">
                            ${discount > 0 ? `${discountPercent}% (-${discount.toFixed(2)}€)` : '-'}
                        </td>
                        <td>${finalPrice.toFixed(2)}€</td>
                        </tr>
                        `;
        }).join('')}
                </tbody>
                </table>
                <table class="totals">
                <tr>
                    <td style="min-width: 150px;">Subtotal</td>
                    <td>${order.subtotal.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td style="min-width: 150px;">IVA (21%)</td>
                    <td>${order.tax.toFixed(2)} €</td>
                </tr>
                
                ${order.discounts && order.discounts.total > 0 ? `
                <tr class="discount-row">
                    <td style="min-width: 150px;">Descuento</td>
                    <td>-${order.discounts.total.toFixed(2)} €</td>
                </tr>
                ` : ''}
                <tr>
                    <td style="min-width: 150px;">Gastos de envío</td>
                    <td>${order.shippingCost.toFixed(2)} €</td>
                </tr>
                <tr class="total-row">
                    <td style="min-width: 150px;">Total</td>
                    <td>${order.totalAmount.toFixed(2)} €</td>
                </tr>
                </table>
                <div class="footer">
                <p>Gracias por su compra</p>
                <small>Este documento sirve como ticket simplificada según el Real Decreto 1619/2012</small>
                </div>
            </div>
            </body>
            </html>
        `;
        // Create invoices directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'invoices');
        await mkdir(uploadsDir, { recursive: true });
        // Generate unique filename
        const fileName = `invoice-${order.orderNumber}.pdf`;
        const filePath = join(uploadsDir, fileName);
        const publicUrl = `/uploads/invoices/${fileName}`;
        // Launch Puppeteer and generate PDF
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
            executablePath: process.env.CHROME_BIN || undefined
        });
        const page = await browser.newPage();
        await page.setContent(html);
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                bottom: '20px',
                left: '20px',
                right: '20px'
            }
        });
        await browser.close();

        return new NextResponse(pdf, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Ticket-${order.orderNumber}.pdf"`
            }
        });
    } catch (error) {
        console.error('Error generating invoice:', error);
        // Log detailed error information
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
        return NextResponse.json({
            success: false,
            message: 'Error generating invoice: ' + error.message,
            error: error.stack || error.message
        }, { status: 500 });
    }
}

