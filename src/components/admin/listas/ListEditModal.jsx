'use client';
import { useRef, useState, useEffect } from 'react';
import { Dialog, DialogTitle } from '@headlessui/react';
import { FiX, FiEdit2, FiUpload, FiImage, FiTrash2 } from 'react-icons/fi';
import ListProductsManager from './ListProductsManager';
import Image from 'next/image';
import ProductSelection from './ProductSelection';

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
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        babyName: '',
        dueDate: '',
        isPublic: true,
        items: []
    });

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
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            {/* Modal Container */}
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-full h-full bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">

                    {/* Header */}
                    <div className="flex justify-between items-center p-4 px-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                        <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center">
                            <FiEdit2 className="mr-3 text-[#00B0C8]" />
                            Editar Lista de Nacimiento
                        </DialogTitle>
                        <button
                            onClick={() => setShowModal(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                        >
                            <FiX className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Content - Scrollable */}
                    <div className="flex-1 overflow-y-auto">
                        <form onSubmit={handleUpdateList} className="p-6">

                            {/* Basic Information Section */}
                            <div className="mb-4">
                                {/* <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <FiEdit2 className="mr-2 text-[#00B0C8]" />
                                        Información Básica
                                    </h3>
                                </div> */}
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 '>
                                    {/* Form Fields Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6  ">
                                        {/* Title */}
                                        <div className="space-y-2">
                                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                                Título de la Lista <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="title"
                                                name="title"
                                                value={editForm.title}
                                                onChange={handleEditChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B0C8] focus:border-[#00B0C8] transition-colors"
                                                placeholder="Ej: Lista de Baby Shower para María"
                                                required
                                            />
                                        </div>

                                        {/* Baby Name */}
                                        <div className="space-y-2">
                                            <label htmlFor="babyName" className="block text-sm font-medium text-gray-700">
                                                Nombre del Bebé <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="babyName"
                                                name="babyName"
                                                value={editForm.babyName}
                                                onChange={handleEditChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B0C8] focus:border-[#00B0C8] transition-colors"
                                                placeholder="Ej: Lucas o Bebé García"
                                                required
                                            />
                                        </div>

                                        {/* Due Date */}
                                        <div className="space-y-2">
                                            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                                                Fecha Prevista <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                id="dueDate"
                                                name="dueDate"
                                                value={editForm.dueDate}
                                                onChange={handleEditChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B0C8] focus:border-[#00B0C8] transition-colors"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2 mb-2">
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                            Descripción
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={editForm.description}
                                            onChange={handleEditChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B0C8] focus:border-[#00B0C8] transition-colors resize-y"
                                            placeholder="Escribe un mensaje o descripción para tus invitados"
                                            rows={1}
                                        />
                                    </div>
                                </div>


                                {/* Privacy Settings */}
                                {/* <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div className="flex items-start space-x-3">
                                        <input
                                            type="checkbox"
                                            id="isPublic"
                                            name="isPublic"
                                            checked={editForm.isPublic}
                                            onChange={handleEditChange}
                                            className="h-4 w-4 text-[#00B0C8] focus:ring-[#00B0C8] border-gray-300 rounded mt-1"
                                        />
                                        <div>
                                            <label htmlFor="isPublic" className="block text-sm font-medium text-gray-700">
                                                Lista Pública
                                            </label>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Marca esta opción si deseas que la lista sea visible para cualquier persona que tenga el enlace. Desmárcala para que sea privada.
                                            </p>
                                        </div>
                                    </div>
                                </div> */}
                            </div>

                            {/* Products Section */}
                            <div className="border-t border-gray-200 pt-2">
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <FiImage className="mr-2 text-[#00B0C8]" />
                                        Gestión de Productos
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Current Products */}                                    <div className="space-y-4">
                                        <h4 className="text-md font-medium text-gray-700 border-b border-gray-200 pb-2">
                                            Productos Actuales
                                        </h4>
                                        <div className="bg-gray-50 p-4 rounded-lg min-h-[300px]">
                                            <ListProductsManager
                                                listId={selectedList.id}
                                                onUpdate={null}
                                                // ref={listManagerRef}
                                            />
                                        </div>
                                    </div>

                                    {/* Add New Products */}
                                    <div className="space-y-4">
                                        <h4 className="text-md font-medium text-gray-700 border-b border-gray-200 pb-2">
                                            Agregar Productos
                                        </h4>
                                        <div className="bg-gray-50 p-4 rounded-lg min-h-[300px]">
                                            <ProductSelection
                                                selectedProducts={formData.items}
                                                // onProductSelect={handleProductSelect}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Footer - Fixed */}
                    <div className="border-t border-gray-200 p-6 bg-white flex-shrink-0">
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                ref={saveButtonRef}
                                onClick={handleUpdateList}
                                className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00B0C8] hover:bg-[#008da0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B0C8] transition-colors ${loading ? 'opacity-75 cursor-not-allowed' : ''
                                    }`}
                            >
                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>

                </Dialog.Panel>
            </div>
        </Dialog>
    );
}