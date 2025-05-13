'use client';
import { useRef } from 'react';
import { FiX, FiEdit2 } from 'react-icons/fi';
import ListProductsManager from './ListProductsManager';

export default function ListEditModal({
    showModal,
    setShowModal,
    selectedList,
    editForm,
    handleEditChange,
    handleUpdateList,
    loading,
    saveButtonRef
}) {
    const modalRef = useRef(null);

    if (!showModal || !selectedList) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#00000050] bg-opacity-50 flex items-center justify-center p-4">
            <div
                ref={modalRef}
                className="bg-white rounded-lg shadow-xl w-full max-w-[90vw] max-h-[90vh] overflow-y-auto"
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <span className="text-[#00B0C8] mr-2">
                                <FiEdit2 size={24} />
                            </span>
                            <h2 className="text-xl font-bold text-gray-800">Editar Lista de Nacimiento</h2>
                        </div>
                        <button
                            onClick={() => setShowModal(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <FiX size={24} />
                        </button>
                    </div>
                    <form onSubmit={handleUpdateList} className="space-y-6">
                        <div className='flex flex-row gap-6'>
                            <div className="">
                                <div className='flex-1'>  {/* Title */}
                                    <div className="mb-4">
                                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                            Título de la Lista <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="title"
                                            name="title"
                                            value={editForm.title}
                                            onChange={handleEditChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                                            placeholder="Ej: Lista de Baby Shower para María"
                                            required
                                        />
                                    </div>
                                    {/* Baby Name */}
                                    <div className="mb-4">
                                        <label htmlFor="babyName" className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombre del Bebé <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="babyName"
                                            name="babyName"
                                            value={editForm.babyName}
                                            onChange={handleEditChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                                            placeholder="Ej: Lucas o Bebé García (si aún no tiene nombre)"
                                            required
                                        />
                                    </div>
                                    {/* Due Date */}
                                    <div>
                                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                                            Fecha Prevista <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            id="dueDate"
                                            name="dueDate"
                                            value={editForm.dueDate}
                                            onChange={handleEditChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className='flex-1'>
                                    {/* Description */}
                                    <div className="mb-4">
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                            Descripción
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={editForm.description}
                                            onChange={handleEditChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                                            placeholder="Escribe un mensaje o descripción para tus invitados"
                                            rows={6}
                                        />
                                    </div>
                                    {/* Privacy */}
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="isPublic"
                                                name="isPublic"
                                                checked={editForm.isPublic}
                                                onChange={handleEditChange}
                                                className="h-4 w-4 text-[#00B0C8] focus:ring-[#00B0C8] border-gray-300 rounded"
                                            />
                                            <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                                                Lista Pública (Visible para cualquier persona con el enlace)
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 ml-6">
                                            Marca esta opción si deseas que la lista sea visible para cualquier persona que tenga el enlace. Desmárcala para que sea privada.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* Products Manager */}
                            <div className="border-t border-gray-200 pt-6 mt-2">
                                <ListProductsManager
                                    listId={selectedList.id}
                                    onUpdate={null}
                                />
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
                                    ref={saveButtonRef}
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