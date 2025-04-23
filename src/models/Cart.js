import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: String,
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
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Update lastUpdated timestamp on every save
cartSchema.pre('save', function (next) {
    this.lastUpdated = new Date();
    next();
});

// Add cart to user's cart reference when created
cartSchema.post('save', async function (doc) {
    try {
        await mongoose.model('User').updateOne(
            { _id: doc.user },
            { $set: { cart: doc._id } }
        );
    } catch (error) {
        console.error('Error updating user cart reference:', error);
        // Don't throw the error to prevent blocking the cart creation
    }
});

export default mongoose.models.Cart || mongoose.model('Cart', cartSchema); 