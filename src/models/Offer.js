import mongoose from 'mongoose';
const OfferSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    title: {
        es: { type: String },
        ca: { type: String }
    },
    description: {
        es: { type: String },
        ca: { type: String }
    },
    link: { type: String, required: false },
    order: { type: Number, default: 0 },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true
    },
    brandLogo: { type: String },
    discount: { type: Number, min: 0, max: 100 },
}, { timestamps: true });
export default mongoose.models.Offer || mongoose.model('Offer', OfferSchema);