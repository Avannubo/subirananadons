'use client';
import { useState, useEffect } from 'react';
// Translation object for Catalan and Spanish
const translations = {
    ca: {
        selected: 'Productes seleccionats',
        searchPlaceholder: 'Cercar productes...',
        noProducts: 'No s\'han trobat productes.',
        addSuccess: 'afegit a la llista',
        removeSuccess: 'Producte eliminat de la llista',
        prev: 'Anterior',
        next: 'Següent',
        discounted: 'Amb descompte',
        originalPrice: 'Preu original',
        finalPrice: 'Preu final'
    },
    es: {
        selected: 'Productos seleccionados',
        searchPlaceholder: 'Buscar productos...',
        noProducts: 'No se encontraron productos.',
        addSuccess: 'añadido a la lista',
        removeSuccess: 'Producto eliminado de la lista',
        prev: 'Anterior',
        next: 'Siguiente',
        discounted: 'Con descuento',
        originalPrice: 'Precio original',
        finalPrice: 'Precio final'
    }
};

function getLocale() {
    if (typeof window !== 'undefined') {
        const lang = window.navigator.language || 'ca';
        return lang.startsWith('ca') ? 'ca' : 'es';
    }
    return 'ca';
}
import { fetchProducts } from '@/services/ProductService';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
export default function ProductSelection({ onProductSelect, selectedProducts = [] }) {
    const locale = getLocale();
    const t = translations[locale];
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedItems, setSelectedItems] = useState(
        Array.isArray(selectedProducts) ? selectedProducts : []
    );
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
    const handleSelectProduct = (product) => {
        // Check if product is already in the list
        const isProductInList = selectedItems.some(item => item.product._id === product._id);

        // if (isProductInList) {
        //     toast.error(`${getProductName(product)} ya está en la lista`);
        //     return;
        // }

        const newItem = {
            _id: crypto.randomUUID(), // Add a unique ID for each selected item
            product,
            quantity: 1,
            state: 0 // default state: pending
        };

        const updatedItems = [...selectedItems, newItem];
        setSelectedItems(updatedItems);

        if (onProductSelect) {
            onProductSelect(updatedItems);
        }

        toast.success(`${getProductName(product)} ${t.addSuccess}`);
    };

    function getProductName(product) {
        if (!product || !product.name) return '';
        if (typeof product.name === 'string') return product.name;
        return product.name[locale] || product.name.ca || product.name.es || '';
    }
    const handleRemoveProduct = (itemId) => {
        const updatedItems = selectedItems.filter(item => item._id !== itemId);
        setSelectedItems(updatedItems);
        if (onProductSelect) {
            onProductSelect(updatedItems);
        }
        toast.success(t.removeSuccess);
    };
    const handleQuantityChange = (productId) => {
        const updatedItems = selectedItems.map(item => {
            if (item.product._id === productId) {
                return { ...item, quantity: 1 }; // force quantity to 1
            }
            return item;
        });
        setSelectedItems(updatedItems);
        if (onProductSelect) {
            onProductSelect(updatedItems);
        }
    };

    // const handleQuantityChange = (productId, newQuantity) => {
    //     if (newQuantity < 1) return;
    //     const updatedItems = selectedItems.map(item => {
    //         if (item.product._id === productId) {
    //             return { ...item, quantity: newQuantity };
    //         }
    //         return item;
    //     });
    //     setSelectedItems(updatedItems);
    //     if (onProductSelect) {
    //         onProductSelect(updatedItems);
    //     }
    // };
    return (
        <div>
            {selectedItems.length > 0 && (
                <div className="mb-6 bg-gray-50 rounded-lg min-w-[600px] p-4 shadow-md">
                    <h3 className="font-medium text-gray-900 mb-2">{t.selected} ({selectedItems.length})</h3>
                    <div className="space-y-2 max-h-[100px] overflow-y-auto">
                        {selectedItems
                            .filter(item => item.state === 0)
                            .map((item, index) => (
                                <div key={item._id} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-gray-200 rounded-md overflow-hidden mr-3">
                                            {item.product.image && (
                                                <img
                                                    src={item.product.image}
                                                    alt={getProductName(item.product)}
                                                    width={40}
                                                    height={40}
                                                    className="object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className='flex flex-col'>
                                            <span className="text-sm font-medium truncate max-w-[400px] block">{getProductName(item.product)}</span>
                                            <div className="flex items-center gap-2">
                                                {item.product.discount?.active ? (
                                                    <>
                                                        <span className="text-gray-400 line-through text-sm" title={t.originalPrice}>{item.product.price_incl_tax?.toFixed(2)}€</span>
                                                        <span className="text-red-500 bg-red-50 rounded-md text-xs font-medium px-1" title={t.discounted}>
                                                            {item.product.discount.type === 'percentage' ? `-${item.product.discount.value}%` : `-${item.product.discount.value}€`}
                                                        </span>
                                                        <span className="text-[#00B0C8] font-bold text-base" title={t.finalPrice}>{item.product.discount.finalPrice?.toFixed(2)}€</span>
                                                    </>
                                                ) : (
                                                    <span className="text-[#00B0C8] font-bold text-base">{item.product.price_incl_tax?.toFixed(2)}€</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleRemoveProduct(item._id);
                                            }}
                                            className="text-red-500 cursor-pointer hover:text-red-700"
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
                        placeholder={t.searchPlaceholder}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                    />
                    <button
                        className="absolute right-2 top-1/2 cursor-pointer transform -translate-y-1/2 text-gray-400"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSearch('');
                        }}
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
                            <p className="text-gray-500">{t.noProducts}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <div
                                    key={product._id}
                                    className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleSelectProduct(product);
                                    }}
                                >
                                    <div className="flex-1">
                                        {product.image && (
                                            <div className=" bg-white overflow-hidden">
                                                <img
                                                    src={product.image}
                                                    alt={getProductName(product)}
                                                    width={300}
                                                    height={150}
                                                    className="object-contain p-2 w-full h-[150px]"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 pt-2 pb-3 bg-white">
                                        <h3 className="font-medium text-gray-900 text-center w-[200px] truncate">{getProductName(product)}</h3>
                                        <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                                            {product.discount?.active ? (
                                                <div className='flex flex-col items-center'>
                                                    <div className='space-x-2 flex items-center'>
                                                        <span className="text-gray-400 line-through text-base">{product.price_incl_tax?.toFixed(2)}€</span>
                                                        <span className="text-red-500 rounded-md bg-red-50 text-sm font-medium px-1">
                                                            {product.discount.type === 'percentage' ? `-${product.discount.value}%` : `-${product.discount.value}€`}
                                                        </span>

                                                    </div>

                                                    <span className="text-[#00B0C8] font-bold text-lg">{product.discount.finalPrice?.toFixed(2)}€</span>
                                                </div>
                                            ) : (
                                                <p className="text-[#00B0C8] font-bold text-lg">{product.price_incl_tax?.toFixed(2)}€</p>
                                            )}
                                        </div>
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
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setCurrentPage(Math.max(1, currentPage - 1));
                                    }}
                                    disabled={currentPage === 1}
                                    className={`px-3 cursor-pointer py-1 rounded-md ${currentPage === 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {t.prev}
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
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setCurrentPage(pageNum);
                                            }}
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
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setCurrentPage(Math.min(totalPages, currentPage + 1));
                                    }}
                                    disabled={currentPage === totalPages}
                                    className={`px-3 py-1 rounded-md ${currentPage === totalPages
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {t.next}
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
} 