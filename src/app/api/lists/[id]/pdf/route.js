import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import dbConnect from '@/lib/dbConnect';
import BirthList from '@/models/BirthList';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { id } = params;
        // Get the birth list data
        const list = await BirthList.findById(id)
            .populate('items.product');
        if (!list) {
            return NextResponse.json({
                success: false,
                message: 'Lista no encontrada'
            }, { status: 404 });
        }
        // Generate HTML content
        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Lista de Regalos - ${list.title}</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif;
                            padding: 20px;
                            margin: 0;
                            color: #333;
                        }
                        .discount-info {
                            display: flex;
                            flex-direction: column;
                            gap: 4px;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 20px;
                            background-color: white;
                        }
                        th, td {
                            padding: 12px;
                            text-align: left;
                            border-bottom: 1px solid #eee;
                            vertical-align: top;
                        }
                        th {
                            background-color: #f8f9fa;
                            font-weight: 600;
                            color: #333;
                        }
                        .header {
                            margin-bottom: 30px;
                            text-align: center;
                            color: #00B0C8;
                        }
                        .product-cell {
                            display: flex;
                            align-items: start;
                            gap: 15px;
                        }
                        .product-image {
                            width: 80px;
                            height: 80px;
                            object-fit: cover;
                            border-radius: 4px;
                        }
                        .product-info {
                            flex: 1;
                        }
                        .product-name {
                            font-weight: 500;
                            margin-bottom: 4px;
                        }
                        .product-brand {
                            color: #666;
                            font-size: 0.9em;
                        }
                        .price-original {
                            text-decoration: line-through;
                            color: #999;
                            font-size: 0.9em;
                        }
                        .price-discounted {
                            color: #e41e31;
                            font-weight: 600;
                        }
                        .discount-badge {
                            display: inline-block;
                            padding: 2px 6px;
                            background-color: #ffe6e6;
                            color: #e41e31;
                            border-radius: 12px;
                            font-size: 0.8em;
                            margin-left: 8px;
                        }
                        .totals {
                            margin-top: 20px;
                            text-align: right;
                        }
                        .total-row {
                            margin: 8px 0;
                        }
                        .total-final {
                            font-size: 1.2em;
                            font-weight: 600;
                            margin-top: 15px;
                            padding-top: 15px;
                            border-top: 2px solid #dee2e6;
                        }
                        .discount-total {
                            color: #e41e31;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Resumen del Pedido</h1>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 50%">Producto</th>
                                <th style="width: 15%">Cantidad</th>
                                <th style="width: 15%">Precio</th>
                                <th style="width: 20%">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${list.items.map(item => {
                            if (!item || !item.product) return ''; 
                            return `
                                    <tr>
                                        <td>
                                            <div class="product-cell">
                                                <img src="${item.product.images?.[0] || ''}" alt="${item.product.name}" class="product-image"/>
                                                <div class="product-info">
                                                    <div class="product-name">${item.product.name}</div>
                                                    <div class="product-brand">${item.product.brand || ''}</div>
                                                    <div class="product-sku">REF: ${item.product.reference || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>${item.quantity}</td>
                                        <td>
                                            ${order.discounts ? `
                                                <div class="price-original">${item.priceDetails.originalPrice.toFixed(2)}€</div>
                                                <div class="price-discounted">
                                                    ${item.priceDetails.finalPrice.toFixed(2)}€
                                                    <span class="discount-badge">-${item.priceDetails.discountPercentage}%</span>
                                                </div>
                                            ` : `
                                                <div>${item.price.toFixed(2)}€</div>
                                            `}
                                        </td>
                                        <td>${(item.quantity * (item.priceDetails?.finalPrice || item.price)).toFixed(2)}€</td>
                                    </tr>
                                `;
        }).join('')}
                        </tbody>
                    </table>
                    <div class="totals">
                        <div class="total-row">
                            <strong>Subtotal:</strong> ${list.subtotal.toFixed(2)}€
                        </div>
                        ${list.discounts ? `
                        <div class="total-row discount-total">
                            <strong>Total descuentos:</strong> -${list.discounts.total.toFixed(2)}€
                        </div>
                        ` : ''}
                        <div class="total-row">
                            <strong>IVA (21%):</strong> ${list.tax.toFixed(2)}€
                        </div>
                        ${list.shippingCost > 0 ? `
                        <div class="total-row">
                            <strong>Gastos de envío:</strong> ${list.shippingCost.toFixed(2)}€
                        </div>
                        ` : ''}
                        <div class="total-final">
                            <strong>Precio total del pedido:</strong> ${list.totalAmount.toFixed(2)}€
                        </div>
                    </div>
                    <div class="footer">
                        <p>Generado el ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                    </div>
                </body>
            </html>
        `;
        // Create directory for storing PDFs if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'lists');
        await mkdir(uploadsDir, { recursive: true });
        // Generate unique filename
        const fileName = `list-${list._id}.pdf`;
        const filePath = join(uploadsDir, fileName);
        // Launch Puppeteer and generate PDF
        const browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ]
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
        await writeFile(filePath, pdf);
        // Return PDF response
        return new NextResponse(pdf, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Lista_${list.title}.pdf"`
            }
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        return NextResponse.json({
            success: false,
            message: 'Error generating PDF',
            error: error.message
        }, { status: 500 });
    }
}
