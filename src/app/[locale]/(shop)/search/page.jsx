'use client';
import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiEye, FiSearch, FiPlus } from 'react-icons/fi';
import ShopLayout from "@/components/Layouts/shop-layout";
import Image from "next/image";
import Link from "next/link";
import { motion } from 'framer-motion';
import { Range } from 'react-range';
import ProductCard from "@/components/products/product-card";
import ProductQuickView from "@/components/products/product-quick-view";
import { toast } from 'react-hot-toast';
import Pagination from "@/components/admin/shared/Pagination";
import { useTranslations } from 'next-intl';
export default function SearchPage() {
    const t = useTranslations('SearchPage');
    let locale = 'ca';
    if (typeof window !== 'undefined' && window.navigator) {
        const lang = window.navigator.language || window.navigator.userLanguage;
        if (lang && lang.toLowerCase().startsWith('es')) locale = 'es';
    }
    const [searchTerm, setSearchTerm] = useState('');
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [stockStatus, setStockStatus] = useState('all'); // 'all', 'in-stock', 'out-of-stock'
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [priceRange, setPriceRange] = useState([0, 1000]);
    const [sortBy, setSortBy] = useState('newest');
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // Add view mode state
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false); // Add quick view modal state
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false); // Add filter modal state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(6);
    const handleQuickView = (product) => {
        setQuickViewProduct(product);
        setIsQuickViewOpen(true);
    };
    const handleCloseQuickView = () => {
        setIsQuickViewOpen(false);
        setTimeout(() => setQuickViewProduct(null), 300); // Delay clearing product until animation finishes
    };
    // Fetch categories, brands, and all products on mount
    useEffect(() => {
        const fetchMetaAndProducts = async () => {
            try {
                setIsLoading(true);
                setError(null);
                // Categories
                const catResponse = await fetch('/api/categories?includeChildren=true');
                if (!catResponse.ok) throw new Error('Failed to fetch categories');
                const catData = await catResponse.json();
                const flattenCategories = (categories) => {
                    let flat = [];
                    categories.forEach(cat => {
                        flat.push({
                            id: cat._id,
                            name: cat.name,
                            originalName: cat.name
                        });
                        if (cat.children && cat.children.length) {
                            flat = flat.concat(flattenCategories(cat.children));
                        }
                    });
                    return flat;
                };
                setCategories(flattenCategories(catData));
                // Brands
                const brandsResponse = await fetch('/api/brands?limit=9999&enabled=true');
                if (!brandsResponse.ok) throw new Error('Failed to fetch brands');
                const brandsData = await brandsResponse.json();
                setBrands(brandsData.brands || []);
                // Products (fetch all, filter client-side)
                const prodResponse = await fetch('/api/products?limit=99999&status=active');
                if (!prodResponse.ok) throw new Error('Failed to fetch products');
                const data = await prodResponse.json();
                const formattedProducts = data.products.map(product => ({
                    ...product,
                    id: product._id,
                    name: product.name,
                    category: product.category,
                    price: `${product.price_incl_tax?.toFixed(2).replace('.', ',')} €`,
                    priceValue: product.price_incl_tax,
                    imageUrl: product.image || '/assets/images/Screenshot_4.png',
                    imageUrlHover: product.imageHover || product.image || '/assets/images/Screenshot_4.png',
                    brand: product.brand || '',
                    description: product.description || '',
                    stock: {
                        available: product.stock?.available || 0,
                        minStock: product.stock?.minStock || 5
                    }
                }));
                setAllProducts(formattedProducts);
            } catch (err) {
                console.error('Error fetching meta/products:', err);
                setError('Failed to load data. Please try again later.');
                toast.error('Error loading data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchMetaAndProducts();
    }, []);

    // Client-side filtering, sorting, and pagination (ProductsTable logic)
    useEffect(() => {
        setIsLoading(true);
        let filtered = allProducts;
        // Search term (name, brand, category, reference)
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p => {
                // Name
                let name = '';
                if (p.name && typeof p.name === 'object') {
                    name = p.name[locale] || p.name.ca || p.name.es || '';
                } else if (typeof p.name === 'string') {
                    name = p.name;
                }
                // Brand
                let brand = '';
                if (p.brand && typeof p.brand === 'object') {
                    brand = p.brand.name || p.brand.ca || p.brand.es || '';
                } else if (typeof p.brand === 'string') {
                    brand = p.brand;
                }
                // Category
                let category = '';
                if (p.category && typeof p.category === 'object') {
                    category = p.category[locale] || p.category.ca || p.category.es || '';
                } else if (typeof p.category === 'string') {
                    category = p.category;
                }
                // Reference
                const ref = p.reference || '';
                return (
                    (name && name.toLowerCase().includes(term)) ||
                    (brand && brand.toLowerCase().includes(term)) ||
                    (category && category.toLowerCase().includes(term)) ||
                    (ref && ref.toLowerCase().includes(term))
                );
            });
        }
        // Category filter
        if (selectedCategory) {
            filtered = filtered.filter(p => {
                let cat = '';
                if (p.category && typeof p.category === 'object') {
                    cat = p.category[locale] || p.category.ca || p.category.es || '';
                } else if (typeof p.category === 'string') {
                    cat = p.category;
                }
                // Normalize both for comparison
                return String(cat).trim().toLowerCase() === String(selectedCategory).trim().toLowerCase();
            });
        }
        // Brand filter
        if (selectedBrand) {
            filtered = filtered.filter(p => {
                let brand = '';
                if (p.brand && typeof p.brand === 'object') {
                    brand = p.brand.name || p.brand.ca || p.brand.es || '';
                } else if (typeof p.brand === 'string') {
                    brand = p.brand;
                }
                return brand === selectedBrand;
            });
        }
        // Stock status
        if (stockStatus === 'in-stock') {
            filtered = filtered.filter(p => p.stock && p.stock.available > 0);
        } else if (stockStatus === 'out-of-stock') {
            filtered = filtered.filter(p => !p.stock || p.stock.available <= 0);
        }
        // Price range
        if (priceRange && priceRange.length === 2) {
            filtered = filtered.filter(p => p.priceValue >= priceRange[0] && p.priceValue <= priceRange[1]);
        }
        // Sorting
        let sorted = [...filtered];
        switch (sortBy) {
            case 'price-asc':
                sorted.sort((a, b) => a.priceValue - b.priceValue);
                break;
            case 'price-desc':
                sorted.sort((a, b) => b.priceValue - a.priceValue);
                break;
            case 'name-asc':
                sorted.sort((a, b) => {
                    const aName = typeof a.name === 'object' ? (a.name[locale] || a.name.ca || a.name.es || '') : a.name;
                    const bName = typeof b.name === 'object' ? (b.name[locale] || b.name.ca || b.name.es || '') : b.name;
                    return aName.localeCompare(bName);
                });
                break;
            case 'newest':
                sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            default:
                break;
        }
        // Pagination
        const total = sorted.length;
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        setFilteredProducts(sorted.slice(start, end));
        setTotalItems(total);
        setTotalPages(Math.max(1, Math.ceil(total / itemsPerPage)));
        setIsLoading(false);
    }, [allProducts, searchTerm, selectedCategory, selectedBrand, stockStatus, priceRange, sortBy, currentPage, itemsPerPage, locale]);
    // (Removed: all filtering is now in the above effect)
    // Pagination logic is now handled in the main fetchFilteredProducts effect above
    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory, selectedBrand, stockStatus, priceRange, sortBy]);
    const handleAddToCart = (e, product) => {
        e.preventDefault();
        console.log('Add to cart:', product);
    };
    // Fetch banner image from API
    const [bannerImage, setBannerImage] = useState(null);
    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const res = await fetch('/api/portimg/active');
                if (!res.ok) throw new Error('Failed to fetch banner');
                const data = await res.json();
                if (data && data.imageUrl) {
                    setBannerImage(data.imageUrl);
                }
            } catch (err) {
                console.error('Error fetching banner:', err);
            }
        };
        fetchBanner();
    }, []);
    return (
        <ShopLayout>
            {/* Header with Search Bar */}
            {bannerImage ? (
                <div className="relative w-full mt-10 h-[30vw] min-h-[120px] max-h-[180px] sm:h-[40vh] flex flex-col justify-center items-center rounded-b-2xl overflow-hidden shadow-md">
                    <img
                        src={bannerImage}
                        alt={t('bannerAlt')}
                        fill
                        className="object-cover"
                        priority
                    />
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
            <div className="container w-full max-w-[1500px] bg-white px-1 sm:px-4 py-4 sm:py-8 rounded-t-2xl   mx-auto">
                {/* Search bar and filter button row */}
                <div className="flex  flex-row sm:items-center gap-2 mb-4">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full focus:bg-white p-2 bg-[#FFFFFF80] rounded-xl border border-gray-200 focus:border-[#00B0C8] focus:outline-none text-base sm:text-lg shadow-sm"
                        />
                        <button className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </div>
                    {/* Filter Button for mobile */}
                    <div className="md:hidden flex justify-end">
                        <button
                            className="px-4 py-2 bg-[#00B0C8] text-white rounded-lg font-semibold shadow hover:bg-[#0090a8] transition"
                            onClick={() => setIsFilterModalOpen(true)}
                        >
                            {t('filterButton')}
                        </button>
                    </div>
                </div>
                {/* Main content: sidebar + products */}
                <div className="flex flex-col md:flex-row gap-4 sm:gap-8">
                    {/* Filters Sidebar (desktop) */}
                    <motion.div
                        className="hidden md:block w-full md:w-1/4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        <div className="sticky top-24 bg-white p-6 rounded-lg border border-gray-200">
                            <div className="mb-8">
                                <h3 className="text-lg font-medium mb-4">{t('categoryLabel')}</h3>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#00B0C8] focus:ring-[#00B0C8] focus:outline-none"
                                >
                                    <option value="">{t('allCategoriesOption')}</option>
                                    {categories.map((category, index) => {
                                        const catValue = typeof category.name === 'string'
                                            ? category.name
                                            : (category.name?.[locale] || category.name?.ca || category.name?.es || '');
                                        return (
                                            <React.Fragment key={category._id || `cat-${index}`}>
                                                <option key={category.id || `catopt-${index}`}
                                                    value={catValue}>
                                                    {catValue}
                                                </option>
                                                {category.children?.map((child, childIdx) => {
                                                    const childValue = typeof child.name === 'string'
                                                        ? child.name
                                                        : (child.name?.[locale] || child.name?.ca || child.name?.es || '');
                                                    return (
                                                        <option
                                                            key={child.id ? `${child.id}-child` : `childopt-${index}-${childIdx}`}
                                                            value={childValue}
                                                            className="pl-4"
                                                        >
                                                            {childValue}
                                                        </option>
                                                    );
                                                })}
                                            </React.Fragment>
                                        );
                                    })}
                                </select>
                            </div>
                            {/* Brands Selector */}
                            <div className="mb-8">
                                <h3 className="text-lg font-medium mb-4">{t('brandLabel')}</h3>
                                <select
                                    value={selectedBrand}
                                    onChange={(e) => setSelectedBrand(e.target.value)}
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#00B0C8] focus:ring-[#00B0C8] focus:outline-none"
                                >
                                    <option value="">{t('allBrandsOption')}</option>
                                    {brands.map((brand) => (
                                        <option key={brand._id} value={typeof brand.name === 'string' ? brand.name : (brand.name?.[locale] || brand.name?.ca || brand.name?.es || '')}>
                                            {typeof brand.name === 'string' ? brand.name : (brand.name?.[locale] || brand.name?.ca || brand.name?.es || '')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* Stock Status Selector */}
                            {/* <div className="mb-8">
                                <h3 className="text-lg font-medium mb-4">Disponibilidad</h3>
                                <select
                                    value={stockStatus}
                                    onChange={(e) => setStockStatus(e.target.value)}
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#00B0C8] focus:ring-[#00B0C8] focus:outline-none"
                                >
                                    <option value="all">Todos los productos</option>
                                    <option value="in-stock">En stock</option>
                                    <option value="out-of-stock">Agotado</option>
                                </select>
                            </div> */}
                            {/* Price Range */}
                            <div className="mb-8">
                                <h3 className="text-lg font-medium mb-4">{t('priceLabel')}</h3>
                                <div className="px-2 py-4">
                                    <Range
                                        step={5}
                                        min={0}
                                        max={1000}
                                        values={priceRange}
                                        onChange={setPriceRange}
                                        renderTrack={({ props, children }) => {
                                            const { key, ...restProps } = props;
                                            return (
                                                <div
                                                    key={key}
                                                    {...restProps}
                                                    className="h-2 w-full bg-gray-200 rounded-full"
                                                >
                                                    <div
                                                        className="h-0"
                                                        style={{
                                                            width: `${((priceRange[1] - priceRange[0]) / 1000) * 100}%`,
                                                            left: `${(priceRange[0] / 1000) * 100}%`
                                                        }}
                                                    />
                                                    {children}
                                                </div>
                                            );
                                        }}
                                        renderThumb={({ props }) => {
                                            const { key, ...restProps } = props;
                                            return (
                                                <div
                                                    key={key}
                                                    {...restProps}
                                                    className="h-5 w-5 rounded-full bg-white border-2 border-[#00B0C8] focus:outline-none"
                                                />
                                            );
                                        }}
                                    />
                                    <div className="flex justify-between mt-2 text-sm text-gray-600">
                                        <span>{priceRange[0]}€</span>
                                        <span>{priceRange[1]}€</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                    {/* Filter Modal (mobile) */}
                    {isFilterModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000050] bg-opacity-40">
                            <div className="bg-white rounded-lg p-6 w-11/12 max-w-sm relative animate-fadeInUp">
                                <button
                                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                                    onClick={() => setIsFilterModalOpen(false)}
                                    aria-label="Cerrar"
                                >
                                    &times;
                                </button>
                                {/* Filter content here (copied from sidebar) */}
                                <div>
                                    <div className="mb-8">
                                        <h3 className="text-lg font-medium mb-4">Categoría</h3>
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#00B0C8] focus:ring-[#00B0C8] focus:outline-none"
                                        >
                                            <option value="">Todas las categorías</option>
                                            {categories.map((category, index) => (
                                                <React.Fragment key={category.id || `cat-modal-${index}`}> {/* Unique key for category */}
                                                    <option key={category.id || `catopt-modal-${index}`}
                                                        value={category.originalName || (typeof category.name === 'string' ? category.name : (category.name?.[locale] || category.name?.ca || category.name?.es || ''))}>
                                                        {typeof category.name === 'string' ? category.name : (category.name?.[locale] || category.name?.ca || category.name?.es || '')} {category.count > 0 && `(${category.count})`}
                                                    </option>
                                                    {category.children?.map((child, childIdx) => (
                                                        <option
                                                            key={child.id ? `${child.id}-child-modal` : `childopt-modal-${index}-${childIdx}`}
                                                            value={child.originalName || (typeof child.name === 'string' ? child.name : (child.name?.[locale] || child.name?.ca || child.name?.es || ''))}
                                                            className="pl-4"
                                                        >
                                                            {typeof child.name === 'string' ? child.name : (child.name?.[locale] || child.name?.ca || child.name?.es || '')}
                                                        </option>
                                                    ))}
                                                </React.Fragment>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-8">
                                        <h3 className="text-lg font-medium mb-4">Marca</h3>
                                        <select
                                            value={selectedBrand}
                                            onChange={(e) => setSelectedBrand(e.target.value)}
                                            className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#00B0C8] focus:ring-[#00B0C8] focus:outline-none"
                                        >
                                            <option value="">Todas las marcas</option>
                                            {brands.map((brand) => (
                                                <option key={brand._id} value={typeof brand.name === 'string' ? brand.name : (brand.name?.[locale] || brand.name?.ca || brand.name?.es || '')}>
                                                    {typeof brand.name === 'string' ? brand.name : (brand.name?.[locale] || brand.name?.ca || brand.name?.es || '')}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-8">
                                        <h3 className="text-lg font-medium mb-4">Precio</h3>
                                        <div className="px-2 py-4">
                                            <Range
                                                step={5}
                                                min={0}
                                                max={1000}
                                                values={priceRange}
                                                onChange={setPriceRange}
                                                renderTrack={({ props, children }) => {
                                                    const { key, ...restProps } = props;
                                                    return (
                                                        <div
                                                            key={key}
                                                            {...restProps}
                                                            className="h-2 w-full bg-gray-200 rounded-full"
                                                        >
                                                            <div
                                                                className="h-0"
                                                                style={{
                                                                    width: `${((priceRange[1] - priceRange[0]) / 1000) * 100}%`,
                                                                    left: `${(priceRange[0] / 1000) * 100}%`
                                                                }}
                                                            />
                                                            {children}
                                                        </div>
                                                    );
                                                }}
                                                renderThumb={({ props }) => {
                                                    const { key, ...restProps } = props;
                                                    return (
                                                        <div
                                                            key={key}
                                                            {...restProps}
                                                            className="h-5 w-5 rounded-full bg-white border-2 border-[#00B0C8] focus:outline-none"
                                                        />
                                                    );
                                                }}
                                            />
                                            <div className="flex justify-between mt-2 text-sm text-gray-600">
                                                <span>{priceRange[0]}€</span>
                                                <span>{priceRange[1]}€</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className="w-full mt-2 py-2 bg-[#00B0C8] text-white rounded-lg font-semibold shadow hover:bg-[#0090a8] transition"
                                        onClick={() => setIsFilterModalOpen(false)}
                                    >
                                        Aplicar Filtros
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Products Section */}
                    <motion.div
                        className="w-full md:w-3/4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        {/* Controls */}
                        <motion.div
                            className="flex justify-between items-center mb-2"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        >
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 ${viewMode === 'grid' ? 'text-black' : 'text-gray-400'}`}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 ${viewMode === 'list' ? 'text-black' : 'text-gray-400'}`}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                            </div>
                            <div className="flex items-center">
                                <span className="mr-2 text-sm text-gray-800">{t('sortLabel')}</span>
                                <select
                                    className="border border-gray-600 rounded-md py-1 px-2 text-sm"
                                    onChange={(e) => setSortBy(e.target.value)}
                                    value={sortBy}
                                >
                                    <option value="default">{t('sortDefault')}</option>
                                    <option value="price-asc">{t('sortPriceAsc')}</option>
                                    <option value="price-desc">{t('sortPriceDesc')}</option>
                                    <option value="name-asc">{t('sortNameAsc')}</option>
                                    <option value="newest">{t('sortNewest')}</option>
                                </select>
                            </div>
                        </motion.div>
                        {/* Products Grid/List */}
                        <motion.div
                            layout
                            className={`${viewMode === 'grid'
                                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                                : 'space-y-6'
                                }`}
                        >
                            {filteredProducts.map((product, index) => (
                                <ProductCard
                                    key={index}
                                    product={product}
                                    viewMode={viewMode}
                                    onQuickViewClick={handleQuickView}
                                    addToCart={handleAddToCart}
                                />
                            ))}
                        </motion.div>
                        {/* No Results Message */}
                        {filteredProducts.length === 0 && !isLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12"
                            >
                                <p className="text-gray-500 text-lg">{t('noResults')}</p>
                            </motion.div>
                        )}
                        {/* Loading Skeleton */}
                        {isLoading && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, index) => (
                                    <div key={index} className="animate-pulse">
                                        <div className="bg-gray-200 h-48 rounded-lg mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* Pagination */}
                        {!isLoading && filteredProducts.length > 0 && (
                            <div className="mt-8">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    totalItems={totalItems}
                                    itemsPerPage={itemsPerPage}
                                    onPageChange={setCurrentPage}
                                    onItemsPerPageChange={(value) => {
                                        setItemsPerPage(value);
                                        setCurrentPage(1);
                                    }}
                                    showingText={t('showingText', { count: filteredProducts.length, total: totalItems })}
                                />
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
            {isQuickViewOpen && quickViewProduct && (
                <ProductQuickView
                    product={quickViewProduct}
                    isOpen={isQuickViewOpen}
                    onClose={handleCloseQuickView}
                />
            )}
        </ShopLayout>
    );
}