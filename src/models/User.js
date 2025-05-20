import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxlength: [60, 'Name cannot be more than 60 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    image: {
        type: String,
        default: ''
    },
    birthDate: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    newsletter: {
        type: Boolean,
        default: false
    },
    partnerOffers: {
        type: Boolean,
        default: false
    },
    emailVerified: {
        type: Date,
        default: null
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart',
        default: null
    },
    birthLists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BirthList'
    }],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
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

// Hash password before saving
userSchema.pre('save', async function (next) {
    // Only hash the password if it's modified or new
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Method to update last login
userSchema.methods.updateLastLogin = async function () {
    this.createdAt = new Date();
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