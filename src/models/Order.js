// models/Order.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.Mixed,
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
        name: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: false },
        city: { type: String, required: false },
        postalCode: { type: String, required: false },
        province: { type: String, required: false },
        country: { type: String, default: 'España' }
    },
    deliveryMethod: {
        type: String,
        enum: ['delivery', 'pickup'],
        default: 'delivery'
    },
    status: {
        type: String,
        enum: ['processing', 'cancelled'],
        default: 'processing'
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    tax: {
        type: Number,
        required: true,
        min: 0
    },
    shippingCost: {
        type: Number,
        required: true,
        default: 0
    },
    paymentMethod: {
        type: String,
        default: 'pending'
    },
    trackingNumber: String,
    notes: String, paymentDetails: {
        transactionId: String,
        status: String,
        method: String
    },
    invoices: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice'
    }]
}, { timestamps: true });

// Add order to user's orders array when created
orderSchema.post('save', async function (doc) {
    try {
        const User = mongoose.models.User;
        if (User) {
            await User.updateOne(
                { _id: doc.user },
                { $addToSet: { orders: doc._id } }
            );
        }
    } catch (error) {
        console.error('Error updating user orders:', error);
    }
});

export default mongoose.models.Order || mongoose.model('Order', orderSchema);