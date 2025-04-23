import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
        type: String,
        required: [function () {
            return this.provider === 'credentials';
        }, 'Please provide a password'],
        minlength: [6, 'Password should be at least 6 characters long'],
        select: false,
    },
    image: {
        type: String,
        default: null
    },
    emailVerified: {
        type: Date,
        default: null
    },
    provider: {
        type: String,
        enum: ['credentials', 'google'],
        default: 'credentials'
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for user's sessions
userSchema.virtual('sessions', {
    ref: 'Session',
    localField: '_id',
    foreignField: 'userId'
});

// Method to get active sessions
userSchema.methods.getActiveSessions = async function () {
    await this.populate({
        path: 'sessions',
        match: { isValid: true }
    });
    return this.sessions;
};

// Method to invalidate all sessions
userSchema.methods.invalidateAllSessions = async function () {
    const Session = mongoose.model('Session');
    await Session.updateMany(
        { userId: this._id },
        { isValid: false }
    );
};

// Hash password before saving only for credentials provider
userSchema.pre('save', async function (next) {
    // Only hash the password if it's been modified (or is new) and provider is credentials
    if (!this.isModified('password') || this.provider !== 'credentials') {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Error comparing passwords');
    }
};

// Method to update last login
userSchema.methods.updateLastLogin = async function () {
    this.lastLogin = new Date();
    return this.save();
};

// Ensure email is lowercase before saving
userSchema.pre('save', function (next) {
    if (this.email) {
        this.email = this.email.toLowerCase();
    }
    next();
});

// Virtual for formatted birth date
userSchema.virtual('formattedBirthDate').get(function () {
    if (!this.birthDate) return null;
    const day = String(this.birthDate.getDate()).padStart(2, '0');
    const month = String(this.birthDate.getMonth() + 1).padStart(2, '0');
    const year = this.birthDate.getFullYear();
    return `${day}/${month}/${year}`;
});

// Delete existing model if it exists to prevent model redefinition errors
mongoose.models = {};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;