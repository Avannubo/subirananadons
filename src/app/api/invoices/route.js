import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Invoice from '@/models/Invoice';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const from = searchParams.get('from');
        const to = searchParams.get('to');        // Build query
        let query = {};
        if (status && status !== 'Todas') {
            query.status = status === 'Pendientes' ? 'generated' : 'paid';
        }
        if (from || to) {
            query.issuedDate = {};
            if (from) query.issuedDate.$gte = new Date(from);
            if (to) query.issuedDate.$lte = new Date(to);
        }

        // Fetch invoices with populated order details
        const invoices = await Invoice.find(query)
            .populate('order')
            .sort({ issuedDate: -1 });        // Format invoices for frontend
        const formattedInvoices = invoices.map(invoice => {
            try {
                return {
                    id: invoice._id,
                    reference: invoice.invoiceNumber || 'Sin referencia',
                    customer: invoice.orderDetails?.customerName || 'Cliente no especificado',
                    total: `${(invoice.totalAmount || 0).toFixed(2)} €`,
                    paymentMethod: invoice.order?.paymentMethod || 'Pendiente',
                    status: invoice.status === 'paid' ? 'Pagada' : 'Pendiente',
                    issueDate: invoice.issuedDate ? new Date(invoice.issuedDate).toLocaleDateString('es-ES') : 'Fecha no disponible',
                    pdfUrl: invoice.pdfUrl || '#'
                };
            } catch (error) {
                console.error('Error formatting invoice:', invoice, error);
                return null;
            }
        }).filter(Boolean);

        return NextResponse.json(formattedInvoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}
