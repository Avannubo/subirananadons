import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            match: [/^[a-zA-ZáéíóúÁÉÍÓÚñÑ. ]+$/, 'Only alphabetic characters, dots and spaces allowed'],
            trim: true
        },
        lastName: {
            type: String,
            required: false,
            match: [/^[a-zA-ZáéíóúÁÉÍÓÚñÑ. ]+$/, 'Only alphabetic characters, dots and spaces allowed'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters']
        },
        birthDate: {
            type: Date,
            validate: {
                validator: function (v) {
                    // Validate date format DD/MM/YYYY
                    return /^\d{2}\/\d{2}\/\d{4}$/.test(v);
                },
                message: props => `${props.value} is not a valid date format (DD/MM/YYYY)`
            }
        },
        receiveOffers: {
            type: Boolean,
            default: false
        },
        subscribedToNewsletter: {
            type: Boolean,
            default: false
        },
        privacyConsent: {
            type: Boolean,
            required: [true, 'Privacy consent is required'],
            default: false
        },
        isAdmin: {
            type: Boolean,
            default: false
        },
        lastPasswordChange: {
            type: Date,
            default: Date.now
        },
        accountVerified: {
            type: Boolean,
            default: false
        },

        payments: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'PaymentMethod',
            default: []
        },
        addresses: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'Address',
            default: []
        },
        orders: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'Order',
            default: []
        },
        birthLists: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'BirthList',
            default: []
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret) {
                delete ret.password;
                delete ret.__v;
                return ret;
            }
        }
    }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        this.lastPasswordChange = Date.now();
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
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