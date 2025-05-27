// models/BirthList.js
import mongoose from 'mongoose';

const birthListSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    babyName: {
        type: String,
        required: true
    },
    dueDate: Date,
    image: {
        type: String,
        default: '/assets/images/default-birthlist.jpg'
    },
    items: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            auto: true // ensures a unique ID is generated
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        // quantity: {
        //     type: Number,
        //     required: true,
        //     min: 1
        // },
        state: {
            type: Number,
            default: 0,
            min: 0,
            max: 2
        }
    }],
    isPublic: {
        type: Boolean,
        default: true
    },
    theme: String,
    shippingAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    },
    status: {
        type: String,
        enum: ['Activa', 'Completada', 'Cancelada'],
        default: 'Activa'
    },
    contributors: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        contributedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

// Add birth list to user's birthLists array when created
birthListSchema.post('save', async function (doc) {
    await mongoose.model('User').updateOne(
        { _id: doc.user },
        { $addToSet: { birthLists: doc._id } }
    );
});

// Remove birth list from user's birthLists array when deleted
birthListSchema.post('remove', async function (doc) {
    await mongoose.model('User').updateOne(
        { _id: doc.user },
        { $pull: { birthLists: doc._id } }
    );
});

export default mongoose.models.BirthList || mongoose.model('BirthList', birthListSchema);