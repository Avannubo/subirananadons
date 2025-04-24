'use client';
import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX } from 'react-icons/fi';

export default function ProductModal({ isOpen, onClose, product, isEditing, onSave }) {
    const [formData, setFormData] = useState({
        name: '',
        reference: '',
        description: '',
        category: '',
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

    // Load product data when editing
    useEffect(() => {
        if (isEditing && product) {
            setFormData({
                name: product.name || '',
                reference: product.reference || '',
                description: product.description || '',
                category: product.category || '',
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
            // Convert string values to numbers
            const processedData = {
                ...formData,
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b">
                        <Dialog.Title className="text-lg font-medium">
                            {isEditing ? 'Editar Producto' : 'Añadir Nuevo Producto'}
                        </Dialog.Title>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-4 max-h-[80vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Basic Information */}
                            <div className="space-y-4 col-span-2">
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
                                            } rounded-md shadow-sm focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]`}
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
                                            } rounded-md shadow-sm focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]`}
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
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]"
                                    />
                                </div>
                            </div>

                            {/* Category and Brand */}
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                    Categoría *
                                </label>
                                <input
                                    type="text"
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full px-3 py-2 border ${errors.category ? 'border-red-300' : 'border-gray-300'
                                        } rounded-md shadow-sm focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]`}
                                />
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
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]"
                                />
                            </div>

                            {/* Prices */}
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
                                        } rounded-md shadow-sm focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]`}
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
                                        } rounded-md shadow-sm focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]`}
                                />
                                {errors.price_incl_tax && (
                                    <p className="mt-1 text-sm text-red-600">{errors.price_incl_tax}</p>
                                )}
                            </div>

                            {/* Image */}
                            <div className="col-span-2">
                                <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                                    URL de Imagen
                                </label>
                                <input
                                    type="text"
                                    id="image"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]"
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                />
                            </div>

                            {/* Stock */}
                            <div className="col-span-2">
                                <h3 className="text-md font-medium mb-2">Inventario</h3>
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
                                                } rounded-md shadow-sm focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]`}
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
                                                } rounded-md shadow-sm focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]`}
                                        />
                                        {errors.reserved && (
                                            <p className="mt-1 text-sm text-red-600">{errors.reserved}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Status and Featured */}
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                    Estado
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]"
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