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
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password should be at least 6 characters long'],
        select: false,
    },
    image: {
        type: String,
        default: null
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    provider: {
        type: String,
        default: 'credentials'
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Virtual for formatted birth date
userSchema.virtual('formattedBirthDate').get(function () {
    if (!this.birthDate) return null;
    const day = String(this.birthDate.getDate()).padStart(2, '0');
    const month = String(this.birthDate.getMonth() + 1).padStart(2, '0');
    const year = this.birthDate.getFullYear();
    return `${day}/${month}/${year}`;
});

// Delete existing model if it exists
delete mongoose.connection.models.User;

const User = mongoose.model('User', userSchema);
export default User;