// models/Order.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    shippingAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: true
    },
    paymentMethod: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PaymentMethod',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    trackingNumber: String,
    notes: String
}, { timestamps: true });

// Add order to user's orders array when created
orderSchema.post('save', async function (doc) {
    await mongoose.model('User').updateOne(
        { _id: doc.user },
        { $addToSet: { orders: doc._id } }
    );
});

export default mongoose.models.Order || mongoose.model('Order', orderSchema);