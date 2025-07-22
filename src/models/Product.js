import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        es: { type: String, required: [true, 'Por favor, proporciona un nombre de producto']},
        ca: { type: String, required: [true, 'Si us plau, proporciona un nom de producte']}
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
            default: 0,
            min: 0
        },
        minStock: {
            type: Number,
            default: 5,
            min: 0
        }
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'discontinued'],
        default: 'active'
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