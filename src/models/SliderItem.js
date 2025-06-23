const mongoose = require('mongoose');

const SliderItemSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    btnText: { type: String },
    btnLink: { type: String },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.models.SliderItem || mongoose.model('SliderItem', SliderItemSchema);
