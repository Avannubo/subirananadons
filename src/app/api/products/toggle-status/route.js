import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
export async function POST(request) {
    try {
        const { productId } = await request.json();
        //console.log('[toggle-status] Received productId:', productId);
        if (!productId) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'El ID del producto es requerido'
                },
                { status: 400 }
            );
        }
        await dbConnect();
        // Find the product by ID to get current status
        const product = await Product.findById(productId);
        //console.log('[toggle-status] Product found:', product ? product._id : null, 'Current status:', product ? product.status : null);
        if (!product) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Producto no encontrado con ID: ${productId}`
                },
                { status: 404 }
            );
        }
        // Toggle between active and inactive
        const newStatus = product.status === 'active' ? 'inactive' : 'active';
        // Update the status using findByIdAndUpdate
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { status: newStatus },
            { new: true } // Return the updated document
        );
        //console.log('[toggle-status] Updated product status:', updatedProduct.status);
        return NextResponse.json({
            success: true,
            product: updatedProduct
        });
    } catch (error) {
        console.error('[toggle-status] Error:', error);
        return NextResponse.json(
            {
                success: false,
                message: error.message
            },
            { status: 500 }
        );
    }
}
