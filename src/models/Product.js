import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a product name'],
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    reference: {
        type: String,
        unique: true,
        sparse: true
    },
    description: {
        type: String,
        maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    category: {
        type: String,
        required: [true, 'Please provide a category']
    },
    brand: {
        type: String,
        default: ''
    },
    price_excl_tax: {
        type: Number,
        required: [true, 'Please provide a price'],
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