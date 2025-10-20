import { Schema, model } from 'mongoose';
const CarrierSchema = new Schema({
    nombre: { type: String, required: true },
    logo: { type: String, default: '' },
    retraso: { type: String, required: true },
    estado: { type: Boolean, default: true },
    envioGratis: { type: Boolean, default: false },
    posicion: { type: Number, required: true },
    minimoEnvioGratis: { type: Number, default: 0 },
    minimoPesoGratis: { type: Number, default: 0 }
}, { timestamps: true });
export default model('Carrier', CarrierSchema);