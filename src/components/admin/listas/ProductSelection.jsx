'use client';
import { useState, useEffect } from 'react';
import { fetchProducts } from '@/services/ProductService';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

export default function ProductSelection({ onProductSelect, selectedProducts = [] }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedItems, setSelectedItems] = useState(
        Array.isArray(selectedProducts) ? selectedProducts : []
    );

    // Load products
    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                const result = await fetchProducts({
                    page: currentPage,
                    limit: 4,
                    status: 'active',
                    search: search || undefined
                });

                setProducts(result.products || []);
                setTotalPages(result.pagination?.totalPages || 1);
            } catch (error) {
                console.error('Error loading products:', error);
                toast.error('Error al cargar los productos');
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, [currentPage, search]);

    // Handle selecting a product
    const handleSelectProduct = (product) => {
        // Check if product is already selected
        const existingIndex = selectedItems.findIndex(item => item.product._id === product._id);

        if (existingIndex >= 0) {
            // Update quantity if already selected
            const updatedItems = [...selectedItems];
            updatedItems[existingIndex].quantity += 1;
            setSelectedItems(updatedItems);
        } else {
            // Add new product with quantity 1
            setSelectedItems([
                ...selectedItems,
                {
                    product,
                    quantity: 1,
                    reserved: 0,
                    priority: 2
                }
            ]);
        }

        // Notify parent component
        if (onProductSelect) {
            onProductSelect([
                ...selectedItems,
                {
                    product,
                    quantity: 1,
                    reserved: 0,
                    priority: 2
                }
            ]);
        }

        toast.success(`${product.name} añadido a la lista`);
    };

    // Handle removing a product
    const handleRemoveProduct = (productId) => {
        const updatedItems = selectedItems.filter(item => item.product._id !== productId);
        setSelectedItems(updatedItems);

        // Notify parent component
        if (onProductSelect) {
            onProductSelect(updatedItems);
        }

        toast.success('Producto eliminado de la lista');
    };

    // Handle changing quantity
    const handleQuantityChange = (productId, newQuantity) => {
        if (newQuantity < 1) return;

        const updatedItems = selectedItems.map(item => {
            if (item.product._id === productId) {
                return { ...item, quantity: newQuantity };
            }
            return item;
        });

        setSelectedItems(updatedItems);

        // Notify parent component
        if (onProductSelect) {
            onProductSelect(updatedItems);
        }
    };

    return (
        <div> 
            {/* Selected Products Summary */}
            {selectedItems.length > 0 && (
                <div className="mb-6   bg-gray-50 rounded-lg h-scree">
                    <h3 className="font-medium text-gray-900 mb-2">Productos seleccionados ({selectedItems.length})</h3>
                    <div className="space-y-2 max-h-[100px] overflow-y-auto">
                        {selectedItems.map((item) => (
                            <div key={item.product._id} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gray-200 rounded-md overflow-hidden mr-3">
                                        {item.product.image && (
                                            <Image
                                                src={item.product.image}
                                                alt={item.product.name}
                                                width={40}
                                                height={40}
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                    <span className="text-sm font-medium">{item.product.name}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center border border-gray-300  rounded-md">
                                        <button
                                            onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                                            className="px-2 py-1 text-gray-500 hover:bg-gray-100"
                                        >
                                            -
                                        </button>
                                        <span className="px-2 py-1 text-sm">{item.quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                                            className="px-2 py-1 text-gray-500 hover:bg-gray-100"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveProduct(item.product._id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar productos..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                    />
                    <button
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                        onClick={() => setSearch('')}
                    >
                        {search && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00B0C8]"></div>
                </div>
            )}

            {/* Products Grid */}
            {!loading && (
                <>
                    {products.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-gray-500">No se encontraron productos.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <div
                                    key={product._id}
                                    className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col"
                                    onClick={() => handleSelectProduct(product)}
                                >
                                    <div className="flex-1">
                                        {product.image && (
                                            <div className=" bg-white overflow-hidden">
                                                <Image
                                                    src={product.image}
                                                    alt={product.name}
                                                    width={300}
                                                    height={150}
                                                    className="object-contain p-2 w-full h-[150px]"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 pt-2 pb-3 bg-white">
                                        <h3 className="font-medium text-gray-900 text-center truncate">{product.name}</h3>
                                        <p className="text-[#00B0C8] font-bold text-center text-md mt-2">{product.price_incl_tax?.toFixed(2).replace('.', ',')} €</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-6">
                            <div className="flex space-x-1">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className={`px-3 py-1 rounded-md ${currentPage === 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Anterior
                                </button>

                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    // Show 5 pages max, centered around current page
                                    const pageNum = Math.min(
                                        Math.max(currentPage - 2, 1) + i,
                                        totalPages
                                    );
                                    if (pageNum > totalPages) return null;

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`px-3 py-1 rounded-md ${currentPage === pageNum
                                                ? 'bg-[#00B0C8] text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className={`px-3 py-1 rounded-md ${currentPage === totalPages
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
} 