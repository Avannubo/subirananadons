import mongoose from 'mongoose';

const PendingOrderSchema = new mongoose.Schema({
    merchantOrder: {
        type: String,
        required: true,
        index: true
    },
    orderData: {
        type: Object,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    sessionId: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 24 * 60 * 60 // Document will be automatically deleted after 24 hours
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    }
});

export default mongoose.models.PendingOrder || mongoose.model('PendingOrder', PendingOrderSchema);