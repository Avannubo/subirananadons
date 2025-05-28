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
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        },
        state: {
            type: Number,
            default: 0,
            min: 0,
            max: 2,
            validate: {
                validator: Number.isInteger,
                message: 'State must be an integer'
            }
        },
        // Store/buyer information for state 1 (reserved) and state 2 (purchased)
        reservedBy: {
            storeName: String,
            contactName: String,
            contactEmail: String,
            contactPhone: String,
            reservedDate: Date,
            note: String
        },
        purchasedBy: {
            buyerName: String,
            contactEmail: String,
            contactPhone: String,
            purchasedDate: Date,
            note: String
        },
        purchases: [{
            buyerName: {
                type: String,
                required: true
            },
            buyerEmail: {
                type: String,
                required: true
            },
            buyerPhone: String,
            userId: mongoose.Schema.Types.ObjectId,
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            paymentMethod: {
                type: String,
                enum: ['store', 'online'],
                default: 'store'
            },
            status: {
                type: String,
                enum: ['pending', 'completed', 'cancelled'],
                default: 'pending'
            },
            purchaseDate: {
                type: Date,
                default: Date.now
            }
        }]
    }],
    // Messages system to track state changes
    messages: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            auto: true
        },
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        type: {
            type: String,
            enum: ['reserved', 'purchased', 'cancelled', 'general'],
            required: true
        },
        // For reserved messages
        storeName: String,
        contactName: String,
        contactEmail: String,
        contactPhone: String,
        // For purchased messages
        buyerName: String,
        buyerEmail: String,
        buyerPhone: String,
        // Common fields
        message: String,
        note: String,
        createdAt: {
            type: Date,
            default: Date.now
        },
        isRead: {
            type: Boolean,
            default: false
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

// Middleware to create messages when item state changes
birthListSchema.pre('save', function (next) {
    if (this.isModified('items')) {
        const original = this.constructor.findById(this._id);

        original.then((originalDoc) => {
            if (originalDoc) {
                this.items.forEach((item, index) => {
                    const originalItem = originalDoc.items.id(item._id);

                    if (originalItem && originalItem.state !== item.state) {
                        // State changed from 0 to 1 (reserved)
                        if (originalItem.state === 0 && item.state === 1 && item.reservedBy) {
                            this.messages.push({
                                itemId: item._id,
                                type: 'reserved',
                                storeName: item.reservedBy.storeName,
                                contactName: item.reservedBy.contactName,
                                contactEmail: item.reservedBy.contactEmail,
                                contactPhone: item.reservedBy.contactPhone,
                                message: `Producto reservado por ${item.reservedBy.storeName || item.reservedBy.contactName}`,
                                note: item.reservedBy.note
                            });
                        }

                        // State changed from 1 to 2 (purchased)
                        if (originalItem.state === 1 && item.state === 2 && item.purchasedBy) {
                            this.messages.push({
                                itemId: item._id,
                                type: 'purchased',
                                buyerName: item.purchasedBy.buyerName,
                                buyerEmail: item.purchasedBy.contactEmail,
                                buyerPhone: item.purchasedBy.contactPhone,
                                message: `Producto comprado por ${item.purchasedBy.buyerName}`,
                                note: item.purchasedBy.note
                            });
                        }

                        // State changed from 0 to 2 (direct purchase)
                        if (originalItem.state === 0 && item.state === 2 && item.purchasedBy) {
                            this.messages.push({
                                itemId: item._id,
                                type: 'purchased',
                                buyerName: item.purchasedBy.buyerName,
                                buyerEmail: item.purchasedBy.contactEmail,
                                buyerPhone: item.purchasedBy.contactPhone,
                                message: `Producto comprado por ${item.purchasedBy.buyerName}`,
                                note: item.purchasedBy.note
                            });
                        }
                    }
                });
            }
            next();
        }).catch(next);
    } else {
        next();
    }
});

// Method to add a custom message
birthListSchema.methods.addMessage = function (itemId, type, data) {
    const message = {
        itemId,
        type,
        message: data.message,
        note: data.note,
        createdAt: new Date()
    };

    if (type === 'reserved') {
        Object.assign(message, {
            storeName: data.storeName,
            contactName: data.contactName,
            contactEmail: data.contactEmail,
            contactPhone: data.contactPhone
        });
    } else if (type === 'purchased') {
        Object.assign(message, {
            buyerName: data.buyerName,
            buyerEmail: data.buyerEmail,
            buyerPhone: data.buyerPhone
        });
    }

    this.messages.push(message);
    return this.save();
};

// Method to mark messages as read
birthListSchema.methods.markMessagesAsRead = function (messageIds) {
    messageIds.forEach(id => {
        const message = this.messages.id(id);
        if (message) {
            message.isRead = true;
        }
    });
    return this.save();
};

// Method to get unread messages count
birthListSchema.methods.getUnreadCount = function () {
    return this.messages.filter(msg => !msg.isRead).length;
};

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