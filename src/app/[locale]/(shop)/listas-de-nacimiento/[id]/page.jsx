'use client';
import { useState, useEffect } from 'react';
import { use } from 'react';
import ShopLayout from "@/components/Layouts/shop-layout";
import Link from "next/link";
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext.jsx';
import { useTranslations } from 'next-intl';
export default function BirthListPage({ params }) {
    const { locale, id } = use(params);
    const t = useTranslations('BirthListDetailPage');
    // Safe translation helper: returns fallback when a message key is missing for current locale
    const safeT = (key, opts = {}, fallback = null) => {
        try {
            return t(key, opts);
        } catch (err) {
            // Missing message for locale -> return fallback or key
            return fallback !== null ? fallback : key;
        }
    };
    const [selectedCategory, setSelectedCategory] = useState("Todos");
    const [sortBy, setSortBy] = useState("default");
    const [list, setList] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [availableCategories, setAvailableCategories] = useState(["Todos"]);
    const router = useRouter();
    const { addToCart } = useCart();
    // Remove or simplify unused states related to the modal
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [hoveredId, setHoveredId] = useState(null);    // Calculate progress percentage based on item states (2=purchased, 1=reserved, 0=available)
    const calculateProgress = (items) => {
        if (!items || items.length === 0) return 0;
        const purchasedCount = items.filter(item => item.state === 2).length;
        const totalItems = items.length;
        return totalItems > 0 ? Math.round((purchasedCount / totalItems) * 100) : 0;
    };
    // locale is now destructured from use(params) above
    // Fetch birth list data from API
    useEffect(() => {
        const fetchBirthList = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`/api/birthlists/${id}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch birth list: ${response.status}`);
                }
                const data = await response.json();
                if (!data.success) {
                    throw new Error(data.message || 'Failed to fetch birth list data');
                }
                // Format the data for display
                const birthListData = data.data || {};
                // Ensure items is always an array to avoid .map on null
                const items = Array.isArray(birthListData.items) ? birthListData.items : [];
                const progress = calculateProgress(items);
                setList({
                    id: birthListData._id ?? birthListData.id ?? null,
                    userId: birthListData.user?._id ?? birthListData.userId ?? null,
                    babyName: birthListData.babyName ?? '',
                    parents: birthListData.user?.name ?? t('anonymous'),
                    dueDate: birthListData.dueDate ?? null,
                    title: birthListData.title ?? '',
                    description: birthListData.description ?? '',
                    image: birthListData.image ?? null,
                    status: birthListData.status ?? null,
                    isPublic: birthListData.isPublic ?? false,
                    progress: progress,
                    message: birthListData.description || t('defaultThankYou'),
                    products: items.map(item => {
                        // Defensive mapping: some items may have missing product objects
                        const snapshot = item?.productSnapshot || {};
                        const prod = item?.product || null;

                        const getNameFrom = (src) => {
                            if (!src) return null;
                            if (typeof src === 'object') return src[locale] || src.es || src.ca || src.name || null;
                            if (typeof src === 'string') return src;
                            return null;
                        };

                        // Normalize name to always be a string for safe rendering and alt text
                        const nameRaw = getNameFrom(snapshot.name) || getNameFrom(prod?.name) || 'N/D';
                        const name = typeof nameRaw === 'string' ? nameRaw : String(nameRaw);
                        const priceValue = Number(snapshot.price ?? prod?.price_incl_tax ?? prod?.price ?? 0) || 0;
                        const priceStr = `${priceValue.toFixed(2).replace('.', ',')} €`;
                        const category = snapshot.category ?? prod?.category ?? null;
                        const brand = snapshot.brand ?? prod?.brand ?? '';
                        const reference = snapshot.reference ?? prod?.reference ?? '';
                        const image = snapshot.image ?? prod?.image ?? '/assets/images/Screenshot_4.png';
                        const imageHover = snapshot.imageHover ?? prod?.imageHover ?? '';
                        const discount = snapshot.discount ?? prod?.discount ?? null;

                        return {
                            id: item?._id ?? null,
                            productId: prod?._id ?? snapshot.product ?? null,
                            name,
                            price: priceStr,
                            priceValue,
                            discount,
                            image,
                            imageHover,
                            category,
                            brand,
                            reference,
                            status: item?.state === 2 ? 'purchased' : item?.state === 1 ? 'reserved' : 'available',
                            state: item?.state || 0,
                            priority: item?.priority || 0
                        };
                    })
                });
                // Extract unique categories from products (defensive)
                const uniqueCategoryIds = [];
                birthListData.items.forEach(item => {
                    const catId = (item.productSnapshot && item.productSnapshot.category) || (item.product && item.product.category) || null;
                    if (catId && !uniqueCategoryIds.includes(catId)) {
                        uniqueCategoryIds.push(catId);
                    }
                });
                // Fetch category objects from API
                let categoriesObjs = [];
                if (uniqueCategoryIds.length > 0) {
                    try {
                        const res = await fetch(`/api/categories?ids=${uniqueCategoryIds.join(',')}`);
                        if (res.ok) {
                            const body = await res.json().catch(() => null);
                            // Expecting an array or { data: [...] }
                            if (Array.isArray(body)) categoriesObjs = body;
                            else if (body && Array.isArray(body.data)) categoriesObjs = body.data;
                            else categoriesObjs = [];
                        } else {
                            console.error('Failed to fetch category objects');
                        }
                    } catch (err) {
                        console.error('Error fetching category objects:', err);
                    }
                }
                // Always include 'Todos' as the first option
                const availableCats = ['Todos', ...categoriesObjs];
                setAvailableCategories(availableCats);
            } catch (error) {
                console.error('Error fetching birth list:', error);
                setError(error.message || 'Error al cargar la lista de nacimiento');
                toast.error('Error al cargar la lista de nacimiento');
            } finally {
                setLoading(false);
            }
        };
        fetchBirthList();
    }, [id]);
    // Loading state
    if (loading) {
        return (
            <ShopLayout>
                <div className="relative w-full h-[35vh] bg-gray-100 animate-pulse">
                    <div className="absolute inset-0 mt-20">
                        <div className="container mx-auto h-full flex flex-col items-center justify-center px-4">
                            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-56"></div>
                        </div>
                    </div>
                </div>
                <div className="container mx-auto px-4 py-8">
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8 animate-pulse">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                            <div className="w-full md:w-2/3 mb-4 md:mb-0">
                                <div className="flex justify-between mb-2">
                                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2"></div>
                            </div>
                            <div className="h-10 bg-gray-200 rounded-full w-40"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {[...Array(10)].map((_, index) => (
                            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
                                <div className="relative aspect-square bg-gray-200"></div>
                                <div className="p-4">
                                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                                    <div className="h-10 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </ShopLayout>
        );
    }
    // Error state
    if (error) {
        return (
            <ShopLayout>
                <div className="container mx-auto px-4 py-36">
                    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
                        <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">{safeT('errorLoadListTitle', {}, 'Error al cargar')}</h3>
                        <p className="text-gray-500 mb-6">{safeT('errorLoadListDesc', { error }, `Error: ${error || ''}` || "Error al cargar la lista de nacimiento")}</p>
                        <Link href="/listas-de-nacimiento" className="px-4 py-2 bg-[#36A9E1] text-white rounded-md hover:bg-[#008da0] transition-colors cursor-pointer">
                            {t('backToListsBtn')}
                        </Link>
                    </div>
                </div>
            </ShopLayout>
        );
    }
    if (!list || list.status === 'InActiva') {
        return (
            <ShopLayout>
                <div className="container mx-auto px-4 py-36">
                    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            {!list ? t('listNotFoundTitle') : t('listInactiveTitle')}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {!list ? t('listNotFoundDesc') : t('listInactiveDesc')}
                        </p>
                        <Link href="/listas-de-nacimiento" className="px-4 py-2 bg-[#36A9E1] text-white rounded-md hover:bg-[#008da0] transition-colors cursor-pointer">
                            {t('backToListsBtn')}
                        </Link>
                    </div>
                </div>
            </ShopLayout>
        );
    }
    // Show a different message for completed lists
    if (list.status === 'Completada') {
        return (
            <ShopLayout>
                <div className="container mx-auto px-4 py-36">
                    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
                        <svg className="w-16 h-16 mx-auto text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('listCompletedTitle')}</h3>
                        <p className="text-gray-500 mb-6">{t('listCompletedDesc')}</p>
                        <Link href="/listas-de-nacimiento" className="px-4 py-2 bg-[#36A9E1] text-white rounded-md hover:bg-[#008da0] transition-colors cursor-pointer">
                            {t('backToListsBtn')}
                        </Link>
                    </div>
                </div>
            </ShopLayout>
        );
    }
    const filteredProducts = (list?.products || [])
        .filter(product => selectedCategory === "Todos" || product.category === selectedCategory)
        .sort((a, b) => {
            switch (sortBy) {
                case "price-asc":
                    return a.priceValue - b.priceValue;
                case "price-desc":
                    return b.priceValue - a.priceValue;
                case "name":
                    // Ensure name is string before comparing
                    return String(a.name || '').localeCompare(String(b.name || ''));
                default:
                    return 0;
            }
        });
    const handleReserveClick = async (product) => {
        try {
            // Validate required gift information
            if (!list.userId) {
                console.error('Missing list owner ID');
                // toast.error('Error: No se puede identificar el propietario de la lista');
                return;
            }
            // Format product for unified cart structure 
            const productForCart = {
                id: product.productId,
                name: product.name,
                price: product.discount?.active ? product.discount.finalPrice : product.priceValue,
                image: product.image,
                brand: product.brand || '',
                category: product.category || '',
                type: 'gift',
                listInfo: {
                    listId: id,
                    itemId: product.id,
                    babyName: list.babyName,
                    listOwnerId: list.userId,
                    status: 'reserved',
                    state: 1, // 1 = reserved
                    addedAt: new Date().toISOString(),
                    price: product.priceValue,
                    priority: product.priority || 0
                }
            };
            const success = await addToCart(productForCart, 1); if (success) {
                //console.log('Regalo añadido al carrito');
            } else {
                //console.log('No se pudo añadir el regalo al carrito');
            }
        } catch (error) {
            console.error('Error adding gift to cart:', error);
            toast.error(error.message || 'Error al añadir el regalo al carrito');
        }
    };
    const handleShareClick = async () => {
        const listUrl = window.location.href;
        try {
            await navigator.clipboard.writeText(listUrl);
            toast.success('¡URL copiada al portapapeles!');
        } catch (err) {
            console.error('Failed to copy URL:', err);
            toast.error('Error al copiar la URL');
        }
    };
    return (
        <ShopLayout>
            {/* Hero Section */}
            <div className="relative w-full h-[35vh] bg-gray-50">
                <div className="absolute inset-0 mt-20 font-medium">
                    <div className="container mx-auto h-full flex flex-col items-center justify-center px-4 text-center">
                        <motion.h1
                            className="text-4xl font-bold text-zinc-900 mb-4"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                        >
                            {safeT('listTitle', { babyName: list?.babyName }, `Lista de ${list?.babyName || ''}`)}
                        </motion.h1>
                        <motion.p
                            className="text-lg text-zinc-900 mb-2"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            {list?.parents}
                        </motion.p>
                        <motion.p
                            className="text-zinc-900 "
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {t('dueDateLabel')} {list && new Date(list.dueDate).toLocaleDateString('es-ES')}
                        </motion.p>
                        <motion.div
                            className="text-zinc-900 "
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h4 className="text-gray-600 text-center italic mt-4 text-xl">{list.message}</h4>
                        </motion.div>
                    </div>
                </div>
            </div>
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                        <div className="w-full md:w-2/3 mb-4 md:mb-0">                <div className="flex justify-between mb-2">
                            <span className="text-gray-600">{t('giftsPurchasedLabel')}</span>
                            <span className="font-medium">{list.progress}%</span>
                        </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-[#36A9E1] h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${list.progress}%` }}
                                    title={t('giftsPurchasedTitle', { percent: list.progress })}
                                />
                            </div>
                        </div>
                        <div className="flex space-x-4 relative">
                            <button
                                onClick={handleShareClick}
                                className="cursor-pointer px-4 py-2 bg-[#36A9E1] text-white rounded-full hover:bg-[#3f93ba] transition-colors flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                                </svg>
                                {t('shareListBtn')}
                            </button>
                        </div>
                    </div>
                </div>
                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <motion.div
                                key={product.id}
                                className="bg-white rounded-lg overflow-hidden shadow-sm flex flex-col h-full group"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -3 }}
                                onMouseEnter={() => setHoveredId(product.id)}
                                onMouseLeave={() => setHoveredId(null)}
                            >
                                <div className="relative w-full overflow-hidden h-[200px] " style={{ aspectRatio: '1/0.8' }}>
                                    {product.imageHover ? (
                                        <>
                                            <img
                                                src={product.image}
                                                alt={typeof product.name === 'string' ? product.name : (product.name?.[locale] || product.name?.es || product.name?.ca || 'Producto')}
                                                className="object-contain h-[200px] w-full bg-white transition-opacity duration-300"
                                                style={{ opacity: hoveredId === product.id ? 0 : 1 }}
                                            />
                                            <img
                                                src={product.imageHover}
                                                alt={typeof product.name === 'string' ? `${product.name} - hover` : ((product.name?.[locale] || product.name?.es || product.name?.ca || 'Producto') + ' - hover')}
                                                className="object-contain h-[200px] w-full bg-white absolute inset-0 transition-opacity duration-300"
                                                style={{ opacity: hoveredId === product.id ? 1 : 0 }}
                                            />
                                        </>
                                    ) : (
                                        <img
                                            src={product.image}
                                            alt={typeof product.name === 'string' ? product.name : (product.name?.[locale] || product.name?.es || product.name?.ca || 'Producto')}
                                            className="object-contain h-[200px] w-full bg-white"
                                        />
                                    )}
                                    {product.status !== 'available' && (
                                        <div className="absolute inset-0 bg-black/60 h-[200px] backdrop-blur-[2px] flex items-center justify-center transition-all duration-300">
                                            <div className=" px-4 py-2 rounded-lg">
                                                <span className="text-white text-lg font-medium uppercase tracking-wider">
                                                    {product.status === 'purchased' ? t('productPurchased') : t('productReserved')}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 flex flex-col flex-grow justify-between">
                                    <div>
                                        <h3 className="text-sm font-medium mb-1 h-10 line-clamp-2">
                                            {product.name && typeof product.name === 'object'
                                                ? (product.name[locale] || product.name.es || product.name.ca || product.name.name || 'N/D')
                                                : product.name}
                                        </h3>
                                        <div className="flex flex-col items-start mb-2">
                                            {product.discount?.active ? (
                                                <>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-400 line-through">
                                                            {product.priceValue.toFixed(2)}€
                                                        </span>
                                                        <span className="px-1.5 py-0.5 text-xs font-medium text-red-700 bg-red-100 rounded-sm">
                                                            -{product.discount.value}%
                                                        </span>
                                                    </div>
                                                    <span className="text-sm font-semibold text-[#36A9E1]">
                                                        {product.discount.finalPrice?.toFixed(2)}€
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-sm text-gray-600">{product.price}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        {product.status === 'available' ? (
                                            <button
                                                onClick={() => handleReserveClick(product)}
                                                className="cursor-pointer w-full bg-[#36A9E1] text-white py-1.5 text-sm rounded-md hover:bg-[#3f93ba] transition-colors"
                                            >
                                                {t('addToCartBtn')}
                                            </button>
                                        ) : (
                                            <div className="text-center py-1.5 bg-gray-100 rounded-md">
                                                <span className="text-sm text-gray-600">
                                                    {product.status === 'purchased' ? t('productPurchased') : t('productReserved')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <p className="text-gray-500">{t('noProductsFound')}</p>
                        </div>
                    )}
                </div>
            </div>
        </ShopLayout>
    );
}