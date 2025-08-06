'use client';
import { Dialog, DialogTitle } from '@headlessui/react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import { useClientStats } from '@/contexts/ClientStatsContext';

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, client, isDeleting }) {
// Locale detection (default to 'ca')
let locale = 'ca';
if (typeof window !== 'undefined' && window.navigator) {
    const lang = window.navigator.language || window.navigator.userLanguage;
    if (lang && lang.toLowerCase().startsWith('es')) locale = 'es';
}
// Translations
const translations = {
    ca: {
        title: 'Eliminar Client',
        confirm: 'Estàs segur que vols eliminar el client',
        irreversible: 'Aquesta acció no es pot desfer.',
        cancel: 'Cancel·lar',
        delete: 'Eliminar',
        deleting: 'Eliminant...'
    },
    es: {
        title: 'Eliminar Cliente',
        confirm: '¿Estás seguro de que deseas eliminar al cliente',
        irreversible: 'Esta acción no se puede deshacer.',
        cancel: 'Cancelar',
        delete: 'Eliminar',
        deleting: 'Eliminando...'
    }
};
const t = translations[locale];
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
                        {t.title}
                    </DialogTitle>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 cursor-pointer"
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
                        {t.confirm} <span className="font-bold">{client?.name} {client?.lastName}</span>?
                        <br />
                        <span className="text-sm text-red-500">{t.irreversible}</span>
                    </p>

                    <div className="flex justify-center space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border cursor-pointer border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            {t.cancel}
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={isDeleting}
                            className="px-4 py-2 border cursor-pointer border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            {isDeleting ? t.deleting : t.delete}
                        </button>
                    </div>
                </div>
            </Dialog.Panel>
        </div>
    </Dialog>
);
} 