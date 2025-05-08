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
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        province: { type: String, required: true },
        country: { type: String, default: 'España' }
    },
    deliveryMethod: {
        type: String,
        enum: ['delivery', 'pickup'],
        default: 'delivery'
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
    notes: String,
    paymentDetails: {
        transactionId: String,
        status: String,
        method: String
    }
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