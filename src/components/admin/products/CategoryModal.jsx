'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogTitle } from '@headlessui/react';
import { FiX } from 'react-icons/fi';

// Utility to get display name from category (handles both string and object)
function getCategoryDisplayName(cat) {
    if (!cat) return '';
    if (typeof cat.name === 'object') {
        return cat.name.ca || cat.name.es || '';
    }
    return cat.name || '';
}

export default function CategoryModal({ isOpen, onClose, onSave, category, parent, isEditing = false }) {
    const [formData, setFormData] = useState({
        name: { ca: '', es: '' },
        slug: '',
        // description: { ca: '', es: '' },
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
            let migratedName = category.name;
            if (typeof category.name === 'string') {
                migratedName = { es: category.name, ca: '' };
            } else if (!category.name?.es && category.name?.ca) {
                migratedName = { es: '', ca: category.name.ca };
            } else if (!category.name?.ca && category.name?.es) {
                migratedName = { es: category.name.es, ca: '' };
            } else if (!category.name?.es && !category.name?.ca) {
                migratedName = { es: '', ca: '' };
            }
            setFormData({
                _id: category._id,
                name: migratedName,
                slug: category.slug || '',
                // description: {
                //     ca: (category.description && category.description.ca) || '',
                //     es: (category.description && category.description.es) || ''
                // },
                parent: category.parent || null,
                isActive: category.isActive !== false
            });
        } else if (parent) {
            // Defensive: migrate parent if needed
            let migratedParent = parent;
            if (parent && typeof parent.name === 'string') {
                migratedParent = { ...parent, name: { es: parent.name, ca: '' } };
            } else if (parent && (!parent.name?.es && parent.name?.ca)) {
                migratedParent = { ...parent, name: { es: '', ca: parent.name.ca } };
            } else if (parent && (!parent.name?.ca && parent.name?.es)) {
                migratedParent = { ...parent, name: { es: parent.name.es, ca: '' } };
            } else if (parent && (!parent.name?.es && !parent.name?.ca)) {
                migratedParent = { ...parent, name: { es: '', ca: '' } };
            }
            setFormData(prev => ({
                ...prev,
                name: { ca: '', es: '' },
                // description: { ca: '', es: '' },
                parent: migratedParent._id,
                slug: '',
                isActive: true
            }));
        } else {
            setFormData({
                name: { ca: '', es: '' },
                slug: '',
                // description: { ca: '', es: '' },
                parent: null,
                isActive: true
            });
        }
    }, [isEditing, category, parent]);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value, type, checked, id } = e.target;
        // Handle translation fields for name (and description if needed)
        if (name === 'name') {
            setFormData(prev => ({
                ...prev,
                name: {
                    ...prev.name,
                    [id === 'name-ca' ? 'ca' : 'es']: value
                }
            }));
            // Uncomment if you add description translation fields
            // } else if (name === 'description') {
            //     setFormData(prev => ({
            //         ...prev,
            //         description: {
            //             ...prev.description,
            //             [id === 'description-ca' ? 'ca' : 'es']: value
            //         }
            //     }));
        } else if (name === 'parent') {
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
    // Generate slug from name (prefer Catalan, fallback to Spanish)
    const generateSlug = () => {
        const baseName = formData.name?.ca || formData.name?.es || '';
        if (baseName) {
            const slug = baseName
                .toLowerCase()
                .replace(/[^\w ]+/g, '')
                .replace(/ +/g, '-');
            setFormData(prev => ({ ...prev, slug }));
        }
    };

    // Form validation
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.ca && !formData.name.es) {
            newErrors.name = 'El nom o el nombre és obligatori';
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
            // Only send translation fields for name
            const submissionData = {
                ...formData,
                name: {
                    ca: formData.name.ca,
                    es: formData.name.es
                },
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
        ? `Editar Categoría: ${getCategoryDisplayName(category)}`
        : parent && typeof parent === 'object'
            ? `Añadir Subcategoría a: ${getCategoryDisplayName(parent)}`
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

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label htmlFor="name-ca" className="block text-sm font-medium text-gray-700">
                                        Títol del Grup (CA) *
                                    </label>
                                    <input
                                        type="text"
                                        id="name-ca"
                                        name="name"
                                        value={formData.name.ca}
                                        onChange={handleChange}
                                        onBlur={generateSlug}
                                        className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-[#36A9E1] focus:border-[#36A9E1]`}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="name-es" className="block text-sm font-medium text-gray-700">
                                        Títol del Grup (ES) *
                                    </label>
                                    <input
                                        type="text"
                                        id="name-es"
                                        name="name"
                                        value={formData.name.es}
                                        onChange={handleChange}
                                        onBlur={generateSlug}
                                        className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-[#36A9E1] focus:border-[#36A9E1]`}
                                    />
                                </div>
                            </div>
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
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
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#36A9E1] focus:border-[#36A9E1]"
                                    disabled={loadingCategories}
                                >
                                    <option value="">Ninguna (Categoría Principal)</option>
                                    {allCategories.map(cat => (
                                        <option key={cat._id} value={cat._id}>
                                            {getCategoryDisplayName(cat)} {cat.level > 1 ? `(Nivel ${cat.level})` : ''}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-gray-500">
                                    Selecciona la categoría padre o déjalo vacío para crear una categoría principal.
                                </p>
                            </div>

                            {/* Slug */}
                            {/* <div>
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
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#36A9E1] focus:border-[#36A9E1]"
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
                            </div> */}

                            {/* Description */}
                            {/* <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                    Descripción
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={3}
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#36A9E1] focus:border-[#36A9E1]"
                                />
                            </div> */}

                            {/* Active Status */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-[#36A9E1] border-gray-300 rounded focus:ring-[#36A9E1]"
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
                                className="px-4 py-2 bg-[#36A9E1] text-white rounded-md text-sm font-medium hover:bg-[#008A9B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#36A9E1] disabled:opacity-50"
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