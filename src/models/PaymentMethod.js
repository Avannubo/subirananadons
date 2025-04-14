// models/PaymentMethod.js
import mongoose from 'mongoose';

const paymentMethodSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer'],
        required: true
    },
    details: {
        // Generic field that can store different payment details
        type: Object,
        required: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    lastUsed: Date
}, { timestamps: true });

// Add payment method to user's payments array when created
paymentMethodSchema.post('save', async function (doc) {
    await mongoose.model('User').updateOne(
        { _id: doc.user },
        { $addToSet: { payments: doc._id } }
    );
});

// Remove payment method from user's payments array when deleted
paymentMethodSchema.post('remove', async function (doc) {
    await mongoose.model('User').updateOne(
        { _id: doc.user },
        { $pull: { payments: doc._id } }
    );
});

export default mongoose.models.PaymentMethod || mongoose.model('PaymentMethod', paymentMethodSchema);