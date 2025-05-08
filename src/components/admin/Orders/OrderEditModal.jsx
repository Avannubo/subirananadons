'use client';
import { useState, useEffect } from 'react';
import { FiX, FiSave } from 'react-icons/fi';

export default function OrderEditModal({ isOpen, onClose, onSave, order, isLoading }) {
    const [formData, setFormData] = useState({
        status: '',
        trackingNumber: '',
        notes: ''
    });

    // Initialize form data when order changes
    useEffect(() => {
        if (order) {
            // Map the display status back to the database status
            const statusMap = {
                'Pendiente de pago': 'pending',
                'Pago aceptado': 'processing',
                'Enviado': 'shipped',
                'Entregado': 'delivered',
                'Cancelado': 'cancelled'
            };

            setFormData({
                status: statusMap[order.status] || 'pending',
                trackingNumber: order.trackingNumber || '',
                notes: order.notes || ''
            });
        }
    }, [order]);

    if (!isOpen || !order) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(order.id, formData);
    };

    return (
        <div className="fixed inset-0 bg-[#00000050] bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-xl w-full">
                <div className="flex justify-between items-center border-b p-4">
                    <h3 className="text-xl font-semibold">
                        Editar Pedido: {order.reference}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                        disabled={isLoading}
                    >
                        <FiX size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Estado
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]"
                                disabled={isLoading}
                                required
                            >
                                <option value="pending">Pendiente de pago</option>
                                <option value="processing">Pago aceptado</option>
                                <option value="shipped">Enviado</option>
                                <option value="delivered">Entregado</option>
                                <option value="cancelled">Cancelado</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Número de seguimiento
                            </label>
                            <input
                                type="text"
                                name="trackingNumber"
                                value={formData.trackingNumber}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]"
                                placeholder="Número de seguimiento (opcional)"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notas
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]"
                            placeholder="Notas adicionales sobre el pedido"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex justify-between items-center mt-6 pt-4 border-t">
                        <div className="text-sm text-gray-500">
                            ID: {order.id}
                            <span className="mx-2">•</span>
                            Cliente: {order.customer}
                        </div>
                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B0C8]"
                                disabled={isLoading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00B0C8] hover:bg-[#008da0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B0C8] flex items-center"
                                disabled={isLoading}
                            >
                                <FiSave className="mr-2" />
                                {isLoading ? 'Guardando...' : 'Guardar cambios'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
} 