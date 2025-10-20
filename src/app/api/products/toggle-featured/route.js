import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
export async function POST(request) {
    try {
        const { productId } = await request.json();
        // //console.log('[toggle-featured] Received productId:', productId);
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
        // Find the product by ID to get current featured value
        const product = await Product.findById(productId);
        //console.log('[toggle-featured] Product found:', product ? product._id : null, 'Current featured:', product ? product.featured : null);
        if (!product) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Producto no encontrado con ID: ${productId}`
                },
                { status: 404 }
            );
        }
        // Toggle the featured status using findByIdAndUpdate to avoid full validation
        const newFeatured = !product.featured;
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { $set: { featured: newFeatured } },
            { new: true, runValidators: false }
        );
        //console.log('[toggle-featured] Updated product from DB:', updatedProduct ? updatedProduct.featured : null);
        return NextResponse.json({
            success: true,
            message: `Producto ${updatedProduct.featured ? 'marcado como destacado' : 'desmarcado como destacado'}`,
            product: {
                id: updatedProduct._id,
                name: updatedProduct.name,
                featured: updatedProduct.featured
            }
        });
    } catch (error) {
        console.error('Error toggling featured status:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Error al cambiar el estado destacado',
                error: error.message
            },
            { status: 500 }
        );
    }
}