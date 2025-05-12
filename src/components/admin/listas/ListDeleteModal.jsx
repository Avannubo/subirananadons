'use client';
import { FiX, FiAlertCircle } from 'react-icons/fi';

export default function ListDeleteModal({
    showModal,
    setShowModal,
    selectedList,
    handleDeleteList,
    loading
}) {
    if (!showModal || !selectedList) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <span className="text-red-500 mr-2">
                                <FiAlertCircle size={24} />
                            </span>
                            <h2 className="text-xl font-bold text-gray-800">Eliminar Lista</h2>
                        </div>
                        <button
                            onClick={() => setShowModal(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <FiX size={24} />
                        </button>
                    </div>

                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <FiAlertCircle className="h-5 w-5 text-red-500" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">
                                    ¿Estás seguro de que deseas eliminar la lista "{selectedList.name}"? Esta acción no se puede deshacer.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Información de la lista:</h3>
                        <p className="text-sm text-gray-600"><span className="font-medium">Referencia:</span> {selectedList.reference}</p>
                        <p className="text-sm text-gray-600"><span className="font-medium">Nombre del bebé:</span> {selectedList.babyName}</p>
                        <p className="text-sm text-gray-600"><span className="font-medium">Fecha de creación:</span> {selectedList.creationDate}</p>
                        <p className="text-sm text-gray-600"><span className="font-medium">Estado:</span> {selectedList.status}</p>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteList}
                                disabled={loading}
                                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Eliminando...' : 'Eliminar Lista'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 