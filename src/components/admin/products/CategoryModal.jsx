'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogTitle } from '@headlessui/react';
import { FiX } from 'react-icons/fi';

export default function CategoryModal({ isOpen, onClose, onSave, category, parent, isEditing = false }) {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        parent: null,
        isActive: true
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [allCategories, setAllCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);

    // Load available categories for parent selection
    useEffect(() => {
        if (isOpen) {
            fetchAllCategories();
        }
    }, [isOpen]);

    // Fetch all categories for the parent dropdown
    const fetchAllCategories = async () => {
        try {
            setLoadingCategories(true);
            const response = await fetch('/api/categories?flat=true');

            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }

            const data = await response.json();
            // Filter out the current category if editing to prevent circular references
            const filteredCategories = isEditing && category?._id
                ? data.filter(cat => cat._id !== category._id)
                : data;

            setAllCategories(filteredCategories);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoadingCategories(false);
        }
    };

    // Load category data when editing
    useEffect(() => {
        if (isEditing && category) {
            setFormData({
                _id: category._id,
                name: category.name || '',
                slug: category.slug || '',
                description: category.description || '',
                parent: category.parent || null,
                isActive: category.isActive !== false
            });
        } else if (parent) {
            // Set parent ID when adding a subcategory
            setFormData(prev => ({
                ...prev,
                parent: parent._id
            }));
        }
    }, [isEditing, category, parent]);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Special handling for the parent field to ensure it's properly set
        if (name === 'parent') {
            // If empty string (root category option), set to null
            // Otherwise use the selected category ID
            setFormData(prev => ({
                ...prev,
                parent: value === '' ? null : value
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    // Generate slug from name
    const generateSlug = () => {
        if (formData.name) {
            const slug = formData.name
                .toLowerCase()
                .replace(/[^\w ]+/g, '')
                .replace(/ +/g, '-');

            setFormData(prev => ({ ...prev, slug }));
        }
    };

    // Form validation
    const validateForm = () => {
        const newErrors = {};

        if (!formData.name) {
            newErrors.name = 'El nombre es obligatorio';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            // Ensure parent is either a valid ID or null
            const submissionData = {
                ...formData,
                parent: formData.parent || null
            };

            await onSave(submissionData);
        } catch (error) {
            console.error('Error saving category:', error);
        } finally {
            setLoading(false);
        }
    };

    const modalTitle = isEditing
        ? `Editar Categoría: ${category?.name}`
        : parent
            ? `Añadir Subcategoría a: ${parent.name}`
            : 'Añadir Nueva Categoría';

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
                    <div className="flex justify-between items-center p-4 ">
                        <DialogTitle className="text-lg font-medium">
                            {modalTitle}
                        </DialogTitle>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="px-4 pb-4" >
                        <div className="space-y-4">
                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    onBlur={generateSlug}
                                    className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300'
                                        } rounded-md focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]`}
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            {/* Parent Category Selection */}
                            <div>
                                <label htmlFor="parent" className="block text-sm font-medium text-gray-700">
                                    Categoría Padre
                                </label>
                                <select
                                    id="parent"
                                    name="parent"
                                    value={formData.parent || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]"
                                    disabled={loadingCategories}
                                >
                                    <option value="">Ninguna (Categoría Principal)</option>
                                    {allCategories.map(cat => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.name} {cat.level > 1 ? `(Nivel ${cat.level})` : ''}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-gray-500">
                                    Selecciona la categoría padre o déjalo vacío para crear una categoría principal.
                                </p>
                            </div>

                            {/* Slug */}
                            <div>
                                <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                                    Slug
                                </label>
                                <div className="flex mt-1">
                                    <input
                                        type="text"
                                        id="slug"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]"
                                    />
                                    <button
                                        type="button"
                                        onClick={generateSlug}
                                        className="ml-2 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100 hover:bg-gray-200"
                                    >
                                        Generar
                                    </button>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Se usa en URLs. Se generará automáticamente si se deja en blanco.
                                </p>
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                    Descripción
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={3}
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]"
                                />
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-[#00B0C8] border-gray-300 rounded focus:ring-[#00B0C8]"
                                />
                                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                                    Categoría activa
                                </label>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-[#00B0C8] text-white rounded-md text-sm font-medium hover:bg-[#008A9B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B0C8] disabled:opacity-50"
                            >
                                {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
                            </button>
                        </div>
                    </form>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
} 