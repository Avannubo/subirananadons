'use client';
import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

export default function ListStatusModal({
    showModal,
    setShowModal,
    selectedList,
    updateStatus,
    loading
}) {
    const [status, setStatus] = useState(selectedList?.status || 'Activa');

    // Reset status when selectedList changes
    useEffect(() => {
        if (selectedList) {
            setStatus(selectedList.status || 'Activa');
        }
    }, [selectedList]);

    if (!showModal || !selectedList) return null;

    const handleStatusChange = (e) => {
        setStatus(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateStatus(selectedList.id, status);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <span className="text-[#00B0C8] mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                            <h2 className="text-xl font-bold text-gray-800">Cambiar Estado de la Lista</h2>
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
                                Estado <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={status}
                                onChange={handleStatusChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                                required
                            >
                                <option value="Activa">Activa</option>
                                <option value="Completada">Completada</option>
                                <option value="Cancelada">Cancelada</option>
                            </select>
                        </div>

                        <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full mr-3 ${status === 'Activa'
                                    ? 'bg-green-500'
                                    : status === 'Completada'
                                        ? 'bg-blue-500'
                                        : 'bg-red-500'
                                    }`}></div>
                                <div>
                                    <p className="font-medium text-sm text-gray-700">
                                        {status === 'Activa'
                                            ? 'Lista Activa'
                                            : status === 'Completada'
                                                ? 'Lista Completada'
                                                : 'Lista Cancelada'}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        {status === 'Activa'
                                            ? 'Esta lista está disponible para recibir regalos'
                                            : status === 'Completada'
                                                ? 'Todos los productos fueron recibidos'
                                                : 'Esta lista ha sido cancelada'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4 mt-6">
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00B0C8] hover:bg-[#008da0] focus:outline-none ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 