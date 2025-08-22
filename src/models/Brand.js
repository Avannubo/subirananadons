import mongoose from 'mongoose';

const BrandSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    logo: { type: String, default: '' },
    description: { type: String, default: '' },
    website: { type: String, default: '' },
    addresses: { type: String, default: '' },
    products: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true },
    discount: {
        active: { type: Boolean, default: false },
        type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
        value: { type: Number, default: 0 },
        startDate: { type: Date },
        endDate: { type: Date },
        minPurchaseAmount: { type: Number },
        minQuantity: { type: Number },
        excludedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Brand || mongoose.model('Brand', BrandSchema);
