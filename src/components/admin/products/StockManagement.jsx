'use client';
import { FiFilter, FiSearch, FiUpload, FiDownload, FiEdit, FiAlertCircle } from 'react-icons/fi';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useStats } from '@/contexts/StatsContext';
import ConfirmModal from '@/components/shared/ConfirmModal';

export default function StockManagement() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showLowStock, setShowLowStock] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [quantities, setQuantities] = useState({});
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        limit: 5
    });
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });
    const { notifyChange } = useStats();

    // Fetch products from the API
    const fetchProducts = useCallback(async (page = 1, limit = pagination.limit) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            queryParams.append('page', page);
            queryParams.append('limit', limit);

            // Add stock filter if enabled
            if (showLowStock) {
                queryParams.append('lowStock', 'true');
            }

            // Add search term if present
            if (searchTerm) {
                queryParams.append('search', searchTerm);
            }

            const response = await fetch(`/api/products?${queryParams.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const data = await response.json();

            setProducts(data.products || []);
            setPagination({
                currentPage: data.pagination?.currentPage || page,
                totalPages: data.pagination?.totalPages || 1,
                totalItems: data.pagination?.totalItems || 0,
                limit: limit
            });
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Error al cargar los productos');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, showLowStock, pagination.limit]);

    // Initial load and refresh when filters change
    useEffect(() => {
        fetchProducts(1);
    }, [fetchProducts, searchTerm, showLowStock]);

    // Handle page change
    const handlePageChange = (page) => {
        fetchProducts(page);
    };

    // Handle quantity change in edit mode
    const handleQuantityChange = (id, field, value) => {
        setQuantities(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: parseInt(value) || 0
            }
        }));
    };

    // Save stock changes
    const saveStockChanges = async (productId) => {
        if (!quantities[productId]) {
            setEditingId(null);
            return;
        }

        try {
            // Find the current product in our products array
            const product = products.find(p => p._id === productId);
            if (!product) {
                toast.error('Producto no encontrado');
                setEditingId(null);
                return;
            }

            // Show confirmation modal
            setConfirmModal({
                isOpen: true,
                title: 'Confirmar Cambio de Stock',
                message: `¿Estás seguro de que deseas actualizar el stock disponible del producto? Esta acción no se puede deshacer.`,
                onConfirm: async () => {
                    try {
                        const toastId = toast.loading('Actualizando stock...');

                        // Get the new values from quantities
                        const newAvailable = quantities[productId].available;
                        const newMinStock = quantities[productId].minStock ?? product.stock?.minStock ?? 5;

                        const response = await fetch(`/api/products/${productId}/stock`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                stock: {
                                    available: newAvailable,
                                    minStock: newMinStock
                                }
                            }),
                        });

                        if (!response.ok) {
                            const error = await response.json();
                            throw new Error(error.message || 'Error al actualizar el stock');
                        }

                        // Update product in the local state
                        const updatedProduct = await response.json();
                        setProducts(prevProducts =>
                            prevProducts.map(p =>
                                p._id === productId ? updatedProduct : p
                            )
                        );

                        // Clear the quantities for this product
                        setQuantities(prev => {
                            const newQuantities = { ...prev };
                            delete newQuantities[productId];
                            return newQuantities;
                        });

                        // Notify stats context about the change
                        if (notifyChange) {
                            setTimeout(() => {
                                notifyChange();
                            }, 500);
                        }

                        toast.success('Stock actualizado correctamente', { id: toastId });
                    } catch (error) {
                        console.error('Error updating stock:', error);
                        toast.error(error.message || 'Error al actualizar el stock');
                    } finally {
                        setEditingId(null);
                        setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    }
                }
            });
        } catch (error) {
            console.error('Error preparing stock update:', error);
            toast.error('Error al preparar la actualización de stock');
            setEditingId(null);
        }
    };

    // Get current available stock
    const getAvailableStock = (product) => {
        if (editingId === product._id) {
            return quantities[product._id]?.available ?? (product.stock?.available ?? 0);
        }
        return product.stock?.available ?? 0;
    };

    // Determine if product is low on stock
    const isLowStock = (product) => {
        const available = getAvailableStock(product);
        return available < (product.stock?.minStock ?? 5);
    };

    // Handle export of stock data
    const handleExportStock = () => {
        // Create CSV content
        const headers = ['ID', 'Referencia', 'Nombre', 'Disponible', 'Stock Mínimo', 'Estado'];
        const csvContent = [
            headers.join(','),
            ...products.map(product => [
                product._id,
                product.reference,
                `"${product.name.replace(/"/g, '""')}"`,
                getAvailableStock(product),
                product.stock?.minStock ?? 5,
                product.status
            ].join(','))
        ].join('\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.setAttribute('href', url);
        link.setAttribute('download', `stock-report-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Header with title and actions */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Gestión de stock</h2>
                {/* <div className="flex space-x-2">
                    <button
                        className="flex items-center px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                        onClick={handleExportStock}
                    >
                        <FiDownload className="mr-2" />
                        Exportar
                    </button>
                </div> */}
            </div>

            {/* Search and filters */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="relative flex-grow">
                        <FiSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Búsqueda de productos (por nombre, referencia, categoría)"
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={showLowStock}
                                onChange={() => setShowLowStock(!showLowStock)}
                                className="rounded border-gray-300 text-[#00B0C8] focus:ring-[#00B0C8]"
                            />
                            <span>Mostrar solo productos con stock bajo</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Stock table */}
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00B0C8]"></div>
                        <span className="ml-2">Cargando productos...</span>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No se encontraron productos que coincidan con los criterios de búsqueda
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referencia</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Disponible</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Mínimo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.map((product) => (
                                <tr key={product._id} className={isLowStock(product) ? 'bg-yellow-50' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {product.reference}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {product.category || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.status === 'active'
                                            ? 'bg-green-100 text-green-800'
                                            : product.status === 'inactive'
                                                ? 'bg-gray-100 text-gray-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {product.status === 'active'
                                                ? 'Activo'
                                                : product.status === 'inactive'
                                                    ? 'Inactivo'
                                                    : 'Descontinuado'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center">
                                            {editingId === product._id ? (
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="w-16 border rounded p-1"
                                                    value={quantities[product._id]?.available ?? getAvailableStock(product)}
                                                    onChange={(e) => handleQuantityChange(product._id, 'available', e.target.value)}
                                                />
                                            ) : (
                                                <>
                                                    {getAvailableStock(product)}
                                                    {isLowStock(product) && (
                                                        <FiAlertCircle className="ml-1 text-amber-500" title="Stock bajo" />
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {editingId === product._id ? (
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-16 border rounded p-1"
                                                value={quantities[product._id]?.minStock ?? (product.stock?.minStock ?? 5)}
                                                onChange={(e) => handleQuantityChange(product._id, 'minStock', e.target.value)}
                                            />
                                        ) : (
                                            product.stock?.minStock ?? 5
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {editingId === product._id ? (
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => saveStockChanges(product._id)}
                                                    className="text-[#00B0C8] hover:text-[#00B0C870]"
                                                >
                                                    Guardar
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="text-gray-500 hover:text-gray-700"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setEditingId(product._id)}
                                                className="flex items-center text-gray-600 hover:text-gray-900"
                                            >
                                                <FiEdit className="mr-1" />
                                                Editar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {products.length > 0 && (
                <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="text-sm text-gray-500 mb-2 sm:mb-0">
                        Mostrando {(pagination.currentPage - 1) * pagination.limit + 1} de {pagination.totalItems} productos
                    </div>

                    <div className="flex items-center">
                        <div className="mr-4 flex items-center">
                            <span className="mr-2 text-sm">Items por página:</span>
                            <select
                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                                value={pagination.limit}
                                onChange={(e) => {
                                    const newLimit = parseInt(e.target.value);
                                    setPagination(prev => ({ ...prev, limit: newLimit }));
                                    fetchProducts(1, newLimit);
                                }}
                            >
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-1">
                            <button
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1}
                                className={`px-3 py-1 border border-gray-300 rounded ${pagination.currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                            >
                                Anterior
                            </button>

                            {/* Page buttons */}
                            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                                // Show current page and its neighbors
                                let pageNum;
                                if (pagination.totalPages <= 5) {
                                    // If 5 or fewer pages, show all
                                    pageNum = i + 1;
                                } else if (pagination.currentPage <= 3) {
                                    // If near start, show first 5
                                    pageNum = i + 1;
                                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                                    // If near end, show last 5
                                    pageNum = pagination.totalPages - 4 + i;
                                } else {
                                    // Show 2 before and 2 after current page
                                    pageNum = pagination.currentPage - 2 + i;
                                }

                                return (
                                    <button
                                        key={i}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`px-3 py-1 border ${pagination.currentPage === pageNum ? 'bg-[#00B0C8] text-white border-[#00B0C8]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            {/* Ellipsis if many pages */}
                            {pagination.totalPages > 5 && pagination.currentPage < pagination.totalPages - 2 && (
                                <span className="px-2 py-1">...</span>
                            )}

                            {/* Show last page if not in view */}
                            {pagination.totalPages > 5 && pagination.currentPage < pagination.totalPages - 2 && (
                                <button
                                    onClick={() => handlePageChange(pagination.totalPages)}
                                    className="px-3 py-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                >
                                    {pagination.totalPages}
                                </button>
                            )}

                            <button
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={pagination.currentPage === pagination.totalPages}
                                className={`px-3 py-1 border border-gray-300 rounded ${pagination.currentPage === pagination.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText="Confirmar"
                cancelText="Cancelar"
            />
        </div>
    );
} 