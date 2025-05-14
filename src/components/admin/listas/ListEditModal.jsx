'use client';
import { useRef, useState, useEffect } from 'react';
import { Dialog, DialogTitle } from '@headlessui/react';
import { FiX, FiEdit2, FiUpload, FiImage, FiTrash2 } from 'react-icons/fi';
import ListProductsManager from './ListProductsManager';
import Image from 'next/image';
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
    const fileInputRef = useRef(null);
    const [imagePreview, setImagePreview] = useState('/assets/images/Screenshot_4.png');
    const [isDragging, setIsDragging] = useState(false);
    // Update image preview when the modal is opened with a new list
    useEffect(() => {
        if (selectedList?.image) {
            setImagePreview(selectedList.image);
        } else {
            setImagePreview('/assets/images/Screenshot_4.png');
        }
    }, [selectedList]);
    if (!showModal || !selectedList) return null;
    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            alert('La imagen no debe superar los 5MB');
            return;
        }
        if (!file.type.startsWith('image/')) {
            alert('El archivo debe ser una imagen');
            return;
        }
        // Create a preview URL
        const reader = new FileReader();
        reader.onload = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
        // Add to form data for submission
        const newEvent = {
            target: {
                name: 'image',
                value: file
            }
        };
        handleEditChange(newEvent);
    };
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            alert('La imagen no debe superar los 5MB');
            return;
        }
        if (!file.type.startsWith('image/')) {
            alert('El archivo debe ser una imagen');
            return;
        }
        // Create a preview URL
        const reader = new FileReader();
        reader.onload = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
        // Add to form data for submission
        const newEvent = {
            target: {
                name: 'image',
                value: file
            }
        };
        handleEditChange(newEvent);
    };
    const handleRemoveImage = () => {
        setImagePreview('/assets/images/Screenshot_4.png');
        const newEvent = {
            target: {
                name: 'image',
                value: '/assets/images/Screenshot_4.png'
            }
        };
        handleEditChange(newEvent);
    };
    return (
        <Dialog open={showModal} onClose={() => setShowModal(false)} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-[80vw] bg-white rounded-lg shadow-xl overflow-auto">
                    <div className="flex justify-between items-center p-4 border-b border-gray-300 bg-gray-50">
                        <DialogTitle className="text-lg font-medium text-gray-800 flex items-center">
                            <FiEdit2 className="mr-2 text-[#00B0C8]" />
                            Editar Lista de Nacimiento
                        </DialogTitle>
                        <button
                            onClick={() => setShowModal(false)}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    </div>
                    <form onSubmit={handleUpdateList} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className='flex flex-row space-x-4'>
                                {/* Image Upload */}
                                <div className="mb-6 flex-1">
                                    <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                                        Imagen de portada
                                    </label>
                                    <div
                                        className={`mt-1 flex flex-col items-center relative ${isDragging ? 'border-[#00B0C8] bg-blue-50' : 'border-gray-300'} border-2 border-dashed rounded-lg p-4 transition-colors`}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                    >
                                        <div className="relative w-full h-56 mb-3 rounded-md overflow-hidden bg-gray-50">
                                            <Image
                                                src={imagePreview}
                                                alt="Imagen de portada"
                                                fill
                                                className="object-contain"
                                            />
                                            {imagePreview !== '/assets/images/Screenshot_4.png' && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            id="image"
                                            ref={fileInputRef}
                                            onChange={handleImageUpload}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <div className="flex flex-col items-center">
                                            <FiImage className="text-gray-400 mb-2" size={24} />
                                            <p className="text-sm text-gray-500 mb-2 text-center">
                                                Arrastra una imagen aquí o haz clic para seleccionar
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                            >
                                                <FiUpload className="mr-2 -ml-1 h-5 w-5 text-gray-400" />
                                                Seleccionar imagen
                                            </button>
                                            <p className="mt-1 text-xs text-gray-400">
                                                La imagen se mostrará como portada de la lista. Max: 5MB.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className='flex-1'>
                                    <section className="border-b border-gray-200 pb-4 mb-4">
                                        <h3 className="text-sm font-semibold text-gray-800 uppercase mb-3 flex items-center">
                                            <FiEdit2 className="mr-2 text-[#00B0C8]" /> Información Básica
                                        </h3>
                                        {/* Title */}
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]"
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]"
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]"
                                                required
                                            />
                                        </div>
                                    </section>
                                    <section>
                                        <h3 className="text-sm font-semibold text-gray-800 uppercase mb-3 flex items-center">
                                            <FiImage className="mr-2 text-[#00B0C8]" /> Detalles Adicionales
                                        </h3>
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]"
                                                placeholder="Escribe un mensaje o descripción para tus invitados"
                                                rows={4}
                                            />
                                        </div>
                                        {/* Privacy */}
                                    </section>
                                </div>
                                </div>
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
                            {/* Products Manager */}
                            <div className="border-l border-gray-200 pl-6">
                                <h3 className="text-sm font-semibold text-gray-800 uppercase mb-3 flex items-center">
                                    <FiImage className="mr-2 text-[#00B0C8]" /> Productos en la Lista
                                </h3>
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
                </Dialog.Panel>
            </div>
        </Dialog>
    );
} 