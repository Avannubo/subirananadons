'use client';
import Image from "next/image";
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ShopLayout from "@/components/Layouts/shop-layout";
import ProductCard from "@/components/products/product-card";
import { useSearchParams, useRouter } from 'next/navigation';
import ProductQuickView from "@/components/products/product-quick-view";
import { fetchProducts, formatProduct } from '@/services/ProductService';
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
export default function Page() {
    // Birth list modal state
    const [showBirthListModal, setShowBirthListModal] = useState(false);
    const [birthListProduct, setBirthListProduct] = useState(null);
    const { data: session } = useSession ? useSession() : { data: null };
    const locale = useLocale();
    // State and effect for categories (declare FIRST)
    const [categories, setCategories] = useState([]); // tree
    const [categoriesFlat, setCategoriesFlat] = useState([]); // flat
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [categoriesError, setCategoriesError] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [sortOrder, setSortOrder] = useState('sales-desc');
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [categoryPath, setCategoryPath] = useState([{ slug: 'root', label: 'Productes' }]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Pagination removed: always show all products
    const [totalProducts, setTotalProducts] = useState(0);
    const searchParams = useSearchParams();
    const router = useRouter();
    const [bannerUrl, setBannerUrl] = useState(null);
    const currentCategoryLabel = categoryPath[categoryPath.length - 1];
    const t = useTranslations('ProductsPage');
    // Utility function to filter inactive categories and their children
    const filterActiveCategories = (categories) => {
        return categories.filter(category => {
            // If category is explicitly marked as inactive, filter it out
            if (category.isActive === false) return false;
            // If category has children, recursively filter them
            if (category.children && category.children.length > 0) {
                category.children = filterActiveCategories(category.children);
                // If all children were filtered out and category has no other data, filter out the category
                return category.children.length > 0 || category.name;
            }
            return true;
        });
    };
    function findCategoryPathById(categories, id, locale = 'es', path = []) {
        for (const cat of categories) {
            const newPath = [...path, { _id: cat._id, label: getCategoryDisplayName(cat, locale) }];
            if (cat._id === id) return { node: cat, path: newPath };
            if (cat.children) {
                const found = findCategoryPathById(cat.children, id, locale, newPath);
                if (found) return found;
            }
        }
        return null;
    }
    function findCategoryNodeByPath(categories, path, locale = 'es') {
        let node = { children: categories };
        for (const pathItem of path) {
            if (!node.children) return null;
            node = node.children.find(cat => cat._id === pathItem._id);
            if (!node) return null;
        }
        return node;
    }
    // Compute current node and subcategories
    const currentCategoryNode = useMemo(() => findCategoryNodeByPath(categories, categoryPath.slice(1), locale), [categories, categoryPath, locale]);
    const currentSubcategories = currentCategoryNode?.children || [];
    // State for expanded categories in sidebar (array of _id)
    const [expandedCategories, setExpandedCategories] = useState([]);
    // Toggle expand/collapse for a category in sidebar
    const handleSidebarCategoryToggle = (catId) => {
        setExpandedCategories((prev) =>
            prev.includes(catId)
                ? prev.filter((id) => id !== catId)
                : [...prev, catId]
        );
    };
    // Sync breadcrumbs (categoryPath) with current selected category (from URL or UI)
    // Only set categoryPath after categories are loaded
    useEffect(() => {
        if (categoriesLoading) return;
        const categoryId = searchParams.get('category');
        if (categoryId && categories && categories.length > 0) {
            // Support multiple category ids (comma separated)
            const ids = categoryId.split(',');
            // Use the first id for path
            const found = findCategoryPathById(categories, ids[0], locale);
            if (found) {
                setCategoryPath([{ _id: 'root', label: 'Productes' }, ...found.path]);
            } else {
                // If not found, fallback to root
                setCategoryPath([{ _id: 'root', label: 'Productes' }]);
            }
        } else {
            setCategoryPath([{ _id: 'root', label: 'Productes' }]);
        }
    }, [categoriesLoading, categories, searchParams, locale]);
    // //console.log('CATEGORIES', categories)
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
    // Organize categories into a tree (from CategoriesTree.jsx)
    function organizeCategories(allCategories) {
        const categoriesMap = {};
        const rootCategories = [];
        allCategories.forEach(category => {
            // Migrate name if needed: if name is a string, convert to { es, ca }
            let migratedName = category.name;
            if (typeof category.name === 'string') {
                migratedName = { es: category.name, ca: '' };
            } else if (!category.name?.es && category.name?.ca) {
                migratedName = { es: '', ca: category.name.ca };
            } else if (!category.name?.ca && category.name?.es) {
                migratedName = { es: category.name.es, ca: '' };
            } else if (!category.name?.es && !category.name?.ca) {
                migratedName = { es: '', ca: '' };
            }
            categoriesMap[category._id] = {
                ...category,
                name: migratedName,
                children: []
            };
        });
        allCategories.forEach(category => {
            if (category.parent && categoriesMap[category.parent]) {
                categoriesMap[category.parent].children.push(categoriesMap[category._id]);
            } else {
                rootCategories.push(categoriesMap[category._id]);
            }
        });
        return rootCategories;
    }
    // Fetch categories from DB on mount (flat, then organize)
    useEffect(() => {
        async function loadCategories() {
            setCategoriesLoading(true);
            try {
                // Update the API call to specifically request active categories
                const res = await fetch('/api/categories?flat=true&status=active');
                if (!res.ok) throw new Error('Error carregant les categories');
                const cats = await res.json();
                // Filter out inactive categories and their children
                const filterInactiveCategories = (categories) => {
                    return categories.filter(cat => {
                        // Keep only active categories
                        if (cat.isActive === false) return false;
                        return true;
                    });
                };
                const filteredCats = filterInactiveCategories(cats);
                setCategoriesFlat(filteredCats);
                setCategories(organizeCategories(filteredCats));
                setCategoriesError(null);
            } catch (err) {
                // console.error('Error loading categories:', err);
                setCategoriesError('Error carregant les categories');
                setCategories([]);
                setCategoriesFlat([]);
            } finally {
                setCategoriesLoading(false);
            }
        }
        loadCategories();
    }, []);
    // // Fetch products from the database
    useEffect(() => {
        // Only load products after categories, categoryPath, and currentCategoryNode are ready
        if (categoriesLoading || !categoryPath || categoryPath.length === 0 || (categoryPath.length > 1 && !currentCategoryNode)) return;
        async function loadProducts() {
            try {
                setLoading(true);
                // Fetch ALL products for the current category (no pagination)
                const options = {
                    status: 'active'
                };
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
                // Set a very high limit to get all products
                options.limit = 10000;
                const data = await fetchProducts(options);
                if (data && data.products) {
                    const formattedProducts = data.products.map(product => formatProduct(product, locale));
                    setProducts(formattedProducts);
                    setTotalProducts(formattedProducts.length);
                    setError(null);
                } else {
                    setProducts([]);
                    setTotalProducts(0);
                    setError("No s'han trobat productes. Si us plau, torna-ho a intentar més tard.");
                }
            } catch (err) {
                setError("No s'han pogut carregar els productes. Si us plau, torna-ho a intentar més tard.");
                setProducts([]);
                setTotalProducts(0);
            } finally {
                setLoading(false);
            }
        }
        loadProducts();
    }, [categoriesLoading, categoryPath, currentCategoryNode, searchParams, locale]);
    // Pagination removed: no need to reset page
    // Always show all products, sorted alphabetically by name (locale-aware)
    const filteredAndSortedProducts = useMemo(() => {
        if (loading) return [];
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
        sortableProducts.sort((a, b) => getTranslatedName(a).localeCompare(getTranslatedName(b)));
        return sortableProducts;
    }, [products, loading, locale]);
    const handleSortChange = (event) => {
        setSortOrder(event.target.value);
    };
    // Navigate back up using breadcrumbs
    // Breadcrumb click: go to any level, update path and URL
    const handleBreadcrumbClick = (index) => {
        const newPath = categoryPath.slice(0, index + 1);
        setCategoryPath(newPath);
        const params = new URLSearchParams(searchParams);
        if (index === 0) {
            params.delete('category');
        } else {
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
    // Pagination removed
    // Flatten all categories for mobile selector (all leaves, all levels)
    // For mobile: show only unique category names (no path, just the name)
    function flattenCategoriesForMobile(categories, locale = 'es') {
        let flat = [];
        for (const cat of categories) {
            const catLabel = getCategoryDisplayName(cat, locale);
            flat.push({
                label: catLabel,
                value: cat._id,
                path: [{ _id: cat._id, label: catLabel }]
            });
            if (cat.children && cat.children.length > 0) {
                flat = flat.concat(flattenCategoriesForMobile(cat.children, locale));
            }
        }
        // Remove duplicates by label (in case of repeated names)
        const seen = new Set();
        return flat.filter(cat => {
            if (seen.has(cat.label)) return false;
            seen.add(cat.label);
            return true;
        });
    }
    const allCategories = useMemo(() => flattenCategoriesForMobile(categories, locale), [categories, locale]);
    // Handler for mobile dropdown change
    const handleMobileCategoryChange = (e) => {
        const selectedId = e.target.value;
        // Find the selected option in allCategories
        const selectedOption = allCategories.find(cat => cat.value === selectedId);
        if (selectedOption) {
            // Always update breadcrumbs to full path from root to selected
            setCategoryPath(selectedOption.path);
            // Update URL params
            const params = new URLSearchParams(searchParams);
            if (selectedId === 'root') {
                params.delete('category');
            } else {
                params.set('category', selectedId);
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
                        className="object-cover"
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
            <div className="container w-full max-w-[1500px] bg-white px-1 sm:px-4 py-2 sm:py-2 rounded-t-2xl sm:mt-0 ">
                <nav aria-label="Breadcrumb" className="hidden lg:flex mb-4 pb-2 pl-2 overflow-x-auto border-b border-[#36A9E1]">
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
                            className="w-full border border-gray-300 text-gray-700 rounded-lg p-2 bg-white shadow-sm focus:ring-2 focus:ring-[#36A9E1] focus:border-[#36A9E1] transition"
                            value={categoryPath[categoryPath.length - 1]?._id || 'root'}
                            onChange={handleMobileCategoryChange}
                        >
                            {allCategories.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>
                    <aside className="hidden lg:flex w-full lg:w-1/4 xl:w-1/5 flex-shrink-0 mb-6 lg:mb-0">
                        {/* Category selector: show current subcategories, or siblings if no subcategories */}
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
                                                            ? 'text-[#36A9E1] font-semibold bg-gray-100'
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
                                        className={`p-2 ${viewMode === 'grid' ? 'text-black' : 'text-gray-400'} hover:text-black cursor-pointer`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 ${viewMode === 'list' ? 'text-black' : 'text-gray-400'} hover:text-black cursor-pointer`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                                    </button>
                                </div>
                            </div>
                            <div className="hidden sm:flex items-center justify-between space-x-4 w-full sm:w-auto mt-2 sm:mt-0">
                                <div className="flex items-center space-x-2">
                                    {/* Grid/List view toggle icons */}
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 ${viewMode === 'grid' ? 'text-black' : 'text-gray-400'} hover:text-black cursor-pointer`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 ${viewMode === 'list' ? 'text-black' : 'text-gray-400'} hover:text-black cursor-pointer`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                                    </button>
                                </div>
                                {!loading && totalProducts > 0 && (
                                    <span className="text-sm text-gray-500 mr-0 sm:mr-4">
                                        {t('showingProducts', {
                                            from: 1,
                                            to: totalProducts,
                                            total: totalProducts
                                        })}
                                    </span>
                                )}
                            </div>
                        </div>
                        {/* Loading state */}
                        {loading && (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#36A9E1]"></div>
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
                        {/* Pagination controls removed */}
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