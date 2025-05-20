import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import Invoice from '@/models/Invoice';
import { unlink } from 'fs/promises';
import { join } from 'path';
export async function DELETE(request, { params }) {
    try {
        // Check authentication and admin status
        const authSession = await getServerSession(authOptions);
        if (!authSession?.user?.id || !authSession?.user?.role === 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        await dbConnect();
        const { id } = params;
        // Find the invoice
        const invoice = await Invoice.findById(id);
        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }
        // Start a session for transaction
        const mongoSession = await mongoose.startSession();
        mongoSession.startTransaction();

        try {
            // Delete the PDF file if it exists
            if (invoice.pdfUrl) {
                const filePath = join(process.cwd(), 'public', invoice.pdfUrl);
                try {
                    await unlink(filePath);
                } catch (error) {
                    console.error('Error deleting PDF file:', error);
                    // Only throw if file exists but couldn't be deleted
                    if (error.code !== 'ENOENT') {
                        throw new Error('Failed to delete invoice PDF file');
                    }
                }
            }

            // Remove invoice reference from the order
            if (invoice.order) {
                const Order = mongoose.models.Order;
                await Order.findByIdAndUpdate(
                    invoice.order,
                    { $pull: { invoices: invoice._id } },
                    { session: mongoSession }
                );
            }

            // Delete the invoice from database
            await Invoice.findByIdAndDelete(id).session(mongoSession);

            // Commit the transaction
            await mongoSession.commitTransaction();
            return NextResponse.json({
                success: true,
                message: 'Invoice deleted successfully'
            });
        } catch (error) {
            // If anything fails, abort the transaction
            await mongoSession.abortTransaction();
            throw error;
        } finally {
            // End the session
            mongoSession.endSession();
        }
    } catch (error) {
        console.error('Error deleting invoice:', error);

        // If we started a transaction, make sure it's aborted
        // If we started a transaction, make sure it's aborted
        if (typeof mongoSession !== 'undefined' && mongoSession.inTransaction()) {
            try {
                await mongoSession.abortTransaction();
            } catch (abortError) {
                console.error('Error aborting transaction:', abortError);
            } finally {
                mongoSession.endSession();
            }
        }
        // Return appropriate error response based on the error type
        if (error.message === 'Failed to delete invoice PDF file') {
            return NextResponse.json({
                error: 'File System Error',
                details: 'Could not delete the invoice PDF file'
            }, { status: 500 });
        } else if (error.name === 'ValidationError') {
            return NextResponse.json({
                error: 'Validation Error',
                details: error.message
            }, { status: 400 });
        } else {
            return NextResponse.json({
                error: 'Internal Server Error',
                details: error.message
            }, { status: 500 });
        }
    }
}
