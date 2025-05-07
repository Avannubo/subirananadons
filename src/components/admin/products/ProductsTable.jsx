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
    const [hoveredImage, setHoveredImage] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [pagination, setPagination] = useState({  
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        limit: 5
    });
    const [allProducts, setAllProducts] = useState([]); // Store all products for client-side pagination
    const [useClientPagination, setUseClientPagination] = useState(false); // Flag to determine pagination mode

    // Fetch products from the API
    const fetchProducts = async (page = 1, limit = pagination.limit) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();

            if (filters.name) queryParams.append('name', filters.name);
            if (filters.reference) queryParams.append('reference', filters.reference);
            if (filters.category) queryParams.append('category', filters.category);

            // Add the category filter from props if it exists
            if (props.categoryFilter) queryParams.append('categoryId', props.categoryFilter);

            // For server-side pagination
            if (!useClientPagination) {
                // Add pagination parameters
                queryParams.append('page', page);
                queryParams.append('limit', limit);
            }

            const response = await fetch(`/api/products?${queryParams.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const data = await response.json();

            // Check for different possible API response structures
            if (Array.isArray(data)) {
                // If we get a full array, use client-side pagination
                setAllProducts(data);
                setUseClientPagination(true);

                // Apply client-side pagination
                applyClientPagination(data, page, limit);
            } else if (data.products && Array.isArray(data.products)) {
                // Handle case where API returns {products: [...], pagination: {...}}
                if (data.pagination) {
                    // Server pagination is working
                    setUseClientPagination(false);
                    setProducts(data.products);
                    setPagination({
                        currentPage: data.pagination.currentPage || page,
                        totalPages: data.pagination.totalPages || Math.ceil(data.products.length / limit) || 1,
                        totalItems: data.pagination.totalItems || data.products.length,
                        limit: limit
                    });
                } else {
                    // No pagination info from server, use client-side
                    setAllProducts(data.products);
                    setUseClientPagination(true);
                    applyClientPagination(data.products, page, limit);
                }
            } else {
                // Fallback for unexpected response structure
                console.warn('Unexpected API response format:', data);
                const productsArray = data.products || data || [];
                setAllProducts(productsArray);
                setUseClientPagination(true);
                applyClientPagination(productsArray, page, limit);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Error loading products');
        } finally {
            setLoading(false);
        }
    };

    // Apply client-side pagination
    const applyClientPagination = (productsArray, page, limit) => {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedProducts = productsArray.slice(startIndex, endIndex);

        setProducts(paginatedProducts);
        setPagination({
            currentPage: page,
            totalPages: Math.ceil(productsArray.length / limit) || 1,
            totalItems: productsArray.length,
            limit: limit
        });

        console.log(`Client pagination: showing items ${startIndex + 1}-${Math.min(endIndex, productsArray.length)} of ${productsArray.length}`);
    };

    // Load products on component mount
    useEffect(() => {
        fetchProducts(1); // Always start at page 1 when category filter changes
    }, [props.categoryFilter]);

    // Handle filter change
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Apply filters
    const applyFilters = () => {
        if (useClientPagination) {
            // If we have all products loaded, filter client-side
            const filteredProducts = filterProductsClientSide(allProducts);
            applyClientPagination(filteredProducts, 1, pagination.limit);
        } else {
            // Otherwise use server filtering
            fetchProducts(1); // Reset to page 1 when applying new filters
        }
    };

    // Filter products client-side
    const filterProductsClientSide = (productsToFilter) => {
        return productsToFilter.filter(product => {
            const nameMatch = !filters.name ||
                product.name.toLowerCase().includes(filters.name.toLowerCase());

            const referenceMatch = !filters.reference ||
                product.reference.toLowerCase().includes(filters.reference.toLowerCase());

            const categoryMatch = !filters.category ||
                product.category.toLowerCase().includes(filters.category.toLowerCase());

            return nameMatch && referenceMatch && categoryMatch;
        });
    };

    // Clear filters
    const clearFilters = () => {
        setFilters({
            name: '',
            reference: '',
            category: '',
        });

        if (useClientPagination) {
            // If client-side, just reset to show all products
            applyClientPagination(allProducts, 1, pagination.limit);
        } else {
            fetchProducts(1); // Reset to page 1 when clearing filters
        }
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

            if (useClientPagination) {
                // Update local state for client-side pagination
                const updatedProducts = allProducts.filter(p => p._id !== selectedProduct._id);
                setAllProducts(updatedProducts);

                // Calculate new page (go to previous page if this was the last item on the page)
                const newPage = products.length === 1 && pagination.currentPage > 1
                    ? pagination.currentPage - 1
                    : pagination.currentPage;

                applyClientPagination(updatedProducts, newPage, pagination.limit);
            } else {
                // Refresh the product list while maintaining the current page if possible
                // If the deleted product was the last one on the page, go to the previous page
                const newPage = products.length === 1 && pagination.currentPage > 1
                    ? pagination.currentPage - 1
                    : pagination.currentPage;

                fetchProducts(newPage);
            }
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

            const savedProduct = await response.json();
            toast.success(isEditing ? 'Product updated successfully' : 'Product added successfully');
            setShowModal(false);

            if (useClientPagination) {
                let updatedProducts;

                if (isEditing) {
                    // Replace the updated product in the array
                    updatedProducts = allProducts.map(p =>
                        p._id === savedProduct._id ? savedProduct : p
                    );
                } else {
                    // Add the new product to the array
                    updatedProducts = [savedProduct, ...allProducts];
                }

                setAllProducts(updatedProducts);

                // When adding, go to first page. When editing, stay on current page
                const newPage = isEditing ? pagination.currentPage : 1;
                applyClientPagination(updatedProducts, newPage, pagination.limit);
            } else {
                // When adding a new product, go to first page to see it
                // When editing, stay on current page
                fetchProducts(isEditing ? pagination.currentPage : 1);
            }
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error(error.message || 'Error saving product');
        }
    };

    // Handle page change
    const handlePageChange = (page) => {
        console.log(`Changing to page ${page}`);
        if (useClientPagination) {
            applyClientPagination(allProducts, page, pagination.limit);
        } else {
            fetchProducts(page);
        }
    };

    // Handle items per page change
    const handleLimitChange = (e) => {
        const newLimit = parseInt(e.target.value);
        console.log(`Changing limit to ${newLimit}`);
        if (useClientPagination) {
            applyClientPagination(allProducts, 1, newLimit);
        } else {
            fetchProducts(1, newLimit); // Reset to page 1 when changing limit
        }
    };

    // Handle mouse over image
    const handleImageMouseEnter = (imageUrl) => {
        setHoveredImage(imageUrl);
    };

    // Handle mouse leave image
    const handleImageMouseLeave = () => {
        setHoveredImage(null);
    };

    // Handle mouse move to update tooltip position
    const handleMouseMove = (e) => {
        setMousePosition({
            x: e.clientX,
            y: e.clientY
        });
    };

    // Setup global mouse move event
    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    // For debugging
    useEffect(() => {
        console.log("Current pagination state:", pagination);
        console.log("Products count:", products.length);
    }, [pagination, products]);

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
                    <div>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referencia</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {[1, 2, 3, 4, 5].map((item) => (
                                    <tr key={item}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-4 bg-gray-200 rounded w-4 animate-pulse"></div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-2">
                                                <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse"></div>
                                                <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse"></div>
                                                <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
                                {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Precio (imp. excl.)
                                </th> */}
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Precio
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
                                            <div className="relative">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="h-10 w-10 rounded object-cover cursor-pointer"
                                                    onMouseEnter={() => handleImageMouseEnter(product.image)}
                                                    onMouseLeave={handleImageMouseLeave}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 max-w-xs truncate" title={product.name}>
                                            {product.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={product.reference}>
                                            {product.reference}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={product.category}>
                                            {product.category}
                                        </td>
                                        {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {product.price_excl_tax.toFixed(2)} €
                                        </td> */}
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
                                                    <FiEye size={20} />
                                                </button>
                                                <button
                                                    className="text-yellow-600 hover:text-yellow-900"
                                                    onClick={() => handleEditProduct(product)}
                                                    title="Editar producto"
                                                >
                                                    <FiEdit size={20} />
                                                </button>
                                                <button
                                                    className="text-red-600 hover:text-red-900"
                                                    onClick={() => handleDeleteConfirm(product)}
                                                    title="Eliminar producto"
                                                >
                                                    <FiTrash2 size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="px-6 py-8 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                            <p className="text-gray-600 text-lg">No se encontraron productos</p>
                                            <p className="text-gray-500 text-sm mt-1">Prueba a cambiar los filtros o añade un nuevo producto</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Image Preview Tooltip */}
            {hoveredImage && (
                <div
                    className="fixed z-50 bg-white shadow-xl rounded-md border border-gray-200 p-1"
                    style={{
                        width: '250px',
                        height: '250px',
                        left: mousePosition.x + 20,
                        top: mousePosition.y - 125,
                        pointerEvents: 'none'
                    }}
                >
                    <img
                        src={hoveredImage}
                        alt="Preview"
                        className="w-full h-full object-contain"
                    />
                </div>
            )}

            {/* Pagination */}
            {!loading && products.length > 0 && (
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
                                onChange={handleLimitChange}
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