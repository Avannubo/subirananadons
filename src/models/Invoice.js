import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    issuedDate: {
        type: Date,
        default: Date.now
    },
    pdfUrl: {
        type: String,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['generated', 'sent', 'paid'],
        default: 'generated'
    },
    orderDetails: {
        customerName: {
            type: String,
            required: true
        },
        customerEmail: {
            type: String,
            required: true
        },
        orderNumber: {
            type: String,
            required: true
        },
        orderDate: {
            type: Date,
            required: true
        },
        deliveryMethod: {
            type: String,
            enum: ['delivery', 'pickup'],
            required: true
        }
    }
}, { timestamps: true });

// Generate invoice number
invoiceSchema.pre('save', async function (next) {
    if (this.isNew) {
        try {
            // Get current year
            const currentYear = new Date().getFullYear();

            // Find the last invoice number for this year
            const lastInvoice = await this.constructor.findOne({
                invoiceNumber: new RegExp(`^${currentYear}-`, 'i')
            }).sort({ invoiceNumber: -1 });

            let sequence = 1;
            if (lastInvoice) {
                const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-')[1]);
                sequence = lastSequence + 1;
            }

            // Format: YYYY-XXXXXX (e.g., 2025-000001)
            this.invoiceNumber = `${currentYear}-${sequence.toString().padStart(6, '0')}`;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

export default mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);
