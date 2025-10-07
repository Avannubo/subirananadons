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
        // Helper for Catalan/EU date/time
        const formatDate = (date) => new Date(date).toLocaleDateString('ca-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const formatTime = (date) => new Date(date).toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
        // Generate HTML content in Catalan
        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Llista de Regals - ${list.name}</title>
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
                        <h1>Llista de Regals</h1>
                        <h2>${list.title}</h2>
                    </div>
                    <div class="list-info"> 
                        <p><strong>Nom del nadó:</strong> ${list.babyName}</p>
                        <p><strong>Data de creació:</strong> ${formatDate(list.createdAt)}</p>
                        <p><strong>Data prevista:</strong> ${formatDate(list.dueDate)}</p>
                        <p><strong>Estat:</strong> ${list.status === 'Activa' ? 'Activa' : list.status === 'Completada' ? 'Completada' : 'Inactiva'}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Producte</th> 
                                <th>Quantitat</th>
                                <th>Estat</th>
                            </tr>
                        </thead>
                        <tbody>
                        ${list.items.map(item => {
            // Map the state number to status text (Catalan)
            let status;
            switch (item.state) {
                case 1:
                    status = 'Reservat';
                    break;
                case 2:
                    status = 'Comprat';
                    break;
                default:
                    status = 'Pendent';
            }
            return `
                                <tr>
                                    <td>${item.product ? (item.product.name?.ca || item.product.name?.es || item.product.name || 'Producte no disponible') : 'Producte no disponible'}</td> 
                                    <td>${item.quantity}</td>
                                    <td>${status}</td>
                                </tr>
                                `;
        }).join('')}
                        </tbody>
                    </table>
                    <div class="footer">
                        <p>Generat el ${formatDate(new Date())} ${formatTime(new Date())}</p>
                    </div>
                </body>
            </html>
        `;
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
