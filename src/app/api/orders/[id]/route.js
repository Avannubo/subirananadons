import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import Order from '@/models/Order';
import Invoice from '@/models/Invoice';
// Ensure Invoice model is imported before using it in population

// Get a single order by ID
export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        console.log('Order Detail API - Session:', session);
        console.log('Order Detail API - Request Params:', params);

        if (!session?.user?.id) {
            console.error('Order Detail API - No user ID in session');
            return NextResponse.json({
                success: false,
                message: 'No autorizado'
            }, { status: 401 });
        }

        await dbConnect();
        const { id } = params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.error('Order Detail API - Invalid order ID:', id);
            return NextResponse.json({
                success: false,
                message: 'ID de pedido no válido'
            }, { status: 400 });
        }

        // First try to find the order without population to ensure it exists
        const order = await Order.findById(id);

        if (!order) {
            return NextResponse.json({
                success: false,
                message: 'Order not found'
            }, { status: 404 });
        }

        // Then populate the references if needed
        const populatedOrder = await Order.findById(id)
            .populate('user', 'name email')
            .lean(); // Use lean() for better performance

        // Handle invoices separately to avoid schema registration issues
        if (populatedOrder.invoices && populatedOrder.invoices.length > 0) {
            try {
                const invoices = await Invoice.find({
                    _id: { $in: populatedOrder.invoices }
                }).select('pdfUrl invoiceNumber').lean();
                populatedOrder.invoices = invoices;
            } catch (invoiceError) {
                console.error('Error fetching invoices:', invoiceError);
                populatedOrder.invoices = []; // Fallback to empty array if invoice fetch fails
            }
        }

        return NextResponse.json({
            success: true,
            order: populatedOrder
        });
    } catch (error) {
        console.error('Order Detail API - Error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Error al obtener los detalles del pedido'
        }, { status: 500 });
    }
}
// Update an order
export async function PATCH(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({
                success: false,
                message: 'Unauthorized'
            }, { status: 401 });
        }
        const isAdmin = session.user.role === 'admin';
        if (!isAdmin) {
            return NextResponse.json({
                success: false,
                message: 'Solo los administradores pueden actualizar pedidos'
            }, { status: 403 });
        }
        await dbConnect();
        const { id } = params;
        const data = await request.json();
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid order ID'
            }, { status: 400 });
        }

        // Validate status if it's being updated
        const allowedStatuses = ['acceptado', 'procesando', 'enviado', 'completo', 'cancelado'];
        if (data.status !== undefined) {
            // Convert status to lowercase for validation and storage
            data.status = data.status.toLowerCase();
            if (!allowedStatuses.includes(data.status)) {
                console.log('Invalid status value:', data.status);
                return NextResponse.json({
                    success: false,
                    message: 'Invalid order status. Allowed values are: ' + allowedStatuses.join(', ')
                }, { status: 400 });
            }
        }

        // Validate the update data
        const allowedFields = ['status', 'trackingNumber', 'notes', 'paymentDetails'];
        const updateData = {};
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updateData[field] = data[field];
            }
        }

        // If no valid fields to update
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({
                success: false,
                message: 'No valid fields to update'
            }, { status: 400 });
        }

        // Find and update the order
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        // Check if order exists
        if (!updatedOrder) {
            return NextResponse.json({
                success: false,
                message: 'Order not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Pedido actualizado correctamente',
            order: updatedOrder
        });
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({
            success: false,
            message: 'Error al actualizar el pedido',
            error: error.message
        }, { status: 500 });
    }
}
// Delete an order
export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({
                success: false,
                message: 'Unauthorized'
            }, { status: 401 });
        }
        const isAdmin = session.user.role === 'admin';
        if (!isAdmin) {
            return NextResponse.json({
                success: false,
                message: 'Solo los administradores pueden eliminar pedidos'
            }, { status: 403 });
        }
        await dbConnect();
        const { id } = params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid order ID'
            }, { status: 400 });
        }
        // Find and delete the order
        const deletedOrder = await Order.findByIdAndDelete(id);
        // Check if order exists
        if (!deletedOrder) {
            return NextResponse.json({
                success: false,
                message: 'Order not found'
            }, { status: 404 });
        }
        return NextResponse.json({
            success: true,
            message: 'Pedido eliminado correctamente'
        });
    } catch (error) {
        console.error('Error deleting order:', error);
        return NextResponse.json({
            success: false,
            message: 'Error al eliminar el pedido',
            error: error.message
        }, { status: 500 });
    }
}