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
            auto: true
        }, product: {
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
        userData: {
            name: String,
            email: String,
            phone: String,
            message: String,
            userId: mongoose.Schema.Types.ObjectId,
            date: {
                type: Date,
                default: Date.now
            }
        },
        // Transaction history
        transactions: [{
            type: {
                type: String,
                enum: ['reserved', 'purchased', 'cancelled'],
                required: true
            },
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
            message: String,
            paymentMethod: {
                type: String,
                enum: ['store', 'online'],
                default: 'store'
            },
            status: {
                type: String,
                enum: ['active', 'completed', 'cancelled'],
                default: 'active'
            },
            transactionDate: {
                type: Date,
                default: Date.now
            }
        }]
    }],

    // Messages system linked directly to items and states
    messages: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            auto: true
        },
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        type: {
            type: String,
            enum: ['reserved', 'purchased', 'cancelled', 'available', 'general'],
            required: true
        },
        // State information
        previousState: {
            type: Number,
            min: 0,
            max: 2
        },
        newState: {
            type: Number,
            min: 0,
            max: 2,
            required: true
        },
        // Buyer information
        buyerName: String,
        buyerEmail: String,
        buyerPhone: String,
        buyerId: mongoose.Schema.Types.ObjectId,
        // Store information (for reservations)
        storeName: String,
        storeContact: String,
        // Message content
        message: String,
        note: String,
        quantity: Number,
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

// Method to update item state and create message
birthListSchema.methods.updateItemState = function (itemId, newState, buyerData = {}) {
    const item = this.items.id(itemId);
    if (!item) {
        throw new Error('Item not found');
    }

    const previousState = item.state;

    // Update item state and buyer info
    item.state = newState;

    if (buyerData.name || buyerData.email) {
        item.userData = {
            name: buyerData.name,
            email: buyerData.email,
            phone: buyerData.phone,
            message: buyerData.message,
            userId: buyerData.userId,
            date: new Date()
        };

        // Add to transactions history
        item.transactions.push({
            type: newState === 1 ? 'reserved' : newState === 2 ? 'purchased' : 'cancelled',
            buyerName: buyerData.name,
            buyerEmail: buyerData.email,
            buyerPhone: buyerData.phone,
            userId: buyerData.userId,
            quantity: buyerData.quantity || item.quantity,
            message: buyerData.message,
            paymentMethod: buyerData.paymentMethod || 'store',
            transactionDate: new Date()
        });
    }

    // Create message
    const messageType = newState === 0 ? 'available' :
        newState === 1 ? 'reserved' : 'purchased';

    let messageText = '';
    if (newState === 0) {
        messageText = 'Producto disponible nuevamente';
    } else if (newState === 1) {
        messageText = `Producto reservado${buyerData.name ? ` por ${buyerData.name}` : ''}`;
    } else if (newState === 2) {
        messageText = `Producto comprado${buyerData.name ? ` por ${buyerData.name}` : ''}`;
    }

    this.messages.push({
        itemId: item._id,
        productId: item.product,
        type: messageType,
        previousState: previousState,
        newState: newState,
        buyerName: buyerData.name,
        buyerEmail: buyerData.email,
        buyerPhone: buyerData.phone,
        buyerId: buyerData.userId,
        message: messageText,
        note: buyerData.message,
        quantity: buyerData.quantity || item.quantity,
        createdAt: new Date()
    });

    return this.save();
};

// Method to add a custom message
birthListSchema.methods.addMessage = function (itemId, type, data) {
    const item = this.items.id(itemId);
    if (!item) {
        throw new Error('Item not found');
    }

    const message = {
        itemId,
        productId: item.product,
        type,
        newState: item.state,
        message: data.message,
        note: data.note,
        createdAt: new Date()
    };

    if (type === 'reserved') {
        Object.assign(message, {
            storeName: data.storeName,
            storeContact: data.storeContact,
            buyerName: data.buyerName,
            buyerEmail: data.buyerEmail,
            buyerPhone: data.buyerPhone
        });
    } else if (type === 'purchased') {
        Object.assign(message, {
            buyerName: data.buyerName,
            buyerEmail: data.buyerEmail,
            buyerPhone: data.buyerPhone,
            buyerId: data.buyerId
        });
    }

    this.messages.push(message);
    return this.save();
};

// Method to reserve an item
birthListSchema.methods.reserveItem = function (itemId, buyerData) {
    return this.updateItemState(itemId, 1, buyerData);
};

// Method to purchase an item
birthListSchema.methods.purchaseItem = function (itemId, buyerData) {
    return this.updateItemState(itemId, 2, buyerData);
};

// Method to make item available again
birthListSchema.methods.makeItemAvailable = function (itemId) {
    return this.updateItemState(itemId, 0);
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

// Method to get messages for a specific item
birthListSchema.methods.getItemMessages = function (itemId) {
    return this.messages.filter(msg => msg.itemId.equals(itemId));
};

// Method to get messages by state change
birthListSchema.methods.getMessagesByState = function (state) {
    return this.messages.filter(msg => msg.newState === state);
};

// Virtual to get purchased items
birthListSchema.virtual('purchasedItems').get(function () {
    return this.items.filter(item => item.state === 2);
});

// Virtual to get reserved items
birthListSchema.virtual('reservedItems').get(function () {
    return this.items.filter(item => item.state === 1);
});

// Virtual to get available items
birthListSchema.virtual('availableItems').get(function () {
    return this.items.filter(item => item.state === 0);
});

// Add birth list to user's birthLists array when created
birthListSchema.post('save', async function (doc) {
    try {
        await mongoose.model('User').updateOne(
            { _id: doc.user },
            { $addToSet: { birthLists: doc._id } }
        );
    } catch (error) {
        console.error('Error updating user birthLists:', error);
    }
});

// Remove birth list from user's birthLists array when deleted
birthListSchema.post('remove', async function (doc) {
    try {
        await mongoose.model('User').updateOne(
            { _id: doc.user },
            { $pull: { birthLists: doc._id } }
        );
    } catch (error) {
        console.error('Error removing birthList from user:', error);
    }
});

export default mongoose.models.BirthList || mongoose.model('BirthList', birthListSchema);