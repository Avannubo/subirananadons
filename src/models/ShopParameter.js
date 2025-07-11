import mongoose from "mongoose";


const ShopParameterSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: {
        es: {value: { type: mongoose.Schema.Types.Mixed, required: true }},
        ca: {value: { type: mongoose.Schema.Types.Mixed, required: true }}
    },
    description: {
        es: { type: String, required: true },
        ca: { type: String, required: true }
    }
}, { timestamps: true });

export default mongoose.models.ShopParameter || mongoose.model("ShopParameter", ShopParameterSchema);
