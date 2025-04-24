'use client';
import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import ProductModal from './ProductModal';
import ProductViewModal from './ProductViewModal';
import DeleteConfirmationModal from '../DeleteConfirmationModal';
import { fetchProducts, deleteProduct } from '@/services/productService';
import { toast } from 'react-hot-toast';

export default function ProductsList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);

    // Load products on component mount
    useEffect(() => {
        loadProducts();
    }, []);

    // Filter products when search term or products list changes
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredProducts(products);
            return;
        }

        const searchTermLower = searchTerm.toLowerCase();
        const filtered = products.filter(product =>
            product.name.toLowerCase().includes(searchTermLower) ||
            product.reference.toLowerCase().includes(searchTermLower) ||
            (product.category && product.category.toLowerCase().includes(searchTermLower)) ||
            (product.brand && product.brand.toLowerCase().includes(searchTermLower))
        );

        setFilteredProducts(filtered);
    }, [searchTerm, products]);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const data = await fetchProducts();
            setProducts(data);
            setFilteredProducts(data);
        } catch (error) {
            console.error('Error loading products:', error);
            toast.error('Error al cargar los productos');
        } finally {
            setLoading(false);
        }
    };

    const handleView = (product) => {
        setCurrentProduct(product);
        setIsViewModalOpen(true);
    };

    const handleEdit = (product) => {
        setCurrentProduct(product);
        setIsEditModalOpen(true);
    };

    const handleDelete = (product) => {
        setCurrentProduct(product);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteProduct(currentProduct.id);
            toast.success('Producto eliminado con éxito');
            setIsDeleteModalOpen(false);
            loadProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Error al eliminar el producto');
        }
    };

    const handleSave = () => {
        loadProducts();
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
    };

    // Format price with 2 decimal places and € symbol
    const formatPrice = (price) => {
        return price ? `${parseFloat(price).toFixed(2)} €` : 'N/A';
    };

    // Determine status color and text
    const getStatusDisplay = (status) => {
        switch (status) {
            case 'active':
                return { color: 'bg-green-100 text-green-800', text: 'Activo' };
            case 'inactive':
                return { color: 'bg-gray-100 text-gray-800', text: 'Inactivo' };
            default:
                return { color: 'bg-red-100 text-red-800', text: 'Descontinuado' };
        }
    };

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900 mb-2 sm:mb-0">
                        Productos
                    </h2>
                    <div className="flex w-full sm:w-auto gap-2">
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Añadir
                        </button>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Producto
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Categoría / Marca
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Precio (IVA)
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                    Cargando productos...
                                </td>
                            </tr>
                        ) : filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No se encontraron productos
                                </td>
                            </tr>
                        ) : (
                            filteredProducts.map((product) => {
                                const { color, text } = getStatusDisplay(product.status);
                                const availableStock = (product.stock?.physical || 0) - (product.stock?.reserved || 0);

                                return (
                                    <tr key={product.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {product.name}
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Ref: {product.reference}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>{product.category || 'N/A'}</div>
                                            <div className="text-xs">{product.brand || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatPrice(product.price_incl_tax)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                Físico: {product.stock?.physical || 0}
                                            </div>
                                            <div className={`text-xs ${availableStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                Disponible: {availableStock}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
                                                {text}
                                            </span>
                                            {product.featured && (
                                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    Destacado
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleView(product)}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                <FiEye className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                                            >
                                                <FiEdit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <FiTrash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Product Modal */}
            <ProductModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleSave}
            />

            {/* Edit Product Modal */}
            <ProductModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSave}
                product={currentProduct}
            />

            {/* View Product Modal */}
            <ProductViewModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                product={currentProduct}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Eliminar Producto"
                message={`¿Estás seguro de eliminar el producto "${currentProduct?.name}"? Esta acción no se puede deshacer.`}
            />
        </div>
    );
} 