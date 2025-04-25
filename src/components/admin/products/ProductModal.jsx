'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogTitle } from '@headlessui/react';
import { FiX, FiUpload, FiChevronRight, FiFolder, FiFolderPlus } from 'react-icons/fi';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

export default function ProductModal({ isOpen, onClose, product, isEditing, onSave }) {
    const [formData, setFormData] = useState({
        name: '',
        reference: '',
        description: '',
        category: '',
        categoryId: '',
        brand: '',
        price_excl_tax: '',
        price_incl_tax: '',
        image: '',
        stock: {
            physical: '',
            reserved: ''
        },
        status: 'active',
        featured: false,
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

    // Fetch all categories when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    // Fetch categories for the dropdown
    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            const response = await fetch('/api/categories?flat=true');

            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }

            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Error al cargar las categorías');
        } finally {
            setLoadingCategories(false);
        }
    };

    // Organize categories into a proper hierarchy for the dropdown
    const organizeCategories = (allCategories) => {
        const categoriesMap = {};
        const rootCategories = [];

        // First pass: create a map of all categories by ID
        allCategories.forEach(category => {
            categoriesMap[category._id] = {
                ...category,
                children: []
            };
        });

        // Second pass: build the hierarchy
        allCategories.forEach(category => {
            if (category.parent && categoriesMap[category.parent]) {
                // This is a child category, add it to its parent's children
                categoriesMap[category.parent].children.push(categoriesMap[category._id]);
            } else {
                // This is a root category (no parent or parent not found)
                rootCategories.push(categoriesMap[category._id]);
            }
        });

        return rootCategories;
    };

    // Get hierarchical categories for the dropdown
    const hierarchicalCategories = organizeCategories(categories);

    // Load product data when editing
    useEffect(() => {
        if (isEditing && product) {
            setFormData({
                name: product.name || '',
                reference: product.reference || '',
                description: product.description || '',
                category: product.category || '',
                categoryId: product.categoryId || '',
                brand: product.brand || '',
                price_excl_tax: product.price_excl_tax || '',
                price_incl_tax: product.price_incl_tax || '',
                image: product.image || '',
                stock: {
                    physical: product.stock?.physical || '',
                    reserved: product.stock?.reserved || ''
                },
                status: product.status || 'active',
                featured: product.featured || false,
            });
            setImagePreview(product.image || '');
        }
    }, [isEditing, product]);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'physical' || name === 'reserved') {
            setFormData(prev => ({
                ...prev,
                stock: {
                    ...prev.stock,
                    [name]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    // Handle category selection from the dropdown
    const handleCategorySelect = (categoryName, categoryId) => {
        setFormData(prev => ({
            ...prev,
            category: categoryName,
            categoryId: categoryId
        }));
        setShowCategoryDropdown(false);
    };

    // Handle image selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            const fileReader = new FileReader();
            fileReader.onload = () => {
                setImagePreview(fileReader.result);
            };
            fileReader.readAsDataURL(file);
        }
    };

    // Upload image to Cloudinary
    const uploadImage = async () => {
        if (!selectedImage) return formData.image;

        setIsUploading(true);
        const toastId = toast.loading('Subiendo imagen...');

        try {
            // Convert image to base64
            const base64Image = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(selectedImage);
            });

            // Upload to server
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: base64Image })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al subir la imagen');
            }

            const data = await response.json();
            toast.success('Imagen subida correctamente', { id: toastId });
            return data.url;
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Error al subir la imagen', { id: toastId });
            return formData.image;
        } finally {
            setIsUploading(false);
        }
    };

    // Form validation
    const validateForm = () => {
        const newErrors = {};

        if (!formData.name) newErrors.name = 'El nombre es obligatorio';
        if (!formData.reference) newErrors.reference = 'La referencia es obligatoria';
        if (!formData.category) newErrors.category = 'La categoría es obligatoria';
        if (!formData.price_excl_tax) newErrors.price_excl_tax = 'El precio sin impuestos es obligatorio';
        if (!formData.price_incl_tax) newErrors.price_incl_tax = 'El precio con impuestos es obligatorio';

        // Validate numeric fields
        if (formData.price_excl_tax && isNaN(parseFloat(formData.price_excl_tax))) {
            newErrors.price_excl_tax = 'Debe ser un número válido';
        }

        if (formData.price_incl_tax && isNaN(parseFloat(formData.price_incl_tax))) {
            newErrors.price_incl_tax = 'Debe ser un número válido';
        }

        if (formData.stock.physical && isNaN(parseInt(formData.stock.physical))) {
            newErrors.physical = 'Debe ser un número entero';
        }

        if (formData.stock.reserved && isNaN(parseInt(formData.stock.reserved))) {
            newErrors.reserved = 'Debe ser un número entero';
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
            // Upload image if selected
            let imageUrl = formData.image;
            if (selectedImage) {
                imageUrl = await uploadImage();
            }

            // Convert string values to numbers
            const processedData = {
                ...formData,
                image: imageUrl,
                price_excl_tax: parseFloat(formData.price_excl_tax),
                price_incl_tax: parseFloat(formData.price_incl_tax),
                stock: {
                    physical: parseInt(formData.stock.physical || 0),
                    reserved: parseInt(formData.stock.reserved || 0)
                }
            };

            await onSave(processedData);
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error('Error al guardar el producto');
        } finally {
            setLoading(false);
        }
    };

    // Render category tree for dropdown with improved hierarchy indicators
    const renderCategoryOption = (category, level = 0, isLast = false, prefix = '') => {
        // Determine the prefix for this category based on its position in the hierarchy
        const currentPrefix = level === 0 ? '' : isLast ? `${prefix}└─ ` : `${prefix}├─ `;
        // Determine the prefix for child categories
        const childPrefix = level === 0 ? '' : isLast ? `${prefix}   ` : `${prefix}│  `;

        return (
            <div key={category._id} className="category-item">
                <div
                    className={`px-3 py-1 hover:bg-gray-100 cursor-pointer flex items-center ${level > 0 ? 'border-l border-gray-200' : ''}`}
                    onClick={() => handleCategorySelect(category.name, category._id)}
                >
                    {level > 0 && (
                        <span className="text-gray-400 font-mono mr-1">{currentPrefix}</span>
                    )}
                    <div className="flex items-center">
                        <FiFolder className={`mr-1 ${level === 0 ? 'text-[#00B0C8]' : 'text-gray-400'}`} size={14} />
                        <span className={`${level === 0 ? 'font-medium' : ''} text-sm`}>{category.name}</span>
                    </div>
                </div>

                {category.children && category.children.length > 0 && (
                    <div className="subcategory-group">
                        {category.children.map((child, index) =>
                            renderCategoryOption(
                                child,
                                level + 1,
                                index === category.children.length - 1,
                                childPrefix
                            )
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-6xl bg-white rounded-lg shadow-xl overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b">
                        <DialogTitle className="text-lg font-medium">
                            {isEditing ? 'Editar Producto' : 'Añadir Nuevo Producto'}
                        </DialogTitle>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Left Column */}
                            <div className="space-y-6 md:col-span-2">
                                <h3 className="text-md font-medium">Información Básica</h3>

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
                                        className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300'
                                            } rounded-md focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]`}
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
                                        Referencia *
                                    </label>
                                    <input
                                        type="text"
                                        id="reference"
                                        name="reference"
                                        value={formData.reference}
                                        onChange={handleChange}
                                        className={`mt-1 block w-full px-3 py-2 border ${errors.reference ? 'border-red-300' : 'border-gray-300'
                                            } rounded-md focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]`}
                                    />
                                    {errors.reference && (
                                        <p className="mt-1 text-sm text-red-600">{errors.reference}</p>
                                    )}
                                </div>

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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                            Categoría *
                                        </label>
                                        <div className="relative">
                                            <div
                                                className={`mt-1 block w-full px-3 py-2 border ${errors.category ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none cursor-pointer flex justify-between items-center`}
                                                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                            >
                                                <span className="truncate">{formData.category || 'Seleccionar categoría'}</span>
                                                <FiChevronRight className={`transition-transform ${showCategoryDropdown ? 'rotate-90' : ''}`} />
                                            </div>

                                            {showCategoryDropdown && (
                                                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md overflow-auto border border-gray-300">
                                                    {loadingCategories ? (
                                                        <div className="flex justify-center p-4">
                                                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#00B0C8]"></div>
                                                            <span className="ml-2">Cargando categorías...</span>
                                                        </div>
                                                    ) : hierarchicalCategories.length === 0 ? (
                                                        <div className="p-4 text-gray-500">No hay categorías disponibles</div>
                                                    ) : (
                                                        <div className="py-1 category-dropdown">
                                                            <style jsx global>{`
                                                                .category-dropdown .category-item {
                                                                    margin: 0;
                                                                    padding: 0;
                                                                }
                                                                .category-dropdown .subcategory-group {
                                                                    margin: 0;
                                                                    padding: 0;
                                                                }
                                                            `}</style>
                                                            {hierarchicalCategories.map((category, index) =>
                                                                renderCategoryOption(
                                                                    category,
                                                                    0,
                                                                    index === hierarchicalCategories.length - 1
                                                                )
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {errors.category && (
                                            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                                            Marca
                                        </label>
                                        <input
                                            type="text"
                                            id="brand"
                                            name="brand"
                                            value={formData.brand}
                                            onChange={handleChange}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="price_excl_tax" className="block text-sm font-medium text-gray-700">
                                            Precio sin Impuestos (€) *
                                        </label>
                                        <input
                                            type="text"
                                            id="price_excl_tax"
                                            name="price_excl_tax"
                                            value={formData.price_excl_tax}
                                            onChange={handleChange}
                                            className={`mt-1 block w-full px-3 py-2 border ${errors.price_excl_tax ? 'border-red-300' : 'border-gray-300'
                                                } rounded-md focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]`}
                                        />
                                        {errors.price_excl_tax && (
                                            <p className="mt-1 text-sm text-red-600">{errors.price_excl_tax}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="price_incl_tax" className="block text-sm font-medium text-gray-700">
                                            Precio con Impuestos (€) *
                                        </label>
                                        <input
                                            type="text"
                                            id="price_incl_tax"
                                            name="price_incl_tax"
                                            value={formData.price_incl_tax}
                                            onChange={handleChange}
                                            className={`mt-1 block w-full px-3 py-2 border ${errors.price_incl_tax ? 'border-red-300' : 'border-gray-300'
                                                } rounded-md focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]`}
                                        />
                                        {errors.price_incl_tax && (
                                            <p className="mt-1 text-sm text-red-600">{errors.price_incl_tax}</p>
                                        )}
                                    </div>
                                </div>

                                <h3 className="text-md font-medium mt-6">Inventario</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="physical" className="block text-sm font-medium text-gray-700">
                                            Stock Físico
                                        </label>
                                        <input
                                            type="number"
                                            id="physical"
                                            name="physical"
                                            value={formData.stock.physical}
                                            onChange={handleChange}
                                            min="0"
                                            className={`mt-1 block w-full px-3 py-2 border ${errors.physical ? 'border-red-300' : 'border-gray-300'
                                                } rounded-md focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]`}
                                        />
                                        {errors.physical && (
                                            <p className="mt-1 text-sm text-red-600">{errors.physical}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="reserved" className="block text-sm font-medium text-gray-700">
                                            Stock Reservado
                                        </label>
                                        <input
                                            type="number"
                                            id="reserved"
                                            name="reserved"
                                            value={formData.stock.reserved}
                                            onChange={handleChange}
                                            min="0"
                                            className={`mt-1 block w-full px-3 py-2 border ${errors.reserved ? 'border-red-300' : 'border-gray-300'
                                                } rounded-md focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]`}
                                        />
                                        {errors.reserved && (
                                            <p className="mt-1 text-sm text-red-600">{errors.reserved}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                            Estado
                                        </label>
                                        <select
                                            id="status"
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]"
                                        >
                                            <option value="active">Activo</option>
                                            <option value="inactive">Inactivo</option>
                                            <option value="discontinued">Descontinuado</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center h-full pt-6">
                                        <input
                                            type="checkbox"
                                            id="featured"
                                            name="featured"
                                            checked={formData.featured}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-[#00B0C8] border-gray-300 rounded focus:ring-[#00B0C8]"
                                        />
                                        <label htmlFor="featured" className="ml-2 block text-sm font-medium text-gray-700">
                                            Destacado
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Image Upload */}
                            <div className="space-y-6">
                                <h3 className="text-md font-medium">Imagen del Producto</h3>

                                <div className="flex flex-col items-center space-y-4">
                                    <div className="w-full p-2 h-64 relative rounded-lg border border-dashed border-gray-300 overflow-hidden bg-gray-50">
                                        {isUploading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                                            </div>
                                        )}
                                        {imagePreview ? (
                                            <Image
                                                src={imagePreview}
                                                alt="Vista previa"
                                                width={1000}
                                                height={1000}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full">
                                                <FiUpload className="w-10 h-10 text-gray-400" />
                                                <p className="mt-2 text-sm text-gray-500">No hay imagen seleccionada</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="w-full">
                                        <label
                                            htmlFor="productImage"
                                            className={`block w-full px-4 py-2 text-center text-white rounded-md ${isUploading
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-[#00B0C8] hover:bg-[#008A9B] cursor-pointer'
                                                }`}
                                        >
                                            {isUploading ? 'Subiendo...' : 'Seleccionar imagen'}
                                        </label>
                                        <input
                                            type="file"
                                            id="productImage"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            disabled={isUploading}
                                            className="hidden"
                                        />
                                        <p className="mt-2 text-xs text-gray-500 text-center">
                                            Formatos: JPG, PNG. Max: 5MB
                                        </p>
                                    </div>

                                    {/* Manual URL input */}
                                    <div className="w-full mt-4">
                                        <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                                            URL de Imagen (opcional)
                                        </label>
                                        <input
                                            type="text"
                                            id="image"
                                            name="image"
                                            value={formData.image}
                                            onChange={handleChange}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]"
                                            placeholder="https://ejemplo.com/imagen.jpg"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            O pegue la URL directamente aquí
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading || isUploading}
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