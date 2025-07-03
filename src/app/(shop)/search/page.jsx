'use client';
import React, { useState, useEffect } from 'react';
import ShopLayout from "@/components/Layouts/shop-layout";
import Image from "next/image";
import Link from "next/link";
import { motion } from 'framer-motion';
import { Range } from 'react-range';
import ProductCard from "@/components/products/product-card";
import ProductQuickView from "@/components/products/product-quick-view";
import { toast } from 'react-hot-toast';
import Pagination from "@/components/admin/shared/Pagination";
export default function SearchPage() {
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
    // Pagination state
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
    // Fetch products and categories on component mount
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch categories with children
                const catResponse = await fetch('/api/categories?includeChildren=true');
                if (!catResponse.ok) throw new Error('Failed to fetch categories');
                const catData = await catResponse.json();
                // Transform category data to include count and handle hierarchy
                const transformCategories = (categories, prefix = '') => {
                    return categories.map(cat => ({
                        id: cat._id,
                        name: prefix ? `${prefix} > ${cat.name}` : cat.name,
                        originalName: cat.name,
                        count: 0,
                        ...(cat.children?.length && {
                            children: transformCategories(cat.children, cat.name)
                        })
                    }));
                };
                const transformedCategories = transformCategories(catData);
                setCategories(transformedCategories);
                // Fetch brands
                const brandsResponse = await fetch('/api/brands?limit=100&enabled=true');
                if (!brandsResponse.ok) throw new Error('Failed to fetch brands');
                const brandsData = await brandsResponse.json();
                setBrands(brandsData.brands || []);
                // Fetch products with pagination
                const queryParams = new URLSearchParams({
                    page: currentPage.toString(),
                    limit: itemsPerPage.toString(),
                    status: 'active'
                });
                const prodResponse = await fetch(`/api/products?${queryParams.toString()}`);
                if (!prodResponse.ok) throw new Error('Failed to fetch products');
                const data = await prodResponse.json();
                // Format products to include necessary fields
                const formattedProducts = data.products.map(product => ({
                    id: product._id,
                    name: product.name,
                    category: product.category,
                    price: `${product.price_incl_tax.toFixed(2).replace('.', ',')} €`,
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
                // Update pagination information
                if (data.pagination) {
                    setTotalPages(data.pagination.totalPages);
                    setTotalItems(data.pagination.totalItems);
                } else {
                    setTotalPages(Math.ceil(formattedProducts.length / itemsPerPage));
                    setTotalItems(formattedProducts.length);
                }
                // Update category counts
                const catCounts = {};
                formattedProducts.forEach(product => {
                    if (product.category) {
                        catCounts[product.category] = (catCounts[product.category] || 0) + 1;
                    }
                });
                // Helper function to update counts recursively
                const updateCategoryCounts = (categories) => {
                    return categories.map(cat => ({
                        ...cat,
                        count: catCounts[cat.originalName || cat.name] || 0,
                        ...(cat.children && {
                            children: updateCategoryCounts(cat.children)
                        })
                    }));
                };
                setCategories(prevCats => updateCategoryCounts(prevCats));
                setFilteredProducts(formattedProducts);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load products and categories. Please try again later.');
                toast.error('Error loading products and categories');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [currentPage, itemsPerPage]);
    // Filter products based on search term, categories, and price range
    useEffect(() => {
        const fetchFilteredProducts = async () => {
            setIsLoading(true);
            try {
                const queryParams = new URLSearchParams({
                    page: currentPage.toString(),
                    limit: itemsPerPage.toString(),
                    status: 'active'
                });

                // Add search filters
                if (searchTerm) {
                    queryParams.append('search', searchTerm);
                }
                if (selectedCategory) {
                    queryParams.append('category', selectedCategory);
                }
                if (selectedBrand) {
                    queryParams.append('brand', selectedBrand);
                }

                // Add stock status filter
                if (stockStatus === 'in-stock') {
                    queryParams.append('inStock', 'true');
                } else if (stockStatus === 'out-of-stock') {
                    queryParams.append('outOfStock', 'true');
                }

                // Add price range parameters
                if (priceRange && priceRange.length === 2) {
                    queryParams.append('minPrice', priceRange[0]);
                    queryParams.append('maxPrice', priceRange[1]);
                }

                // Add sorting parameters
                switch (sortBy) {
                    case 'price-asc':
                        queryParams.append('sort', 'price_incl_tax');
                        queryParams.append('order', 'asc');
                        break;
                    case 'price-desc':
                        queryParams.append('sort', 'price_incl_tax');
                        queryParams.append('order', 'desc');
                        break;
                    case 'name-asc':
                        queryParams.append('sort', 'name');
                        queryParams.append('order', 'asc');
                        break;
                    case 'newest':
                        queryParams.append('sort', 'createdAt');
                        queryParams.append('order', 'desc');
                        break;
                    // default case will use the server's default sorting
                }

                const response = await fetch(`/api/products?${queryParams.toString()}`);
                if (!response.ok) throw new Error('Failed to fetch products');
                const data = await response.json();
                // Format products
                const formattedProducts = data.products.map(product => ({
                    id: product._id,
                    name: product.name,
                    category: product.category,
                    price: `${product.price_incl_tax.toFixed(2).replace('.', ',')} €`,
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
                // Update state with new data
                setFilteredProducts(formattedProducts);
                setTotalPages(data.pagination?.totalPages || 1);
                setTotalItems(data.pagination?.totalItems || formattedProducts.length);
            } catch (err) {
                console.error('Error fetching filtered products:', err);
                toast.error('Error al cargar los productos filtrados');
            } finally {
                setIsLoading(false);
            }
        };
        fetchFilteredProducts();
    }, [searchTerm, selectedCategory, selectedBrand, stockStatus, priceRange, sortBy, currentPage, itemsPerPage]);
    // Pagination logic
    useEffect(() => {
        const fetchPaginatedData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Calculate the range of items to fetch based on the current page and items per page
                const start = (currentPage - 1) * itemsPerPage;
                const end = start + itemsPerPage;
                // Fetch products with pagination
                const prodResponse = await fetch(`/api/products?start=${start}&limit=${itemsPerPage}`);
                if (!prodResponse.ok) throw new Error('Failed to fetch products');
                const data = await prodResponse.json();
                // Format products to include necessary fields
                const formattedProducts = data.products.map(product => ({
                    id: product._id,
                    name: product.name,
                    category: product.category,
                    price: `${product.price_incl_tax.toFixed(2).replace('.', ',')} €`,
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
                // Update total items count for pagination
                setTotalItems(data.totalCount || 0);
                // Calculate total pages
                setTotalPages(Math.ceil(totalItems / itemsPerPage));
            } catch (err) {
                console.error('Error fetching paginated data:', err);
                setError('Failed to load products. Please try again later.');
                toast.error('Error loading products');
            } finally {
                setIsLoading(false);
            }
        };
        fetchPaginatedData();
    }, [currentPage, itemsPerPage]);
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
            <motion.div
                className="relative w-full mt-10 h-[30vw] min-h-[120px] max-h-[180px] sm:h-[40vh] flex flex-col justify-center items-center rounded-b-2xl overflow-hidden shadow-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Image
                    src={bannerImage || "/assets/images/bg-beagrumb.jpg"}
                    alt="Search header"
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-white/70 z-10 pointer-events-none" />
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    <motion.h1
                        className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-800 shadow-amber-50 mt-8 lg:mt-20 drop-shadow-lg"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        Buscar
                    </motion.h1>
                </div>
            </motion.div>
            <div className="container w-full max-w-[1500px] bg-white px-1 sm:px-4 py-4 sm:py-8 rounded-t-2xl   mx-auto">
                {/* Search bar and filter button row */}
                <div className="flex  flex-row sm:items-center gap-2 mb-4">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Buscar productos..."
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
                            Filtrar
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
                                <h3 className="text-lg font-medium mb-4">Categoría</h3>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#00B0C8] focus:ring-[#00B0C8] focus:outline-none"
                                >
                                    <option value="">Todas las categorías</option>
                                    {categories.map((category) => (
                                        <React.Fragment key={category.id}>
                                            <option value={category.originalName || category.name}>
                                                {category.name} {category.count > 0 && `(${category.count})`}
                                            </option>
                                            {category.children?.map(child => (
                                                <option
                                                    key={child.id}
                                                    value={child.originalName}
                                                    className="pl-4"
                                                >
                                                    {child.name}
                                                </option>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </select>
                            </div>
                            {/* Brands Selector */}
                            <div className="mb-8">
                                <h3 className="text-lg font-medium mb-4">Marca</h3>
                                <select
                                    value={selectedBrand}
                                    onChange={(e) => setSelectedBrand(e.target.value)}
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#00B0C8] focus:ring-[#00B0C8] focus:outline-none"
                                >
                                    <option value="">Todas las marcas</option>
                                    {brands.map((brand) => (
                                        <option key={brand._id} value={brand.name}>
                                            {brand.name}
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
                                <h3 className="text-lg font-medium mb-4">Precio</h3>
                                <div className="px-2 py-4">
                                    <Range
                                        step={10}
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
                                                    className="h-1 w-full bg-gray-200 rounded-full"
                                                >
                                                    <div
                                                        className="h-1 bg-[#00B0C8]"
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
                                            {categories.map((category) => (
                                                <React.Fragment key={category.id}>
                                                    <option value={category.originalName || category.name}>
                                                        {category.name} {category.count > 0 && `(${category.count})`}
                                                    </option>
                                                    {category.children?.map(child => (
                                                        <option
                                                            key={child.id}
                                                            value={child.originalName}
                                                            className="pl-4"
                                                        >
                                                            {child.name}
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
                                                <option key={brand._id} value={brand.name}>
                                                    {brand.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-8">
                                        <h3 className="text-lg font-medium mb-4">Precio</h3>
                                        <div className="px-2 py-4">
                                            <Range
                                                step={10}
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
                                                            className="h-1 w-full bg-gray-200 rounded-full"
                                                        >
                                                            <div
                                                                className="h-1 bg-[#00B0C8]"
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
                                <span className="mr-2 text-sm text-gray-800">Ordenar por:</span>
                                <select
                                    className="border border-gray-600 rounded-md py-1 px-2 text-sm"
                                    onChange={(e) => setSortBy(e.target.value)}
                                    value={sortBy}
                                > 
                                    <option value="default">Por defecto</option>
                                    <option value="price-asc">Precio ↑</option>
                                    <option value="price-desc">Precio ↓</option>
                                    <option value="name-asc">Nombre A-Z</option>
                                    <option value="newest">Más nuevos</option>
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
                                <p className="text-gray-500 text-lg">No se encontraron productos que coincidan con tu búsqueda.</p>
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
                                    showingText="Mostrando {} de {} productos"
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