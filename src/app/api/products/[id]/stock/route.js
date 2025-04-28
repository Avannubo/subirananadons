import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        // Check authentication
        if (!session || !session.user) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        // Check if the user has admin role
        const isAdmin = session.user.role === 'admin';
        if (!isAdmin) {
            return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
        }

        const { id } = params;
        const { stock } = await request.json();

        // Connect to the database
        await dbConnect();

        // Find the product
        const product = await Product.findById(id);
        if (!product) {
            return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
        }

        // Update stock with the received stock object
        if (stock && typeof stock.physical === 'number') {
            // Update all stock properties
            product.stock.physical = stock.physical;
            product.stock.minStock = stock.minStock || stock.reserved || 5;
            product.stock.available = stock.physical; // Available is set to physical via pre-save hook

            // Log stock update if stockHistory exists
            if (product.stockHistory) {
                product.stockHistory.push({
                    date: new Date(),
                    type: 'manual',
                    physical: stock.physical,
                    minStock: product.stock.minStock,
                    available: stock.physical,
                    userId: session.user.id,
                    userName: session.user.name || 'Admin user'
                });
            }
        }

        // Save the product
        await product.save();

        return NextResponse.json(product, { status: 200 });
    } catch (error) {
        console.error('Error updating product stock:', error);
        return NextResponse.json({ error: 'Error al actualizar el stock del producto' }, { status: 500 });
    }
} 