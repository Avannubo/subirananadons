import { Schema, model } from 'mongoose';
const ShippingPreferenceSchema = new Schema({
    gastosManipulacion: { type: Number, default: 2.00 },
    minimoEnvioGratis: { type: Number, default: 0 },
    minimoPesoGratis: { type: Number, default: 0 },
    transportistaPredeterminado: { type: Schema.Types.ObjectId, ref: 'Carrier' },
    ordenarPor: { type: String, enum: ['precio', 'nombre', 'posicion'], default: 'posicion' },
    ordenDireccion: { type: String, enum: ['ascendente', 'descendente'], default: 'ascendente' }
}, { timestamps: true });
export default model('ShippingPreference', ShippingPreferenceSchema);