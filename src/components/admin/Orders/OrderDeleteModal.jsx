'use client';
import { useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

export default function OrderDeleteModal({ isOpen, onClose, onConfirm, orderReference, isLoading }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#00000050] bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
                <div className="p-6">
                    <div className="flex items-center justify-center mb-4 text-red-500">
                        <FiAlertTriangle size={48} />
                    </div>
                    <h3 className="text-xl font-semibold text-center mb-4">Confirmar eliminación</h3>
                    <p className="text-gray-600 text-center mb-6">
                        ¿Estás seguro de que deseas eliminar el pedido <span className="font-bold">{orderReference}</span>? Esta acción no se puede deshacer.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Eliminando...' : 'Eliminar pedido'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 