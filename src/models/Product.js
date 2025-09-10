import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({
    name: {
        es: { type: String, required: [true, 'Por favor, proporciona un nombre de producto'] },
        ca: { type: String, required: [true, 'Si us plau, proporciona un nom de producte'] }
    },
    reference: {
        type: String,
        unique: true,
        sparse: true
    },
    description: {
        es: { type: String, required: false },
        ca: { type: String, required: false }
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: false
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: false
    },
    price_excl_tax: {
        type: Number,
        min: [0, 'Price cannot be negative']
    },
    price_incl_tax: {
        type: Number,
        required: [true, 'Please provide a price with tax'],
        min: [0, 'Price cannot be negative']
    },
    image: {
        type: String,
        default: '/assets/images/Screenshot_4.png'
    },
    imageHover: {
        type: String,
        default: ''
    },
    additionalImages: {
        type: [String],
        default: []
    },
    stock: {
        available: {
            type: Number,
            min: 0
        },
        minStock: {
            type: Number,
            min: 0
        }
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'discontinued'],
        default: 'active'
    },
    discount: {
        active: { type: Boolean, default: false },
        type: {
            type: String,
            enum: ['percentage', 'fixed'],
            default: 'percentage'
        },
        value: {
            type: Number,
            min: 0,
            validate: {
                validator: function (v) {
                    if (this.discount.type === 'percentage') {
                        return v <= 100;
                    }
                    return true;
                },
                message: 'Percentage discount cannot be greater than 100%'
            }
        },
        startDate: { type: Date },
        endDate: { type: Date },
        minPurchaseAmount: { type: Number, min: 0 },
        minQuantity: { type: Number, min: 1 },
        finalPrice: {
            type: Number,
            default: function () {
                if (!this.discount.active) return this.price_incl_tax;
                if (this.discount.type === 'percentage') {
                    return this.price_incl_tax * (1 - this.discount.value / 100);
                } else {
                    return Math.max(0, this.price_incl_tax - this.discount.value);
                }
            }
        }
    },
    salesCount: {
        type: Number,
        default: 0,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
export default mongoose.models.Product || mongoose.model('Product', productSchema); 