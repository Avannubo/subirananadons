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
                console.error('Error reading existing PDF:', error);
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

        console.log('Order:', order);
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
                }
                .header { 
                display: flex;
                justify-content: space-between;
                margin-bottom: 40px;
                }
                .logo { 
                font-size: 24px;
                font-weight: bold;
                color: #00B0C8;
                white-space: nowrap;
                }
                .invoice-details {
                text-align: right;
                white-space: nowrap;
                }
                .invoice-box {
                background: #fff;
                padding: 30px;
                }
                .info {
                margin-bottom: 30px;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                }
                .info h3,
                .info div {
                white-space: nowrap;
                }
                table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                }
                th, td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #eee;
                white-space: nowrap;
                }                th {
                background: #00B0C8;
                color: white;
                }
                .gift-item {
                    background-color: #FFF5F7;
                }
                .item-type {
                    font-weight: 600;
                    text-align: center;
                }
                .gift-type {
                    color: #DB2777;
                }
                .personal-type {
                    color: #00B0C8;
                }
                .totals {
                margin-left: auto;
                width: 300px;
                }
                .totals td {
                padding: 8px;
                white-space: nowrap;
                }
                .total-row td {
                font-weight: bold;
                font-size: 1.1em;
                border-top: 2px solid #00B0C8;
                }
                .footer {
                margin-top: 40px;
                text-align: center;
                color: #666;
                font-size: 0.9em;
                white-space: nowrap;
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
                <div>
                    <h3>Datos de Facturación</h3>
                    <div>${order.shippingAddress.name} ${order.shippingAddress.lastName}</div>
                    <div>${order.shippingAddress.address}</div>
                    <div>${order.shippingAddress.city}, ${order.shippingAddress.province}</div>
                    <div>${order.shippingAddress.postalCode}</div>
                    <div>${order.shippingAddress.country}</div>
                </div>
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
                    <th>Total</th>
                    </tr>
                </thead>                        <tbody>
                    ${order.items.map(item => `
                    <tr class="${item.isGift ? 'gift-item' : ''}">
                        <td>
                        ${item.product ? `${item.product.name}` : 'Producto'}
                        </td>
                        <td class="item-type ${item.isGift ? 'gift-type' : 'personal-type'}">
                            ${item.isGift ? 'Regalo' : 'Personal'}
                        </td>
                        <td>${item.quantity}</td>
                        <td>${item.price.toFixed(2)}€</td>
                        <td>${(item.price * item.quantity).toFixed(2)}€</td>
                    </tr>
                    `).join('')}
                </tbody>
                </table>
                <table class="totals">
                <tr>
                    <td>Subtotal</td>
                    <td>${order.subtotal.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>IVA (21%)</td>
                    <td>${order.tax.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>Gastos de envío</td>
                    <td>${order.shippingCost.toFixed(2)} €</td>
                </tr>
                <tr class="total-row">
                    <td>Total</td>
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
        `;        // Create invoices directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'invoices');
        await mkdir(uploadsDir, { recursive: true });

        // Generate unique filename
        const fileName = `invoice-${order.orderNumber}.pdf`;
        const filePath = join(uploadsDir, fileName);
        const publicUrl = `/uploads/invoices/${fileName}`;

        // Launch Puppeteer and generate PDF
        const browser = await puppeteer.launch({
            headless: 'new'
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
        const invoiceNumber = `${currentYear}-${sequence.toString().padStart(6, '0')}`;        // Create invoice record in database with additional data for dashboard
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
        console.error('Error generating invoice:', error);
        return NextResponse.json({
            success: false,
            message: 'Error generating invoice',
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
            return new NextResponse('Invoice not found', { status: 404 });
        }

        return new NextResponse(null, { status: 200 });
    } catch (error) {
        console.error('Error deleting invoice:', error);
        return NextResponse.json({
            success: false,
            message: 'Error deleting invoice',
            error: error.message
        }, { status: 500 });
    }
}
