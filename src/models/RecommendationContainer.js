import mongoose from 'mongoose';

const RecommendationContainerSchema = new mongoose.Schema({
    title: { type: String, required: true },
    items: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        }
    ]
}, { timestamps: true });

export default mongoose.models.RecommendationContainer || mongoose.model('RecommendationContainer', RecommendationContainerSchema);
