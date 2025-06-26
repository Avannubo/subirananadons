import mongoose from 'mongoose';

const OfferSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    link: { type: String, required: false },
    order: { type: Number, default: 0 },
    brand: { type: String },
    brandLogo: { type: String }, 
    discount: { type: Number, min: 0, max: 100 },
}, { timestamps: true });

export default mongoose.models.Offer || mongoose.model('Offer', OfferSchema);