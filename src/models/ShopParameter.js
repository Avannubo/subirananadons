import mongoose from "mongoose";

const ShopParameterSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    description: { type: String },
}, { timestamps: true });

export default mongoose.models.ShopParameter || mongoose.model("ShopParameter", ShopParameterSchema);
