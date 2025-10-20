import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import Invoice from '@/models/Invoice';
import puppeteer from 'puppeteer';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { id } = params;
        // First check if an invoice already exists for this order
        const existingInvoice = await Invoice.findOne({ order: id });
        if (existingInvoice) {
            // If invoice exists, read and return the existing PDF
            const filePath = join(process.cwd(), 'public', existingInvoice.pdfUrl);
            try {
                const { readFile } = await import('fs/promises');
                const pdf = await readFile(filePath);
                return new NextResponse(pdf, {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': `attachment; filename="Ticket-${existingInvoice.invoiceNumber}.pdf"`
                    }
                });
            } catch (error) {
                console.error('Error al leer el PDF existente:', error);
                // If we can't read the existing PDF, continue to generate a new one
            }
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
            return new NextResponse('Pedido no encontrado', { status: 404 });
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
        // Save PDF to file
        await writeFile(filePath, pdf);        // Generate invoice number
        const currentYear = new Date().getFullYear();
        const lastInvoice = await Invoice.findOne({
            invoiceNumber: new RegExp(`^${currentYear}-`, 'i')
        }).sort({ invoiceNumber: -1 });
        let sequence = 1;
        if (lastInvoice) {
            const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-')[1]);
            sequence = lastSequence + 1;
        }
        // Format: YYYY-XXXXXX (e.g., 2025-000001)
        const invoiceNumber = `${currentYear}-${sequence.toString().padStart(6, '0')}`;
        // Create invoice record in database with additional data for dashboard
        const invoice = await Invoice.create({
            order: order._id,
            invoiceNumber: invoiceNumber,
            pdfUrl: publicUrl,
            totalAmount: order.totalAmount,
            issuedDate: new Date(),
            status: 'generated',
            orderDetails: {
                customerName: `${order.shippingAddress.name} ${order.shippingAddress.lastName}`,
                customerEmail: order.shippingAddress.email,
                orderNumber: order.orderNumber,
                orderDate: order.createdAt,
                deliveryMethod: order.deliveryMethod,
                subtotal: order.subtotal,
                tax: order.tax,
                shippingCost: order.shippingCost,
                totalAmount: order.totalAmount
            }
        });
        // Update order with invoice reference
        await Order.findByIdAndUpdate(order._id, {
            $push: { invoices: invoice._id }
        });
        // Return PDF response
        return new NextResponse(pdf, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Ticket-${invoice.invoiceNumber}.pdf"`
            }
        });
    } catch (error) {
        console.error('Error al generar la factura:', error);
        return NextResponse.json({
            success: false,
            message: 'Error al generar la factura',
            error: error.message
        }, { status: 500 });
    }
}
export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const { id } = params;
        const deletedInvoice = await Invoice.findByIdAndDelete(id);
        if (!deletedInvoice) {
            return new NextResponse('Factura no encontrada', { status: 404 });
        }
        return new NextResponse(null, { status: 200 });
    } catch (error) {
        console.error('Error al eliminar la factura:', error);
        return NextResponse.json({
            success: false,
            message: 'Error al eliminar la factura',
            error: error.message
        }, { status: 500 });
    }
}
