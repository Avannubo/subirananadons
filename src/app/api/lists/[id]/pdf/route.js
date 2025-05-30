import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import dbConnect from '@/lib/dbConnect';
import BirthList from '@/models/BirthList';

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
                    <title>Lista de Regalos - ${list.name}</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif;
                            padding: 20px;
                            margin: 0;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 20px;
                        }
                        th, td {
                            border: 1px solid #ddd;
                            padding: 8px;
                            text-align: left;
                        }
                        th {
                            background-color: #f4f4f4;
                        }
                        .header {
                            margin-bottom: 30px;
                            text-align: center;
                        }
                        .list-info {
                            margin-bottom: 20px;
                        }
                        .footer {
                            margin-top: 30px;
                            text-align: center;
                            font-size: 0.8em;
                            color: #666;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Lista de Regalos</h1>
                        <h2>${list.title}</h2>
                    </div>
                    <div class="list-info"> 
                        <p><strong>Nombre del Bebé:</strong> ${list.babyName}</p>
                        <p><strong>Fecha de Creación:</strong> ${new Date(list.createdAt).toLocaleDateString()}</p>
                        <p><strong>Fecha Prevista:</strong> ${new Date(list.dueDate).toLocaleDateString()}</p>
                        <p><strong>Estado:</strong> ${list.status}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Producto</th> 
                                <th>Cantidad</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                        ${list.items.map(item => {
                            // Map the state number to status text
                            let status;
                            switch (item.state) {
                                case 1:
                                    status = 'Reservado';
                                    break;
                                case 2:
                                    status = 'Comprado';
                                    break;
                                default:
                                    status = 'Pendiente';
                            } 
            return `
                                <tr>
                                    <td>${item.product ? item.product.name : 'Producto no disponible'}</td> 
                                    <td>${item.quantity}</td>
                                    <td>${status}</td>
                                </tr>
                                `;
        }).join('')}
                        </tbody>
                    </table>
                    <div class="footer">
                        <p>Generado el ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                    </div>
                </body>
            </html>
        `;

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

        // Return PDF response
        return new NextResponse(pdf, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Lista_de_Regalos_${list.reference}.pdf"`
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
