'use client';
import Image from "next/image";
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ShopLayout from "@/components/Layouts/shop-layout";
import ProductCard from "@/components/products/product-card";
import { useSearchParams, useRouter } from 'next/navigation';
import ProductQuickView from "@/components/products/product-quick-view";
import { fetchProducts, formatProduct } from '@/services/ProductService';
import { fetchCategories } from '@/services/CategoryService';
import { useTranslations, useLocale } from 'next-intl';
import { useSession } from 'next-auth/react';

// Utility to get display name from category (handles translation and legacy)
function getCategoryDisplayName(cat, locale = 'es') {
    if (!cat) return '';
    if (typeof cat === 'object' && cat !== null) {
        if (cat.name) {
            if (typeof cat.name === 'object') {
                return cat.name[locale] || cat.name.ca || cat.name.es || Object.values(cat.name)[0] || '';
            }
            return cat.name;
        }
        if (cat.label) {
            if (typeof cat.label === 'object') {
                return cat.label[locale] || cat.label.ca || cat.label.es || Object.values(cat.label)[0] || '';
            }
            return cat.label;
        }
    }
    if (typeof cat === 'string') return cat;
    return '';
}

// Helper function to find a category node and its path by label (handles translation)
function findCategoryAndPath(node, labelToFind, currentPath = [], locale = 'es') {
    const nodeLabel = getCategoryDisplayName(node, locale);
    const pathIncludingSelf = [...currentPath, nodeLabel];
    if (nodeLabel === labelToFind) {
        return { node, path: pathIncludingSelf };
    }
    if (node.submenu) {
        for (const subNode of node.submenu) {
            const result = findCategoryAndPath(subNode, labelToFind, pathIncludingSelf, locale);
            if (result) return result;
        }
    }
    return null;
}
// Helper function to get all LEAF category labels under a given node
function getAllLeafCategoryLabels(node) {
    let labels = [];
    if (!node.submenu || node.submenu.length === 0) {
        // Only add if it's a leaf node (has no submenu)
        labels.push(node.label);
    } else {
        // If it has a submenu, recurse
        node.submenu.forEach(subNode => {
            labels = labels.concat(getAllLeafCategoryLabels(subNode));
        });
    }
    return labels;
}
export default function Page() {
    // Birth list modal state
    const [showBirthListModal, setShowBirthListModal] = useState(false);
    const [birthListProduct, setBirthListProduct] = useState(null);
    const { data: session } = useSession ? useSession() : { data: null };
    const locale = useLocale();
    // State and effect for categories (declare FIRST)
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [categoriesError, setCategoriesError] = useState(null);

    const [viewMode, setViewMode] = useState('grid');
    const [sortOrder, setSortOrder] = useState('sales-desc');
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    // Initialize with the root label from the DB
    const [categoryPath, setCategoryPath] = useState([{ slug: 'root', label: 'Productos' }]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const productsPerPage = 6;
    // Access query parameters
    const searchParams = useSearchParams();
    const router = useRouter();
    // ...existing code...
    // Add useState for banner image
    const [bannerUrl, setBannerUrl] = useState(null);
    // Get the current category node based on the last item in the path
    const currentCategoryLabel = categoryPath[categoryPath.length - 1];
    const t = useTranslations('ProductsPage');
    // Helper to find a category node by path in the categories tree (handles translation)
    function findCategoryNodeByPath(categories, path, locale = 'es') {
        let node = { children: categories };
        for (const pathItem of path) {
            if (!node.children) return null;
            node = node.children.find(cat => cat._id === pathItem._id);
            if (!node) return null;
        }
        return node;
    }
    const currentCategoryNode = useMemo(() => findCategoryNodeByPath(categories, categoryPath.slice(1), locale), [categories, categoryPath, locale]);
    const currentSubcategories = currentCategoryNode?.children || [];

    // Effect to handle URL parameters when the component mounts
    useEffect(() => {
        const categoryId = searchParams.get('category');
        if (categoryId && categories && categories.length > 0) {
            // Support multiple category ids (comma separated)
            const ids = categoryId.split(',');
            // Find the first id for breadcrumb/path
            function findPathById(categories, id, path = []) {
                for (const cat of categories) {
                    const newPath = [...path, { _id: cat._id, label: getCategoryDisplayName(cat, locale) }];
                    if (cat._id === id) return newPath;
                    if (cat.children) {
                        const found = findPathById(cat.children, id, newPath);
                        if (found) return found;
                    }
                }
                return null;
            }
            const foundPath = findPathById(categories, ids[0]);
            if (foundPath) {
                setCategoryPath([{ _id: 'root', label: 'Productos' }, ...foundPath]);
            }
        }
    }, [categories]);
    // Fetch active banner image on mount
    useEffect(() => {
        async function fetchBanner() {
            try {
                const res = await fetch('/api/portimg/active');
                const data = await res.json();
                setBannerUrl(data.imageUrl);
            } catch (e) {
                setBannerUrl(null);
            }
        }
        fetchBanner();
    }, []);
    // Fetch categories from DB on mount
    useEffect(() => {
        async function loadCategories() {
            setCategoriesLoading(true);
            try {
                const cats = await fetchCategories({ parent: 'null', includeChildren: true });
                setCategories(cats);
                setCategoriesError(null);
            } catch (err) {
                setCategoriesError('Error loading categories');
                setCategories([]);
            } finally {
                setCategoriesLoading(false);
            }
        }
        loadCategories();
    }, []);
    // Helper function to find a category in the category tree
    function findCategoryInTree(rootNode, categoryToFind) {
        // First try direct lookup
        const result = findCategoryAndPath(rootNode, categoryToFind);
        if (result) return result;
        // If not found directly, try case-insensitive search or exact matches
        function searchRecursively(node, target, currentPath = []) {
            const targetLower = target.toLowerCase();
            const pathWithCurrent = [...currentPath, node.label];
            // Check if current node matches (case insensitive)
            if (node.label.toLowerCase() === targetLower) {
                return { node, path: pathWithCurrent };
            }
            // Check submenu
            if (node.submenu) {
                for (const child of node.submenu) {
                    const result = searchRecursively(child, target, pathWithCurrent);
                    if (result) return result;
                }
            }
            return null;
        }
        return searchRecursively(rootNode, categoryToFind);
    }
    // Helper function to find a category by partial match (case insensitive)
    function findCategoryByPartialMatch(rootNode, partialName) {
        function searchNodeRecursively(node, search, currentPath = []) {
            const nodePath = [...currentPath, node.label];
            // Check if current node contains the search term
            if (node.label.toLowerCase().includes(search)) {
                return { node, path: nodePath };
            }
            // Search in submenu
            if (node.submenu) {
                for (const subNode of node.submenu) {
                    const result = searchNodeRecursively(subNode, search, nodePath);
                    if (result) return result;
                }
            }
            return null;
        }
        return searchNodeRecursively(rootNode, partialName);
    }
    // Fetch products from the database
    useEffect(() => {
        async function loadProducts() {
            try {
                setLoading(true);
                // Define fetch options
                const options = {
                    page: currentPage,
                    limit: productsPerPage,
                    status: 'active'
                };
                // Get all leaf category ids under the current node (including itself if it's a leaf)
                if (currentCategoryNode && categoryPath.length > 1) {
                    function getAllLeafIds(node) {
                        if (!node.children || node.children.length === 0) {
                            return [node._id];
                        } else {
                            return node.children.flatMap(getAllLeafIds);
                        }
                    }
                    const allLeafIds = getAllLeafIds(currentCategoryNode);
                    options.category = allLeafIds.join(',');
                }
                // ...existing code...
                // Only use category filter, no brand
                console.log('Fetching products with options:', options);
                // Fetch products with category filtering
                const data = await fetchProducts(options);
                // Safely access data properties with checks for undefined/null
                if (data && data.products) {
                    // Format the products for display
                    const formattedProducts = data.products.map(product => formatProduct(product));
                    setProducts(formattedProducts);
                    // Safely access pagination data
                    if (data.pagination) {
                        setTotalPages(data.pagination.totalPages || 1);
                        setTotalProducts(data.pagination.totalItems || 0);
                    } else {
                        setTotalPages(1);
                        setTotalProducts(formattedProducts.length);
                    }
                    setError(null);
                } else {
                    // Handle case where data or data.products is undefined
                    setProducts([]);
                    setTotalPages(1);
                    setTotalProducts(0);
                    setError('No products found. Please try again later.');
                }
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to load products. Please try again later.');
                setProducts([]);
                setTotalPages(1);
                setTotalProducts(0);
            } finally {
                setLoading(false);
            }
        }
        loadProducts();
    }, [categoryPath, currentCategoryNode, currentPage, searchParams]);
    // Reset to page 1 when category changes
    useEffect(() => {
        setCurrentPage(1);
    }, [categoryPath]);
    // Memoize filtered and sorted products
    const filteredAndSortedProducts = useMemo(() => {
        if (loading) return [];
        // Products are already filtered by the API call, we just need to sort them
        const sortableProducts = [...products];
        // Helper to get translated name for sorting
        const getTranslatedName = (product) => {
            if (product.translations && typeof product.translations === 'object') {
                const translation = product.translations[locale];
                if (translation && translation.name) {
                    return translation.name;
                }
            }
            return product.name;
        };
        switch (sortOrder) {
            case 'price-asc':
                sortableProducts.sort((a, b) => a.priceValue - b.priceValue);
                break;
            case 'price-desc':
                sortableProducts.sort((a, b) => b.priceValue - a.priceValue);
                break;
            case 'name-asc':
                sortableProducts.sort((a, b) => getTranslatedName(a).localeCompare(getTranslatedName(b)));
                break;
            case 'name-desc':
                sortableProducts.sort((a, b) => getTranslatedName(b).localeCompare(getTranslatedName(a)));
                break;
            case 'sales-desc':
            default:
                sortableProducts.sort((a, b) => b.salesCount - a.salesCount);
                break;
        }
        return sortableProducts;
    }, [products, sortOrder, loading]);
    const handleSortChange = (event) => {
        setSortOrder(event.target.value);
    };

    // Navigate back up using breadcrumbs
    const handleBreadcrumbClick = (index) => {
        // Slice the path up to and including the clicked index
        const newPath = categoryPath.slice(0, index + 1);
        setCategoryPath(newPath);
        // Update URL parameters or remove category parameter if we go back to root
        const params = new URLSearchParams(searchParams);
        if (index === 0) {
            // If going back to root, remove the category parameter
            params.delete('category');
        } else {
            // Otherwise, update to the new category
            params.set('category', newPath[newPath.length - 1]._id);
        }
        router.push(`/products?${params.toString()}`);
    };
    const handleOpenQuickView = (product) => {
        setQuickViewProduct(product);
    };
    const handleCloseQuickView = () => {
        setQuickViewProduct(null);
    };

    const handleOpenBirthListSelectModal = (product) => {
        setBirthListProduct(product);
    };
    const handleCloseBirthListSelectModal = () => {
        setBirthListProduct(null);
    };
    // Pagination handlers
    const goToPage = (page) => {
        setCurrentPage(page);
        // Scroll to top when changing pages
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const goToPreviousPage = () => {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    };
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
    };
    // Generate page numbers for pagination
    const getPageNumbers = () => {
        let pages = [];
        const maxPagesToShow = 1;
        if (totalPages <= maxPagesToShow) {
            // If we have fewer pages than the max, show all pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Calculate how many numbers to show on each side of current page
            const sidesCount = Math.floor(maxPagesToShow / 2);
            // Start with the current page in the center
            let startPage = Math.max(2, currentPage - sidesCount);
            let endPage = Math.min(totalPages - 1, currentPage + sidesCount);
            // Adjust if we're near the start
            if (currentPage - sidesCount < 2) {
                endPage = Math.min(1 + maxPagesToShow - 1, totalPages - 1);
            }
            // Adjust if we're near the end
            if (currentPage + sidesCount > totalPages - 1) {
                startPage = Math.max(2, totalPages - maxPagesToShow + 1);
            }
            // Always add first page
            pages.push(1);
            // Add ellipsis after first page if needed
            if (startPage > 2) {
                pages.push('...');
            }
            // Add pages around current page
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
            // Add ellipsis before last page if needed
            if (endPage < totalPages - 1) {
                pages.push('...');
            }
            // Always add last page
            pages.push(totalPages);
        }
        return pages;
    };
    function flattenCategories(node, parentPath = []) {
        let flat = [];
        const currentPath = [...parentPath, node.label];
        if (!node.submenu || node.submenu.length === 0) {
            flat.push({ label: currentPath.join(' > '), value: node.label });
        } else {
            node.submenu.forEach(sub => {
                flat = flat.concat(flattenCategories(sub, currentPath));
            });
        }
        return flat;
    }
    // Memoize all categories for dropdown
    function flattenCategoriesFromDb(categories, parentPath = [], locale = 'es') {
        let flat = [];
        for (const cat of categories) {
            const catLabel = getCategoryDisplayName(cat, locale);
            const currentPath = [...parentPath, catLabel];
            if (!cat.children || cat.children.length === 0) {
                flat.push({ label: currentPath.join(' > '), value: catLabel });
            } else {
                flat = flat.concat(flattenCategoriesFromDb(cat.children, currentPath, locale));
            }
        }
        return flat;
    }
    const allCategories = useMemo(() => flattenCategoriesFromDb(categories, [], locale), [categories, locale]);
    // Handler for mobile dropdown change
    const handleMobileCategoryChange = (e) => {
        const selectedLabel = e.target.value;
        // Find the path for the selected label in the DB categories
        function findPathByLabel(categories, label, path = []) {
            for (const cat of categories) {
                const newPath = [...path, cat.name];
                if (cat.name === label) return newPath;
                if (cat.children) {
                    const found = findPathByLabel(cat.children, label, newPath);
                    if (found) return found;
                }
            }
            return null;
        }
        const foundPath = findPathByLabel(categories, selectedLabel);
        if (foundPath) {
            setCategoryPath(['Productos', ...foundPath]);
            // Update URL params
            const params = new URLSearchParams(searchParams);
            if (selectedLabel === 'Productos') {
                params.delete('category');
            } else {
                params.set('category', selectedLabel);
            }
            router.push(`/products?${params.toString()}`);
        }
    };
    return (
        <ShopLayout>
            {/* Banner with overlay and white title, matching brands page */}
            {bannerUrl ? (
                <div className="relative w-full mt-10 h-[30vw] min-h-[120px] max-h-[180px] sm:h-[40vh] flex flex-col justify-center items-center rounded-b-2xl overflow-hidden shadow-md">
                    <img
                        src={bannerUrl}
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
            <div className="container w-full max-w-[1500px] bg-white px-1 sm:px-4 py-2 sm:py-8 rounded-t-2xl mt-4 sm:mt-0 ">
                {/* ...existing code... */}
                {/* Breadcrumbs */}
                <nav aria-label="Breadcrumb" className="hidden lg:flex mb-2 pl-2 overflow-x-auto">
                    <ol className="flex items-center space-x-1 text-sm sm:text-md text-gray-500 flex-wrap min-w-[200px]">
                        {categoryPath.map((cat, index) => (
                            <li key={cat.slug || index} className="flex items-center">
                                {index > 0 && (
                                    <svg className="w-3 h-3 mx-1 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                                )}
                                {index < categoryPath.length - 1 ? (
                                    <button onClick={() => handleBreadcrumbClick(index)} className="hover:underline hover:text-gray-700 cursor-pointer">
                                        {cat.label}
                                    </button>
                                ) : (
                                    <span className="font-semibold text-gray-700">{cat.label}</span>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>
                <div className="flex flex-col lg:flex-row gap-2">
                    {/* Category/Subcategory List Sidebar */}
                    {/* Mobile dropdown visible only on mobile, sidebar visible only on sm+ */}
                    <div className="block lg:hidden w-full mb-4 ">
                        <select
                            id="mobile-category-select"
                            className="w-full border border-gray-300 text-gray-700 rounded-lg p-2 bg-white shadow-sm focus:ring-2 focus:ring-[#00B0C8] focus:border-[#00B0C8] transition"
                            value={currentCategoryLabel}
                            onChange={handleMobileCategoryChange}
                        >
                            {allCategories.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>
                    <aside className="hidden lg:flex w-full lg:w-1/4 xl:w-1/5 flex-shrink-0 mb-6 lg:mb-0">
                        {/*   <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">
                            {currentCategoryLabel === 'Productos' ? "Categorías" : `Subcategorías de ${categoryPath[categoryPath.length - 2] || "Productos"}`}
                        </h3> */}
                        {/* Show subcategories if available, otherwise show siblings */}
                        {currentSubcategories && currentSubcategories.length > 0 ? (
                            <ul className="space-y-1">
                                {currentSubcategories.map((subCategory) => (
                                    <li key={subCategory._id}>
                                        <button
                                            onClick={() => {
                                                const newPath = [...categoryPath, { _id: subCategory._id, label: getCategoryDisplayName(subCategory, locale) }];
                                                setCategoryPath(newPath);
                                                // Update URL parameters
                                                const params = new URLSearchParams(searchParams);
                                                params.set('category', subCategory._id);
                                                router.push(`/products?${params.toString()}`);
                                            }}
                                            className={`w-full cursor-pointer text-left px-2 py-1.5 rounded text-gray-600 hover:bg-gray-100 hover:font-semibold transition-colors duration-150`}
                                        >
                                            {getCategoryDisplayName(subCategory, locale)}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            categoryPath.length > 1 && (
                                <ul className="space-y-1">
                                    {/* Get the parent's children (siblings) when there are no subcategories */}
                                    {(function getSiblings() {
                                        // Find parent node
                                        const parentPath = categoryPath.slice(0, -1);
                                        const parentNode = findCategoryNodeByPath(categories, parentPath.slice(1));
                                        if (!parentNode || !parentNode.children) return null;
                                        return parentNode.children.map((siblingCategory) => (
                                            <li key={siblingCategory._id}>
                                                <button
                                                    onClick={() => {
                                                        // Replace last in path with sibling
                                                        const newPath = [...categoryPath.slice(0, -1), { _id: siblingCategory._id, label: getCategoryDisplayName(siblingCategory, locale) }];
                                                        setCategoryPath(newPath);
                                                        // Update URL parameters
                                                        const params = new URLSearchParams(searchParams);
                                                        params.set('category', siblingCategory._id);
                                                        router.push(`/products?${params.toString()}`);
                                                    }}
                                                    className={`w-full cursor-pointer text-left px-2 py-1.5 rounded transition-colors duration-150 
                                                        ${siblingCategory._id === currentCategoryLabel._id
                                                            ? 'text-[#00B0C8] font-semibold bg-gray-100'
                                                            : 'text-gray-600 hover:bg-gray-100 hover:font-semibold'
                                                        }`}
                                                >
                                                    {getCategoryDisplayName(siblingCategory, locale)}
                                                </button>
                                            </li>
                                        ));
                                    })()}
                                </ul>
                            )
                        )}
                    </aside>
                    {/* Product Grid Area */}
                    <main className="w-full flex-grow">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 flex-wrap gap-2">
                            {/* Mobile: sort and view controls stacked, desktop: inline */}
                            <div className="flex flex-row w-full justify-between items-center gap-2 sm:hidden  ">
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 ${viewMode === 'grid' ? 'text-black' : 'text-gray-400'} hover:text-black`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 ${viewMode === 'list' ? 'text-black' : 'text-gray-400'} hover:text-black`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                                    </button>
                                </div>
                                <div className="flex items-center">
                                    <label htmlFor="sort-by" className="mr-1 text-gray-600 text-xs whitespace-nowrap">{t('sortLabelMobile')}</label>
                                    <select
                                        id="sort-by"
                                        className="border border-gray-300 rounded p-1 text-xs text-gray-600 cursor-pointer"
                                        value={sortOrder}
                                        onChange={handleSortChange}
                                    >
                                        <option value="sales-desc">{t('sortSalesDesc')}</option>
                                        <option value="price-asc">{t('sortPriceAsc')}</option>
                                        <option value="price-desc">{t('sortPriceDesc')}</option>
                                        <option value="name-asc">{t('sortNameAsc')}</option>
                                        <option value="name-desc">{t('sortNameDesc')}</option>
                                    </select>
                                </div>
                            </div>
                            {/* Desktop controls */}
                            <div className="hidden sm:flex flex-col sm:flex-row items-start sm:items-center w-full sm:w-auto gap-2 sm:gap-0">
                                <div className="flex items-center space-x-2">
                                    <label htmlFor="sort-by" className="mr-2 text-gray-600 whitespace-nowrap">{t('sortLabelDesktop')}</label>
                                    <select
                                        id="sort-by"
                                        className="border border-gray-300 w-full text-start rounded p-2 text-gray-600 cursor-pointer"
                                        value={sortOrder}
                                        onChange={handleSortChange}
                                    >
                                        <option value="sales-desc">{t('sortSalesDesc')}</option>
                                        <option value="price-asc">{t('sortPriceAsc')}</option>
                                        <option value="price-desc">{t('sortPriceDesc')}</option>
                                        <option value="name-asc">{t('sortNameAsc')}</option>
                                        <option value="name-desc">{t('sortNameDesc')}</option>
                                    </select>
                                </div>
                            </div>


                            <div className="hidden sm:flex items-center justify-between space-x-4 w-full sm:w-auto mt-2 sm:mt-0">
                                <div className="flex items-center space-x-2">
                                    {/* Grid/List view toggle icons */}
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 ${viewMode === 'grid' ? 'text-black' : 'text-gray-400'} hover:text-black`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 ${viewMode === 'list' ? 'text-black' : 'text-gray-400'} hover:text-black`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                                    </button>
                                </div>
                                {!loading && totalProducts > 0 && (
                                    <span className="text-sm text-gray-500 mr-0 sm:mr-4">
                                        {t('showingProducts', {
                                            from: (currentPage - 1) * productsPerPage + 1,
                                            to: Math.min(currentPage * productsPerPage, totalProducts),
                                            total: totalProducts
                                        })}
                                    </span>
                                )}
                            </div>
                        </div>
                        {/* Loading state */}
                        {loading && (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B0C8]"></div>
                            </div>
                        )}
                        {/* Error state */}
                        {error && (
                            <div className="text-center text-red-500 my-8">
                                <p>{error}</p>
                            </div>
                        )}
                        {/* Product List/Grid Container */}
                        {!loading && !error && (
                            <motion.div
                                layout
                                className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'grid grid-cols-1 lgç:grid-cols-2 gap-6'}`}
                            >
                                <AnimatePresence>
                                    {filteredAndSortedProducts.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            viewMode={viewMode}
                                            onQuickViewClick={handleOpenQuickView}
                                            onOpenBirthListModal={handleOpenBirthListSelectModal}
                                        />
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        )}
                        {/* No results message */}
                        {!loading && !error && filteredAndSortedProducts.length === 0 && (
                            <p className="text-center text-gray-500 mt-8">{t('noProductsForCategory')}</p>
                        )}
                        {/* Pagination controls */}
                        {!loading && !error && totalPages > 1 && (
                            <div className="flex justify-center mt-10">
                                <nav className="flex items-center space-x-1" aria-label="Pagination">
                                    {/* Previous page button */}
                                    <button
                                        onClick={goToPreviousPage}
                                        disabled={currentPage === 1}
                                        className={`px-3 py-2 rounded-md cursor-pointer ${currentPage === 1
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        <span className="sr-only">{t('prevPageAria')}</span>
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    {/* Page numbers */}
                                    {getPageNumbers().map((page, index) => (
                                        <button
                                            key={index}
                                            onClick={() => typeof page === 'number' ? goToPage(page) : null}
                                            disabled={page === '...'}
                                            className={`px-4 py-2 rounded-md cursor-pointer ${page === currentPage
                                                ? 'bg-[#00B0C8] text-white'
                                                : page === '...'
                                                    ? 'text-gray-500'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    {/* Next page button */}
                                    <button
                                        onClick={goToNextPage}
                                        disabled={currentPage === totalPages}
                                        className={`px-3 py-2 rounded-md cursor-pointer ${currentPage === totalPages
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        <span className="sr-only">{t('nextPageAria')}</span>
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </nav>
                            </div>
                        )}
                    </main>
                </div>
            </div>
            {/* Render Quick View Modal */}
            {quickViewProduct && (
                <ProductQuickView
                    product={quickViewProduct}
                    onClose={handleCloseQuickView}
                />
            )}


            {/* Render Birth List Modal with backdrop and scroll lock */}
            {showBirthListModal && (
                <BirthListModalWrapper
                    show={showBirthListModal}
                    onClose={handleCloseBirthListSelectModal}
                    product={birthListProduct}
                    userId={session?.user?.id}
                />
            )}



        </ShopLayout>
    );
}
