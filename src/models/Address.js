// models/Address.js
import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['home', 'work', 'other'],
        default: 'home'
    },
    street: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    postalCode: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    contactPhone: String
}, { timestamps: true });

// Add address to user's addresses array when created
addressSchema.post('save', async function (doc) {
    await mongoose.model('User').updateOne(
        { _id: doc.user },
        { $addToSet: { addresses: doc._id } }
    );
});

// Remove address from user's addresses array when deleted
addressSchema.post('remove', async function (doc) {
    await mongoose.model('User').updateOne(
        { _id: doc.user },
        { $pull: { addresses: doc._id } }
    );
});

export default mongoose.models.Address || mongoose.model('Address', addressSchema);