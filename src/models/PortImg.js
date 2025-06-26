import mongoose from 'mongoose';

const PortImgSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    active: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now }
});

export default mongoose.models.PortImg || mongoose.model('PortImg', PortImgSchema);
