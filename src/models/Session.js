import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    accessToken: {
        type: String,
        required: true
    },
    expires: {
        type: Date,
        required: true
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    userAgent: String,
    ipAddress: String,
    isValid: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster queries and automatic expiration
sessionSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });
sessionSchema.index({ userId: 1 });
sessionSchema.index({ accessToken: 1 });

const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);

export default Session; 