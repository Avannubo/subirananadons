'use client'; // Mark as client component since we'll use interactivity

import { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiEye, FiSearch, FiFilter, FiPlus } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import ProductModal from './ProductModal';
import ProductViewModal from './ProductViewModal';
import ConfirmModal from '@/components/shared/ConfirmModal';

export default function ProductsTable(props) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        name: '',
        reference: '',
        category: '',
    });
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Fetch products from the API
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();

            if (filters.name) queryParams.append('name', filters.name);
            if (filters.reference) queryParams.append('reference', filters.reference);
            if (filters.category) queryParams.append('category', filters.category);

            // Add the category filter from props if it exists
            if (props.categoryFilter) queryParams.append('categoryId', props.categoryFilter);

            const response = await fetch(`/api/products?${queryParams.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Error loading products');
        } finally {
            setLoading(false);
        }
    };

    // Load products on component mount
    useEffect(() => {
        fetchProducts();
    }, [props.categoryFilter]);

    // Handle filter change
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Apply filters
    const applyFilters = () => {
        fetchProducts();
    };

    // Clear filters
    const clearFilters = () => {
        setFilters({
            name: '',
            reference: '',
            category: '',
        });
        fetchProducts();
    };

    // Handle product view
    const handleViewProduct = (product) => {
        setSelectedProduct(product);
        setShowViewModal(true);
    };

    // Handle product edit
    const handleEditProduct = (product) => {
        setSelectedProduct(product);
        setIsEditing(true);
        setShowModal(true);
    };

    // Handle product delete confirmation
    const handleDeleteConfirm = (product) => {
        setSelectedProduct(product);
        setShowConfirmModal(true);
    };

    // Delete product
    const handleDeleteProduct = async () => {
        if (!selectedProduct) return;

        try {
            const response = await fetch(`/api/products/${selectedProduct._id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete product');
            }

            toast.success('Product deleted successfully');
            setShowConfirmModal(false);

            // Refresh the product list
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Error deleting product');
        }
    };

    // Handle adding new product
    const handleAddProduct = () => {
        setSelectedProduct(null);
        setIsEditing(false);
        setShowModal(true);
    };

    // Handle form submission for add/edit
    const handleSaveProduct = async (formData) => {
        try {
            let response;

            if (isEditing) {
                // Update existing product
                response = await fetch(`/api/products/${selectedProduct._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });
            } else {
                // Create new product
                response = await fetch('/api/products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Operation failed');
            }

            toast.success(isEditing ? 'Product updated successfully' : 'Product added successfully');
            setShowModal(false);

            // Refresh the product list
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error(error.message || 'Error saving product');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Table Header with Actions */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Productos</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={handleAddProduct}
                        className="px-3 py-1 bg-[#00B0C8] text-white rounded hover:bg-[#008A9B] flex items-center"
                    >
                        <FiPlus className="mr-1" />
                        Añadir producto
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="p-4 border-b border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                    <FiSearch className="absolute left-3 top-3 text-gray-400" />
                    <input
                        type="text"
                        name="name"
                        placeholder="Buscar por nombre"
                        value={filters.name}
                        onChange={handleFilterChange}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                    />
                </div>
                <div className="relative">
                    <FiSearch className="absolute left-3 top-3 text-gray-400" />
                    <input
                        type="text"
                        name="reference"
                        placeholder="Buscar ref."
                        value={filters.reference}
                        onChange={handleFilterChange}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                    />
                </div>
                <div className="relative">
                    <FiSearch className="absolute left-3 top-3 text-gray-400" />
                    <input
                        type="text"
                        name="category"
                        placeholder="Buscar categoría"
                        value={filters.category}
                        onChange={handleFilterChange}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={applyFilters}
                        className="flex items-center justify-center px-4 py-2 bg-[#00B0C8] text-white rounded hover:bg-[#008A9B]"
                    >
                        <FiFilter className="mr-2" />
                        Aplicar
                    </button>
                    <button
                        onClick={clearFilters}
                        className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                    >
                        Limpiar
                    </button>
                </div>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="text-center py-6">
                        <p>Cargando productos...</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Imagen
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nombre
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Referencia
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Categoría
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Precio (imp. excl.)
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Precio (imp. incl.)
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.length > 0 ? (
                                products.map((product, index) => (
                                    <tr key={product._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="h-10 w-10 rounded object-cover"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {product.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {product.reference}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {product.category}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {product.price_excl_tax.toFixed(2)} €
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {product.price_incl_tax.toFixed(2)} €
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.status === 'active' ? 'bg-green-100 text-green-800' :
                                                product.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {product.status === 'active' ? 'Activo' :
                                                    product.status === 'inactive' ? 'Inactivo' :
                                                        'Descontinuado'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    className="text-[#00B0C8] hover:text-[#008A9B]"
                                                    onClick={() => handleViewProduct(product)}
                                                    title="Ver detalles"
                                                >
                                                    <FiEye />
                                                </button>
                                                <button
                                                    className="text-yellow-600 hover:text-yellow-900"
                                                    onClick={() => handleEditProduct(product)}
                                                    title="Editar producto"
                                                >
                                                    <FiEdit />
                                                </button>
                                                <button
                                                    className="text-red-600 hover:text-red-900"
                                                    onClick={() => handleDeleteConfirm(product)}
                                                    title="Eliminar producto"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No se encontraron productos
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add/Edit Product Modal */}
            {showModal && (
                <ProductModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    product={selectedProduct}
                    isEditing={isEditing}
                    onSave={handleSaveProduct}
                />
            )}

            {/* View Product Modal */}
            {showViewModal && (
                <ProductViewModal
                    isOpen={showViewModal}
                    onClose={() => setShowViewModal(false)}
                    product={selectedProduct}
                />
            )}

            {/* Confirm Delete Modal */}
            {showConfirmModal && (
                <ConfirmModal
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={handleDeleteProduct}
                    title="Eliminar Producto"
                    message={`¿Estás seguro de que deseas eliminar el producto "${selectedProduct?.name}"? Esta acción no se puede deshacer.`}
                    confirmText="Eliminar"
                    cancelText="Cancelar"
                />
            )}
        </div>
    );
}