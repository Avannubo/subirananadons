'use client';
import { useState, useEffect } from 'react';
// Translation object for Catalan and Spanish
const translations = {
    ca: {
        title: 'Modificar Llista',
        status: 'Estat',
        active: 'Activa',
        completed: 'Completada',
        inactive: 'Inactiva',
        privacy: 'Privacitat',
        public: 'Llista Pública',
        private: 'Llista Privada',
        publicDesc: 'Qualsevol persona pot veure aquesta llista',
        privateDesc: 'Només persones amb l’enllaç poden veure aquesta llista',
        activeDesc: 'Aquesta llista està disponible per rebre regals',
        completedDesc: 'Tots els productes han estat rebuts',
        inactiveDesc: 'Aquesta llista ha estat inactiva',
        publicToggle: 'Llista Pública (Visible per a qualsevol persona)',
        cancel: 'Cancel·lar',
        saving: 'Desant...',
        save: 'Desar Canvis',
    },
    es: {
        title: 'Modificar Lista',
        status: 'Estado',
        active: 'Activa',
        completed: 'Completada',
        inactive: 'InActiva',
        privacy: 'Privacidad',
        public: 'Lista Pública',
        private: 'Lista Privada',
        publicDesc: 'Cualquier persona puede ver esta lista',
        privateDesc: 'Solo personas con el enlace pueden ver esta lista',
        activeDesc: 'Esta lista está disponible para recibir regalos',
        completedDesc: 'Todos los productos fueron recibidos',
        inactiveDesc: 'Esta lista ha sido InActiva',
        publicToggle: 'Lista Pública (Visible para cualquier persona)',
        cancel: 'Cancelar',
        saving: 'Guardando...',
        save: 'Guardar Cambios',
    }
};

function getLocale() {
    if (typeof window !== 'undefined') {
        const lang = window.navigator.language || 'es';
        return lang.startsWith('ca') ? 'ca' : 'es';
    }
    return 'es';
}
import { FiX } from 'react-icons/fi';

export default function ListStatusModal({
    showModal,
    setShowModal,
    selectedList,
    updateStatus,
    loading
}) {
    const locale = getLocale();
    const t = translations[locale];
    const [status, setStatus] = useState(selectedList?.status || t.active);
    const [isPublic, setIsPublic] = useState(selectedList?.isPublic !== undefined ? selectedList?.isPublic : true);

    // Reset status and privacy when selectedList changes
    useEffect(() => {
        if (selectedList) {
            setStatus(selectedList.status || t.active);
            setIsPublic(selectedList.isPublic !== undefined ? selectedList.isPublic : true);
        }
        // eslint-disable-next-line
    }, [selectedList]);

    if (!showModal || !selectedList) return null;

    const handleStatusChange = (e) => {
        setStatus(e.target.value);
    };

    const handlePrivacyChange = (e) => {
        setIsPublic(e.target.checked);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Pass both status and privacy updates
        updateStatus(selectedList.id, status, isPublic);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#00000050] bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <span className="text-[#00B0C8] mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                            <h2 className="text-xl font-bold text-gray-800">{t.title}</h2>
                        </div>
                        <button
                            onClick={() => setShowModal(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <FiX size={24} />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                {t.status} <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={status}
                                onChange={handleStatusChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                                required
                            >
                                <option value={t.active}>{t.active}</option>
                                <option value={t.completed}>{t.completed}</option>
                                <option value={t.inactive}>{t.inactive}</option>
                            </select>
                        </div>

                        {/* <div>
                            <label htmlFor="privacyToggle" className="block text-sm font-medium text-gray-700 mb-1">
                                {t.privacy}
                            </label>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="privacyToggle"
                                    name="privacyToggle"
                                    checked={isPublic}
                                    onChange={handlePrivacyChange}
                                    className="h-4 w-4 text-[#00B0C8] focus:ring-[#00B0C8] border-gray-300 rounded"
                                />
                                <label htmlFor="privacyToggle" className="ml-2 block text-sm text-gray-700">
                                    {t.publicToggle}
                                </label>
                            </div>
                        </div> */}

                        <div className="mt-6 space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full mr-3 ${status === t.active
                                        ? 'bg-green-500'
                                        : status === t.completed
                                            ? 'bg-blue-500'
                                            : 'bg-red-500'
                                        }`}></div>
                                    <div>
                                        <p className="font-medium text-sm text-gray-700">
                                            {status === t.active
                                                ? t.public + ''
                                                : status === t.completed
                                                    ? t.completed
                                                    : t.inactive}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {status === t.active
                                                ? t.activeDesc
                                                : status === t.completed
                                                    ? t.completedDesc
                                                    : t.inactiveDesc}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full mr-3 ${isPublic ? 'bg-teal-500' : 'bg-purple-500'}`}></div>
                                    <div>
                                        <p className="font-medium text-sm text-gray-700">
                                            {isPublic ? t.public : t.private}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {isPublic
                                                ? t.publicDesc
                                                : t.privateDesc}
                                        </p>
                                    </div>
                                </div>
                            </div> */}
                        </div>

                        <div className="border-t border-gray-200 pt-4 mt-6">
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                >
                                    {t.cancel}
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00B0C8] hover:bg-[#008da0] focus:outline-none ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? t.saving : t.save}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 