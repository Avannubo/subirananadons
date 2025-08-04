'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ShopLayout from "@/components/Layouts/shop-layout";
import Image from "next/image";
import { motion } from 'framer-motion';
import ProductCard from "@/components/products/product-card";
import ProductQuickView from "@/components/products/product-quick-view";
import { useTranslations } from 'next-intl';
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
    // Remove local state for selectedBrand and selectedBrandId
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('default');
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [brandsLoading, setBrandsLoading] = useState(true);
    const [bannerImage, setBannerImage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const productsPerPage = 6;
    const t = useTranslations('BrandsPage');
    // Fetch brands
    useEffect(() => {
        const fetchBrands = async () => {
            try {
                setBrandsLoading(true);
                const response = await fetch('/api/brands?limit=100&enabled=true');
                const data = await response.json();
                if (data.brands && data.brands.length > 0) {
                    // Sort brands alphabetically by name
                    const sortedBrands = [...data.brands].sort((a, b) => a.name.localeCompare(b.name));
                    setBrands(sortedBrands);
                }
            } catch (error) {
                console.error('Error fetching brands:', error);
            } finally {
                setBrandsLoading(false);
            }
        };
        fetchBrands();
    }, [searchParams]);
    // Get selectedBrandId from searchParams
    const selectedBrandId = searchParams.get('brand') || 'all';
    // Get selectedBrand name from brands list
    const selectedBrand = selectedBrandId === 'all'
        ? 'all'
        : (brands.find(b => b._id === selectedBrandId)?.name || '');

    // Fetch products for selected brand
    useEffect(() => {
        const fetchProducts = async () => {
            if (!selectedBrandId) return;
            try {
                setLoading(true);
                // If 'all' is selected, don't filter by brand
                const endpoint = selectedBrandId === 'all'
                    ? `/api/products?limit=${productsPerPage}&page=${currentPage}&status=active`
                    : `/api/products?brand=${selectedBrandId}&limit=${productsPerPage}&page=${currentPage}&status=active`;
                const response = await fetch(endpoint);
                const data = await response.json();
                let fetchedProducts = data.products || [];
                console.log('Fetched products:', fetchedProducts);

                // Format products to match the expected structure
                fetchedProducts = fetchedProducts.map(product => ({
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
                setProducts(fetchedProducts);
                // Update pagination information
                if (data.pagination) {
                    setTotalPages(data.pagination.totalPages);
                    setTotalItems(data.pagination.totalItems);
                }
                // Scroll to top when brand or page changes
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            } catch (error) {
                console.error('Error fetching products:', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [selectedBrandId, currentPage, productsPerPage, brands]);
    // Reset to page 1 when changing brands
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedBrandId]);
    // Sort products when sortBy changes
    // Filter and sort products whenever products, sortBy, or selectedBrandId changes
    useEffect(() => {
        let filtered = products;
        if (selectedBrandId !== 'all') {
            filtered = filtered.filter(product => {
                if (!product.brand) return false;
                if (typeof product.brand === 'object' && product.brand._id) {
                    return String(product.brand._id) === String(selectedBrandId);
                }
                if (typeof product.brand === 'string') {
                    return String(product.brand) === String(selectedBrandId);
                }
                if (product.brand instanceof Object && product.brand.toString) {
                    return product.brand.toString() === String(selectedBrandId);
                }
                return false;
            });
        }
        let sorted = [...filtered];
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
                sorted.sort((a, b) => b.salesCount - a.salesCount);
                break;
            default:
                break;
        }
        setFilteredProducts(sorted);
    }, [products, sortBy, selectedBrandId]);

    // Debug: log filteredProducts before render
    useEffect(() => {
        console.log('filteredProducts state:', filteredProducts);
    }, [filteredProducts]);
    // Scroll to selected brand in sidebar
    useEffect(() => {
        if (selectedBrandId && !brandsLoading) {
            const selectedBrandElement = document.querySelector(`button[data-brand="${selectedBrandId}"]`);
            if (selectedBrandElement) {
                selectedBrandElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    }, [selectedBrandId, brandsLoading]);
    // Fetch banner image
    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const res = await fetch('/api/portimg/active');
                if (!res.ok) throw new Error('Failed to fetch banner');
                const data = await res.json();
                if (data && (data.image || data.imageUrl)) {
                    setBannerImage(data.image || data.imageUrl);
                }
            } catch {
                setBannerImage(null);
            }
        };
        fetchBanner();
    }, []);
    const sortProducts = (products) => {
        // No longer needed, logic moved to useEffect above
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
    const handleBrandSelect = (brandId) => {
        const params = new URLSearchParams(searchParams.toString());
        if (brandId === 'all') {
            params.delete('brand');
        } else {
            params.set('brand', brandId);
        }
        // Get locale from current path
        const localeMatch = window.location.pathname.match(/^\/([^\/]+)\//);
        const locale = localeMatch ? localeMatch[1] : '';
        // Build new path with locale
        const newPath = locale ? `/${locale}/brands?${params.toString()}` : `/brands?${params.toString()}`;
        router.push(newPath);
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
        const maxPagesToShow = 2; // Show 1 or 2 page numbers only
        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);
            // Show current page if not first or last
            if (currentPage > 2 && currentPage < totalPages) {
                pages.push('...');
                pages.push(currentPage);
            } else if (currentPage === 2) {
                pages.push(2);
            }
            // Always show last page
            if (totalPages > 1) {
                if (currentPage < totalPages - 1) pages.push('...');
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
                    <div className="w-1/4 lg:max-h-[65vh] bg-gray-200 rounded-lg mr-4"></div>
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
            {bannerImage ? (
                <div className="relative w-full mt-10 h-[30vw] min-h-[120px] max-h-[180px] sm:h-[40vh] flex flex-col justify-center items-center rounded-b-2xl overflow-hidden shadow-md">
                    <img
                        src={bannerImage}
                        alt={t('bannerAlt')}
                        fill
                        className="object-cover"
                        priority
                    />
                    {/* Overlay for contrast */}
                    <div className="absolute inset-0 bg-white/70 z-10 pointer-events-none" />
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                        <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-800 shadow-amber-50 mt-8 lg:mt-20 drop-shadow-lg">{t('title')}</h1>
                    </div>
                </div>
            ) : (
                <div className="w-full mt-10 h-[30vw] min-h-[120px] max-h-[180px] sm:h-[40vh] flex flex-col justify-center items-center rounded-b-2xl bg-white">
                    <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-800 mt-8 lg:mt-20">{t('title')}</h1>
                </div>
            )}
            <div className="container mx-auto px-2 sm:px-4 py-4 ">
                <div className="flex flex-col lg:flex-row gap-2  ">
                    {/* Brands Sidebar */}
                    <motion.div
                        className="w-full lg:w-1/6 mb-2 md:mb-0"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        <div className="sticky top-24 bg-white">
                            <h2 className="hidden lg:block font-medium text-lg mb-4 px-4">{t('sidebarTitle')}</h2>
                            <div className="hidden lg:block max-h-[calc(100vh-650px)] lg:max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
                                                className={`w-full text-left px-4 py-2 transition-colors rounded-lg hover:bg-gray-50 flex items-center gap-3 ${selectedBrandId === 'all'
                                                    ? 'bg-gray-50 font-medium text-[#00B0C8]'
                                                    : ''
                                                    } cursor-pointer`}
                                            >
                                                <div className="relative">
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 bg-opacity-10 flex items-center justify-center">
                                                        <span className="text-gray-500 text-xs">ALL</span>
                                                    </div>
                                                </div>
                                                <span className="hover:text-[#00B0C8] transition-colors active:font-bold">{t('allBrandsOption')}</span>
                                            </button>
                                        </motion.li>
                                    ) : (
                                        <BrandSkeleton key="all-skeleton" />
                                    )}
                                    {/* Brands list or skeleton */}
                                    {brandsLoading ? (
                                        // Show brand skeletons while loading
                                        Array(6).fill(0).map((_, index) => (
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
                                                    onClick={() => handleBrandSelect(brand._id)}
                                                    data-brand={brand._id}
                                                    className={`w-full text-left px-4 py-2 transition-colors hover:bg-gray-50 flex items-center gap-3 ${selectedBrandId === brand._id
                                                        ? 'bg-gray-50 font-medium text-[#00B0C8]'
                                                        : ''
                                                        } cursor-pointer`}
                                                >
                                                    <div className="relative">
                                                        {brand.logo ? (
                                                            <img
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
                            {/* Brand selection dropdown for mobile and tablet (up to lg) */}
                            <div className="block lg:hidden w-full">
                                <select
                                    className="w-full border border-gray-300 text-gray-700 rounded-lg p-2 bg-white shadow-sm focus:ring-2 focus:ring-[#00B0C8] focus:border-[#00B0C8] transition"
                                    value={selectedBrandId || 'all'}
                                    onChange={e => handleBrandSelect(e.target.value)}
                                    disabled={brandsLoading}
                                >
                                    <option value="all">{t('allBrandsOption')}</option>
                                    {brands.map((brand) => (
                                        <option key={brand._id} value={brand._id}>{brand.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </motion.div>
                    {/* Products Section */}
                    <motion.div
                        className="w-full  lg:w-5/6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        {/* Controls */}
                        <motion.div
                            className="flex flex-row justify-between gap-2"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        >
                            <div className="flex items-center">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 ${viewMode === 'grid' ? 'text-black' : 'text-gray-400'} cursor-pointer`}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 ${viewMode === 'list' ? 'text-black' : 'text-gray-400'} cursor-pointer`}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                            </div>
                            {/* <div className="flex flex-row justify-end items-center w-full">
                                {loading ? (
                                    <div className="flex items-center animate-pulse">
                                        <div className="h-4 w-28 bg-gray-200 rounded mr-2"></div>
                                        <div className="h-8 w-36 bg-gray-200 rounded"></div>
                                    </div>
                                ) : (
                                    <>
                                        <span className="mr-2 text-sm text-gray-500">{t('sortLabel')}</span>
                                        <select
                                            className="border rounded-md py-1 px-2 text-sm"
                                            onChange={handleSortChange}
                                            value={sortBy}
                                        >
                                            <option value="default">{t('sortDefault')}</option>
                                            <option value="price-asc">{t('sortPriceAsc')}</option>
                                            <option value="price-desc">{t('sortPriceDesc')}</option>
                                            <option value="name-asc">{t('sortNameAsc')}</option>
                                            <option value="newest">{t('sortNewest')}</option>
                                        </select>
                                    </>
                                )}
                            </div> */}
                        </motion.div>
                        {/* Products count - show skeleton if loading */}
                        {loading ? (
                            <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>
                        ) : (
                            <p className="text-sm text-gray-500 mb-4 p-2">
                                {t('showingProducts', { count: products.length, total: totalItems })}
                                {selectedBrand !== 'all' ? ` ${t('showingForBrand', { brand: selectedBrand })}` : ''}
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
                                {/* Debug: show filteredProducts in UI for troubleshooting */}
                                {/* <pre style={{ color: 'red', fontSize: '12px', marginBottom: '8px' }}>
                                    {JSON.stringify(filteredProducts, null, 2)}
                                </pre> */}
                                {/* No products message */}
                                {products.length === 0 && (
                                    <div className="py-12 text-center">
                                        <p className="text-gray-500">
                                            {t('noProductsForBrand')}
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
                                    {products.map((product, index) => (
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
                                        className={`p-2 ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'} cursor-pointer`}
                                        aria-label={t('prevPageAria')}
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
                                                    : 'text-gray-700 hover:bg-gray-50'} cursor-pointer`}
                                            >
                                                {page}
                                            </button>
                                        )
                                    ))}
                                    <button
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages}
                                        className={`p-2 ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'} cursor-pointer`}
                                        aria-label={t('nextPageAria')}
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
