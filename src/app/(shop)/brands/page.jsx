'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ShopLayout from "@/components/Layouts/shop-layout";
import Image from "next/image";
import Link from "next/link";
import { motion } from 'framer-motion';
import ProductCard from "@/components/products/product-card";
import ProductQuickView from "@/components/products/product-quick-view";
// Helper function to parse price
const parsePrice = (price) => {
    if (typeof price === 'string') {
        return parseFloat(price.replace(/[^0-9,]/g, '').replace(',', '.'));
    }
    return price;
};
export default function BrandsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [brands, setBrands] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('default');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [brandsLoading, setBrandsLoading] = useState(true);
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const productsPerPage = 12;
    // Fetch brands
    useEffect(() => {
        const fetchBrands = async () => {
            try {
                setBrandsLoading(true);
                const response = await fetch('/api/brands?limit=100&enabled=true');
                const data = await response.json();
                if (data.brands && data.brands.length > 0) {
                    setBrands(data.brands);
                    // Get brand from URL parameters
                    const urlBrand = searchParams.get('brand');
                    if (urlBrand) {
                        setSelectedBrand(urlBrand);
                    } else {
                        setSelectedBrand('all');
                    }
                }
            } catch (error) {
                console.error('Error fetching brands:', error);
            } finally {
                setBrandsLoading(false);
            }
        };
        fetchBrands();
    }, [searchParams]);
    // Fetch products for selected brand
    useEffect(() => {
        const fetchProducts = async () => {
            if (!selectedBrand) return;
            try {
                setLoading(true);
                // If 'all' is selected, don't filter by brand
                const endpoint = selectedBrand === 'all'
                    ? `/api/products?limit=${productsPerPage}&page=${currentPage}&status=active`
                    : `/api/products?brand=${selectedBrand}&limit=${productsPerPage}&page=${currentPage}&status=active`;
                const response = await fetch(endpoint);
                const data = await response.json();
                let products = data.products || [];
                // Format products to match the expected structure
                products = products.map(product => ({
                    id: product._id,
                    name: product.name,
                    category: product.category,
                    price: `${product.price_incl_tax.toFixed(2).replace('.', ',')} €`,
                    priceValue: product.price_incl_tax,
                    salesCount: product.salesCount || 0,
                    imageUrl: product.image,
                    imageUrlHover: product.imageHover || product.image,
                    brand: product.brand,
                    description: product.description || ''
                }));
                // Update pagination information
                if (data.pagination) {
                    setTotalPages(data.pagination.totalPages);
                    setTotalItems(data.pagination.totalItems);
                }
                sortProducts(products);
                // Scroll to top when brand or page changes
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            } catch (error) {
                console.error('Error fetching products:', error);
                setFilteredProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [selectedBrand, currentPage, productsPerPage]);
    // Reset to page 1 when changing brands
    useEffect(() => {
        if (selectedBrand) {
            setCurrentPage(1);
        }
    }, [selectedBrand]);
    // Sort products when sortBy changes
    useEffect(() => {
        if (filteredProducts.length > 0) {
            sortProducts(filteredProducts);
        }
    }, [sortBy]);
    // Scroll to selected brand in sidebar
    useEffect(() => {
        if (selectedBrand && !brandsLoading) {
            // Find the selected brand button element
            const selectedBrandElement = document.querySelector(`button[data-brand="${selectedBrand}"]`);
            if (selectedBrandElement) {
                // Scroll the brand into view with smooth behavior
                selectedBrandElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    }, [selectedBrand, brandsLoading]);
    const sortProducts = (products) => {
        let sorted = [...products];
        switch (sortBy) {
            case 'price-asc':
                sorted.sort((a, b) => a.priceValue - b.priceValue);
                break;
            case 'price-desc':
                sorted.sort((a, b) => b.priceValue - a.priceValue);
                break;
            case 'name-asc':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'newest':
                // Assuming newer products have higher salesCount for now
                sorted.sort((a, b) => b.salesCount - a.salesCount);
                break;
            default:
                break;
        }
        setFilteredProducts(sorted);
    };
    const handleOpenQuickView = (product) => {
        setQuickViewProduct(product);
    };
    const handleCloseQuickView = () => {
        setQuickViewProduct(null);
    };
    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };
    const handleBrandSelect = (brandName) => {
        const params = new URLSearchParams(searchParams.toString());
        if (brandName === 'all') {
            params.delete('brand');
        } else {
            params.set('brand', brandName);
        }
        router.replace(`/brands?${params.toString()}`);
        setSelectedBrand(brandName);
    };
    // Go to previous page
    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };
    // Go to next page
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };
    // Go to specific page
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };
    // Generate pagination numbers
    const getPaginationNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;
        if (totalPages <= maxPagesToShow) {
            // Show all pages if there are fewer than maxPagesToShow
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);
            // Calculate start and end of page numbers around current page
            let startPage = Math.max(2, currentPage - 2);
            let endPage = Math.min(totalPages - 1, currentPage + 2);
            // Adjust if we're near the start
            if (currentPage <= 3) {
                endPage = Math.min(totalPages - 1, 5);
            }
            // Adjust if we're near the end
            if (currentPage >= totalPages - 2) {
                startPage = Math.max(2, totalPages - 4);
            }
            // Add ellipsis if there's a gap after first page
            if (startPage > 2) {
                pages.push('...');
            }
            // Add middle pages
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
            // Add ellipsis if there's a gap before last page
            if (endPage < totalPages - 1) {
                pages.push('...');
            }
            // Always show last page
            if (totalPages > 1) {
                pages.push(totalPages);
            }
        }
        return pages;
    };
    // BrandSkeleton component for the sidebar
    const BrandSkeleton = () => (
        <div className="flex items-center gap-3 px-4 py-2 animate-pulse">
            <div className="w-10 h-10 rounded-lg bg-gray-200"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
    );
    // ProductSkeleton component for the grid or list view
    const ProductSkeleton = ({ viewMode }) => {
        if (viewMode === 'grid') {
            return (
                <div className="w-full flex flex-col items-center animate-pulse bg-white p-4 rounded-lg shadow-sm">
                    <div className="w-full h-64 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="w-2/3 h-5 bg-gray-200 rounded mb-2 self-start"></div>
                    <div className="w-1/3 h-4 bg-gray-200 rounded self-start"></div>
                </div>
            );
        } else {
            return (
                <div className="w-full flex items-start animate-pulse bg-white p-4 rounded-lg shadow-sm">
                    <div className="w-1/4 h-40 bg-gray-200 rounded-lg mr-4"></div>
                    <div className="flex-1">
                        <div className="w-2/3 h-6 bg-gray-200 rounded mb-3"></div>
                        <div className="w-1/4 h-5 bg-gray-200 rounded mb-4"></div>
                        <div className="w-full h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="w-full h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="w-2/3 h-4 bg-gray-200 rounded"></div>
                    </div>
                </div>
            );
        }
    };
    return (
        <ShopLayout>
            {/* Header Image */}
            <motion.div
                className="relative w-full h-[30vh] bg-gray-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Image
                    src="/assets/images/bg-beagrumb.jpg"
                    alt="Brands header"
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.h1
                        className="text-4xl font-bold text-zinc-900 mt-20"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        Marcas
                    </motion.h1>
                </div>
            </motion.div>
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Brands Sidebar */}
                    <motion.div
                        className="w-full md:w-1/6"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        <div className="sticky top-24 bg-white">
                            <h2 className="font-medium text-lg mb-4 px-4">Marcas</h2>
                            <div className="max-h-[calc(100vh-450px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                <ul className="space-y-1">
                                    {/* All Products option - always show this */}
                                    {!brandsLoading ? (
                                        <motion.li
                                            key="all-products"
                                            className='hover:font-bold text-zinc-700 transition-all duration-300'
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.05, duration: 0.5 }}
                                        >
                                            <button
                                                onClick={() => handleBrandSelect('all')}
                                                data-brand="all"
                                                className={`w-full text-left px-4 py-2 transition-colors rounded-lg hover:bg-gray-50 flex items-center gap-3 ${selectedBrand === 'all'
                                                    ? 'bg-gray-50 font-medium text-[#00B0C8]'
                                                    : ''
                                                    }`}
                                            >
                                                <div className="relative">
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 bg-opacity-10 flex items-center justify-center">
                                                        <span className="text-gray-500 text-xs">ALL</span>
                                                    </div>
                                                </div>
                                                <span className="hover:text-[#00B0C8] transition-colors active:font-bold">Todas las marcas</span>
                                            </button>
                                        </motion.li>
                                    ) : (
                                        <BrandSkeleton key="all-skeleton" />
                                    )}
                                    {/* Brands list or skeleton */}
                                    {brandsLoading ? (
                                        // Show brand skeletons while loading
                                        Array(10).fill(0).map((_, index) => (
                                            <BrandSkeleton key={`brand-skeleton-${index}`} />
                                        ))
                                    ) : (
                                        // Show actual brands when loaded
                                        brands.map((brand, index) => (
                                            <motion.li
                                                key={brand._id}
                                                className='hover:font-bold text-zinc-700 transition-all duration-300'
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 * index, duration: 0.5 }}
                                            >
                                                <button
                                                    onClick={() => handleBrandSelect(brand.name)}
                                                    data-brand={brand.name}
                                                    className={`w-full text-left px-4 py-2 transition-colors hover:bg-gray-50 flex items-center gap-3 ${selectedBrand === brand.name
                                                        ? 'bg-gray-50 font-medium text-[#00B0C8]'
                                                        : ''
                                                        }`}
                                                >
                                                    <div className="relative">
                                                        {brand.logo ? (
                                                            <Image
                                                                src={brand.logo}
                                                                alt={brand.name}
                                                                width={100}
                                                                height={100}
                                                                className="object-contain overflow-hidden w-10 h-10 rounded-lg"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                                                <span className="text-gray-500 text-xs">{brand.name.substring(0, 2).toUpperCase()}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="hover:text-[#00B0C8] transition-colors active:font-bold">{brand.name}</span>
                                                </button>
                                            </motion.li>
                                        ))
                                    )}
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                    {/* Products Section */}
                    <motion.div
                        className="w-full md:w-5/6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        {/* Controls */}
                        <motion.div
                            className="flex justify-between items-center mb-6"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        >
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 ${viewMode === 'grid' ? 'text-[#00B0C8]' : 'text-gray-400'}`}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 ${viewMode === 'list' ? 'text-[#00B0C8]' : 'text-gray-400'}`}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                            </div>
                            <div className="flex items-center">
                                {loading ? (
                                    <div className="flex items-center animate-pulse">
                                        <div className="h-4 w-28 bg-gray-200 rounded mr-2"></div>
                                        <div className="h-8 w-36 bg-gray-200 rounded"></div>
                                    </div>
                                ) : (
                                    <>
                                        <span className="mr-2 text-sm text-gray-500">Ordenar por:</span>
                                        <select
                                            className="border rounded-md py-1 px-2 text-sm"
                                            onChange={handleSortChange}
                                            value={sortBy}
                                        >
                                            <option value="default">Por defecto</option>
                                            <option value="price-asc">Precio: menor a mayor</option>
                                            <option value="price-desc">Precio: mayor a menor</option>
                                            <option value="name-asc">Nombre</option>
                                            <option value="newest">Más nuevos</option>
                                        </select>
                                    </>
                                )}
                            </div>
                        </motion.div>
                        {/* Products count - show skeleton if loading */}
                        {loading ? (
                            <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>
                        ) : (
                            <p className="text-sm text-gray-500 mb-4">
                                Mostrando {filteredProducts.length} productos de {totalItems}
                                {selectedBrand !== 'all' ? ` de ${selectedBrand}` : ''}
                            </p>
                        )}
                        {/* Products Grid/List - Show skeleton or content */}
                        {loading ? (
                            <motion.div
                                layout
                                className={`${viewMode === 'grid'
                                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                                    : 'space-y-6'
                                    }`}
                            >
                                {/* Generate appropriate number of skeleton items based on view mode */}
                                {Array(12).fill(0).map((_, index) => (
                                    <ProductSkeleton key={`product-skeleton-${index}`} viewMode={viewMode} />
                                ))}
                            </motion.div>
                        ) : (
                            <>
                                {/* No products message */}
                                {filteredProducts.length === 0 && (
                                    <div className="py-12 text-center">
                                        <p className="text-gray-500">
                                            No hay productos disponibles para esta marca.
                                        </p>
                                    </div>
                                )}
                                {/* Actual products grid/list */}
                                <motion.div
                                    layout
                                    className={`${viewMode === 'grid'
                                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                                        : 'space-y-6'
                                        }`}
                                >
                                    {filteredProducts.map((product, index) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            viewMode={viewMode}
                                            onQuickViewClick={handleOpenQuickView}
                                        />
                                    ))}
                                </motion.div>
                            </>
                        )}
                        {/* Pagination - show skeleton when loading or actual pagination when loaded */}
                        {loading ? (
                            <div className="mt-10 flex justify-center">
                                <div className="flex items-center space-x-2 animate-pulse">
                                    <div className="w-8 h-8 bg-gray-200 rounded-md"></div>
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="w-10 h-8 bg-gray-200 rounded-md"></div>
                                    ))}
                                    <div className="w-8 h-8 bg-gray-200 rounded-md"></div>
                                </div>
                            </div>
                        ) : totalPages > 1 && (
                            <div className="mt-10 flex justify-center">
                                <nav className="flex items-center rounded-md overflow-hidden">
                                    <button
                                        onClick={handlePrevPage}
                                        disabled={currentPage === 1}
                                        className={`p-2 ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                                        aria-label="Previous page"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    {getPaginationNumbers().map((page, index) => (
                                        page === '...' ? (
                                            <span key={`ellipsis-${index}`} className="px-4 py-2 text-gray-500">...</span>
                                        ) : (
                                            <button
                                                key={`page-${page}`}
                                                onClick={() => goToPage(page)}
                                                className={`min-w-[40px] px-4 py-2 ${currentPage === page
                                                    ? 'bg-[#00B0C8] text-white font-medium'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        )
                                    ))}
                                    <button
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages}
                                        className={`p-2 ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                                        aria-label="Next page"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </nav>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
            {quickViewProduct && (
                <ProductQuickView
                    product={quickViewProduct}
                    onClose={handleCloseQuickView}
                />
            )}
        </ShopLayout>
    );
}
