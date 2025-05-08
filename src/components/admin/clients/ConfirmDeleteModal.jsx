'use client';
import { Dialog, DialogTitle } from '@headlessui/react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import { useClientStats } from '@/contexts/ClientStatsContext';

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, client, isDeleting }) {
    const { notifyChange } = useClientStats();

    const handleConfirm = async () => {
        await onConfirm();
        await notifyChange();
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b border-gray-200">
                        <DialogTitle className="text-lg font-medium text-red-600">
                            Eliminar Cliente
                        </DialogTitle>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="flex items-center justify-center mb-4">
                            <div className="bg-red-100 rounded-full p-3">
                                <FiAlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                        </div>

                        <p className="text-center text-gray-700 mb-6">
                            ¿Estás seguro de que deseas eliminar al cliente <span className="font-bold">{client?.name} {client?.lastName}</span>?
                            <br />
                            <span className="text-sm text-red-500">Esta acción no se puede deshacer.</span>
                        </p>

                        <div className="flex justify-center space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={isDeleting}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                {isDeleting ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
} 