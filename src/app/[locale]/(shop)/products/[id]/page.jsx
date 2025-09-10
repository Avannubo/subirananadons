'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import ShopLayout from "@/components/Layouts/shop-layout";
import { motion, AnimatePresence } from 'framer-motion';
import ProductSlider from '@/components/landing/ProductSlider';
import FullscreenImagePreview from '@/components/products/FullscreenImagePreview';
import { useCart } from '@/contexts/CartContext.jsx';
import { toast } from 'react-hot-toast';
import { useRouter } from "next/navigation";
import { useSession } from 'next-auth/react';
import { fetchProductById, fetchProducts, formatProduct } from '@/services/ProductService';
import BirthListSelectModal from '@/components/products/BirthListSelectModal.jsx';
// Helper to get display name from category (handles translation and legacy)
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
// Helper to find the full path from root to a category
function findCategoryPath(categories, targetId, locale = 'es', path = []) {
    for (const cat of categories) {
        const newPath = [...path, cat];
        if (cat._id === targetId) return newPath;
        if (cat.children && cat.children.length > 0) {
            const found = findCategoryPath(cat.children, targetId, locale, newPath);
            if (found) return found;
        }
    }
    return null;
}
export default function Page() {
    const router = useRouter();
    const t = useTranslations('ProductPage');
    const params = useParams();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [categories, setCategories] = useState([]); // for breadcrumb path
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('DETALLES DEL PRODUCTO');
    const [showFullscreen, setShowFullscreen] = useState(false);
    const { addToCart } = useCart();
    const [dragConstraints, setDragConstraints] = useState({ right: 0, left: 0 });
    const scrollContainerRef = useRef(null);
    // Get current locale from params
    const locale = useLocale();
    const [isAddingToList, setIsAddingToList] = useState(false);
    const [showBirthListModal, setShowBirthListModal] = useState(false);
    const { data: session } = useSession();
    const onAddToWishlist = async () => {
        if (!session) {
            toast.error('Inicia sesión para añadir productos a las listas', { duration: 3000 });
            return;
        }
        setShowBirthListModal(true);
    };
    // Update drag constraints when container is available or product images change
    useEffect(() => {
        if (scrollContainerRef.current && product?.images?.length > 0) {
            const containerWidth = scrollContainerRef.current.clientWidth;
            const totalContentWidth = product.images.length * 180 + (product.images.length - 1) * 16; // width + gap
            const leftConstraint = Math.min(0, containerWidth - totalContentWidth);
            setDragConstraints({ right: 0, left: leftConstraint });
        }
    }, [product?.images?.length, scrollContainerRef.current]);
    // Custom scroll handler for thumbnail navigation
    const scrollThumbnails = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 200; // pixels to scroll
            const newScrollPosition = scrollContainerRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
            scrollContainerRef.current.scrollLeft = newScrollPosition;
        }
    };
    // Get product ID from the URL
    // URLs are in the format: /products/category-slug/product-slug
    // We need to find the product by its slug
    useEffect(() => {
        async function loadProduct() {
            try {
                setLoading(true);
                const productId = params?.id;
                if (!productId) {
                    throw new Error('Invalid product URL');
                }
                const productById = await fetchProductById(productId);
                // Ensure images array is always present
                let images = [];
                if (Array.isArray(productById.images) && productById.images.length > 0) {
                    images = productById.images;
                } else {
                    // Fallback to main image and additionalImages
                    if (productById.image) images.push(productById.image);
                    if (Array.isArray(productById.additionalImages)) {
                        images = images.concat(productById.additionalImages.filter(Boolean));
                    }
                    // Fallback to imageHover if available
                    if (productById.imageHover) images.push(productById.imageHover);
                }
                // Patch product object to always have images array
                setProduct({
                    ...productById,
                    images,
                });
                if (!productById) {
                    throw new Error('Product not found');
                }
                // Get category ID for API call
                let categoryId = productById.category;
                if (typeof categoryId === 'object' && categoryId !== null) {
                    // If category is a MongoDB object, get its $oid or _id
                    categoryId = categoryId.$oid || categoryId._id || '';
                }
                const relatedResponse = await fetchProducts({
                    category: categoryId,
                    limit: 8,
                    status: 'active'
                });
                // Format related products and filter out the current product
                const formattedRelated = relatedResponse.products
                    .filter(item => item._id !== productById._id)
                    .map(formatProduct)
                    .slice(0, 8); // Limit to 8 related products
                setRelatedProducts(formattedRelated);
                setError(null);
            } catch (err) {
                console.error('Error loading product:', err);
                setError('Failed to load product. Please try again later.');
                setProduct(null);
                setRelatedProducts([]);
            } finally {
                setLoading(false);
            }
        }
        loadProduct();
    }, [params]);
    // Fetch all categories for breadcrumb path
    useEffect(() => {
        async function loadCategories() {
            try {
                const res = await fetch('/api/categories?flat=true');
                if (!res.ok) throw new Error('Error loading categories');
                const cats = await res.json();
                // Organize categories into a tree
                const categoriesMap = {};
                const rootCategories = [];
                cats.forEach(category => {
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
                cats.forEach(category => {
                    if (category.parent && categoriesMap[category.parent]) {
                        categoriesMap[category.parent].children.push(categoriesMap[category._id]);
                    } else {
                        rootCategories.push(categoriesMap[category._id]);
                    }
                });
                setCategories(rootCategories);
            } catch (err) {
                setCategories([]);
            }
        }
        loadCategories();
    }, []);
    const handleQuantityChange = (change) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1) {
            setQuantity(newQuantity);
        }
    };
    const handleAddToCart = async () => {
        if (!product) return;
        try {
            const isDiscountActive = () => {
                if (!product.discount?.active) return false;
                const now = new Date();
                const startDate = product.discount.startDate ? new Date(product.discount.startDate) : null;
                const endDate = product.discount.endDate ? new Date(product.discount.endDate) : null;
                if (!startDate && !endDate) return true;
                if (startDate && !endDate) return now >= startDate;
                if (!startDate && endDate) return now <= endDate;
                return now >= startDate && now <= endDate;
            };
            // Create a product object with the correct price structure
            const productToAdd = {
                ...product,
                price: `${product.price_incl_tax?.toFixed(2).replace('.', ',')} €`,  // Formatted price string
                priceValue: product.price_incl_tax,  // Numerical value for calculations
                finalPrice: (product.discount?.active && isDiscountActive()) ? product.discount.finalPrice : product.price_incl_tax
            };
            await addToCart(productToAdd, quantity);
            // toast.success(`${quantity} ${product.name} ${t(addedToCart)} `);//añadido al carrito
        } catch (error) {
            toast.error('Error al añadir al carrito');
            console.error('Error adding to cart:', error);
        }
    };
    // Compute category path for breadcrumb (move useMemo out of render)
    let categoryId = product && product.category;
    if (typeof categoryId === 'object' && categoryId !== null) {
        categoryId = categoryId.$oid || categoryId._id || '';
    }
    const categoryPath = useMemo(() => findCategoryPath(categories, categoryId, locale), [categories, categoryId, locale]);
    // Loading state
    if (loading) {
        return (
            <ShopLayout>
                <div className="container mx-auto px-4 py-8 mt-22">
                    {/* Skeleton Breadcrumb */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-2">
                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Skeleton Product Image */}
                        <div className="space-y-4">
                            <div className="relative w-full h-[600px] rounded-lg bg-gray-200 animate-pulse"></div>
                            {/* Skeleton Thumbnails */}
                            <div className="flex space-x-4 overflow-hidden">
                                {[...Array(4)].map((_, index) => (
                                    <div key={index} className="w-[180px] h-44 bg-gray-200 rounded-md animate-pulse"></div>
                                ))}
                            </div>
                        </div>
                        {/* Skeleton Product Info */}
                        <div className="space-y-6">
                            <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-7 w-32 bg-gray-200 rounded animate-pulse"></div>
                            <div className="space-y-4">
                                <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                                <div className="py-4 space-y-3">
                                    <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
                                    {[...Array(4)].map((_, index) => (
                                        <div key={index} className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                                    ))}
                                </div>
                                {/* Skeleton Quantity Selector */}
                                <div className="flex items-center space-x-4">
                                    <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                                {/* Skeleton Buttons */}
                                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                    {/* Skeleton Tabs */}
                    <div className="mt-16">
                        <div className="border-b border-gray-200">
                            <div className="flex space-x-8">
                                <div className="h-6 w-28 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-6 w-28 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                        <div className="mt-6 pb-16 border-b border-gray-200">
                            <div className="space-y-2">
                                {[...Array(3)].map((_, index) => (
                                    <div key={index} className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Skeleton Related Products */}
                    <div className="mt-16">
                        <div className="h-8 w-44 bg-gray-200 rounded animate-pulse mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, index) => (
                                <div key={index} className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </ShopLayout>
        );
    }
    // Error state
    if (error || !product) {
        return (
            <ShopLayout>
                <div className="container mx-auto px-4 py-8 mt-22">
                    <div className="text-center py-16">
                        <h2 className="text-2xl text-red-500 mb-4">{t('errorTitle')}</h2>
                        <p className="text-gray-600">{error || t('errorNotFound')}</p>
                        <a href="/products" className="mt-6 inline-block bg-[#36A9E1] text-white py-2 px-6 rounded-md hover:bg-[#3f93ba]">
                            {t('backToShop')}
                        </a>
                    </div>
                </div>
            </ShopLayout>
        );
    }
    return (
        <ShopLayout>
            <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8 mt-20">
                {/* Breadcrumb */}
                <nav className="mb-6   sm:mb-8 overflow-x-auto mt-10 border-b border-[#36A9E1]">
                    <ol className="hidden pl-2 md:flex items-center space-x-2 text-xs sm:text-sm text-gray-500 min-w-[200px]">
                        <li><a href="/products" className="hover:text-gray-700">{t('breadcrumbProducts')}</a></li>
                        {/* Render full category path if possible */}
                        {categoryPath && categoryPath.length > 0 && categoryPath.map((cat) => [
                            <li key={cat._id}><span className="mx-2"><svg className="w-3 h-3 mx-1 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg></span></li>,
                            <li key={cat._id + '-cat'}>
                                <a href={`/products?category=${cat._id}`} className="hover:text-gray-700 whitespace-nowrap">{getCategoryDisplayName(cat, locale)}</a>
                            </li>
                        ])}
                        <li><span className="mx-2"> <svg className="w-3 h-3 mx-1 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg></span></li>
                        <li className="text-gray-600 font-bold whitespace-nowrap">{typeof product.name === 'object' ? product.name[locale] : product.name}</li>
                    </ol>
                </nav>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {/* Product Images */}
                    <div className="space-y-4">
                        <motion.div
                            className="relative w-full h-[320px] xs:h-[400px] sm:h-[500px] md:h-[600px] overflow-hidden rounded-lg bg-white cursor-pointer"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => setShowFullscreen(true)}
                        >
                            <img
                                src={product.images && product.images[selectedImage] ? product.images[selectedImage] : product.image}
                                alt={typeof product.name === 'object' ? product.name[locale] : product.name}
                                className="object-contain h-full w-full"
                            />
                            {/* Mobile fullscreen indicator */}
                            <div className="md:hidden absolute bottom-2 right-2 bg-black/50 text-white rounded-full p-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                                </svg>
                            </div>
                        </motion.div>
                        {/* Fullscreen Preview Modal */}
                        <AnimatePresence>
                            {showFullscreen && (
                                <FullscreenImagePreview
                                    images={product.images}
                                    initialIndex={selectedImage}
                                    onClose={() => setShowFullscreen(false)}
                                />
                            )}
                        </AnimatePresence>
                        {/* Thumbnails */}
                        {product.images.length > 1 && (
                            <div className="space-y-2">
                                <div className="relative">
                                    <div
                                        ref={scrollContainerRef}
                                        className="overflow-x-auto scrollbar-hide"
                                        style={{
                                            scrollbarWidth: 'none',
                                            msOverflowStyle: 'none',
                                            WebkitOverflowScrolling: 'touch',
                                            scrollBehavior: 'smooth'
                                        }}
                                    >
                                        <motion.div
                                            className="inline-flex space-x-2 sm:space-x-4 py-2 px-1 cursor-grab active:cursor-grabbing"
                                            drag="x"
                                            dragConstraints={dragConstraints}
                                            whileTap={{ cursor: "grabbing" }}
                                            dragElastic={0.1}
                                        >
                                            {product.images.map((image, index) => (
                                                <div
                                                    key={index}
                                                    className={`relative border border-gray-200 rounded-md overflow-hidden \
                                                        ${selectedImage === index ? 'ring-2 ring-[#36A9E1]' : 'ring-1 ring-gray-200'}\
                                                        w-[90px] xs:w-[120px] sm:w-[140px] md:w-[180px] flex-shrink-0`}
                                                >
                                                    <div
                                                        className="relative h-20 xs:h-28 sm:h-32 md:h-44 cursor-pointer"
                                                        onClick={() => setSelectedImage(index)}
                                                    >
                                                        <img
                                                            src={image}
                                                            alt={`${product.name} ${index + 1}`}
                                                            className="object-contain"
                                                            draggable={false}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Product Info */}
                    <div className="space-y-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">{typeof product.name === 'object' ? product.name[locale] : product.name}</h1>
                        {/* Price and Discount Section */}
                        <div className="flex flex-col gap-2">
                            {product.discount?.active && (() => {
                                const now = new Date();
                                const startDate = product.discount.startDate ? new Date(product.discount.startDate) : null;
                                const endDate = product.discount.endDate ? new Date(product.discount.endDate) : null;
                                // If no dates are set, discount is always active
                                if (!startDate && !endDate) return true;
                                // If only start date is set, check if current date is after start
                                if (startDate && !endDate) return now >= startDate;
                                // If only end date is set, check if current date is before end
                                if (!startDate && endDate) return now <= endDate;
                                // If both dates are set, check if current date is within range
                                return now >= startDate && now <= endDate;
                            })() ? (
                                <>
                                    <div className="flex items-center gap-4">
                                        <p className="text-2xl sm:text-3xl font-bold text-red-600">
                                            {typeof product.discount.finalPrice === 'number'
                                                ? product.discount.finalPrice.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
                                                : product.discount.finalPrice + ' €'}
                                        </p>
                                        <p className="text-lg sm:text-xl text-gray-400 line-through">
                                            {typeof product.price_incl_tax === 'number'
                                                ? product.price_incl_tax.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
                                                : product.price_incl_tax}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                            {product.discount.type === 'percentage'
                                                ? `-${product.discount.value}%`
                                                : `-${product.discount.value}€`}
                                        </span>
                                        {product.discount.endDate && (
                                            <span className="text-sm text-gray-500">
                                                {t('validUntil')} {new Date(product.discount.endDate).toLocaleDateString(locale)}
                                            </span>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                                    {typeof product.price_incl_tax === 'number'
                                        ? product.price_incl_tax.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
                                        : product.price_incl_tax}
                                </p>
                            )}
                        </div>
                        <div className="space-y-4">
                            {/* Only show the first two plain lines of the description, remove the rest */}
                            {(() => {
                                let desc = typeof product.description === 'object' ? product.description[locale] : product.description;
                                if (!desc) return null;
                                // Split by line breaks or bullet points, keep only first 2 non-empty lines
                                const lines = desc
                                    .split(/\n|•|\u2022|\r/)
                                    .map(line => line.trim())
                                    .filter(Boolean)
                                    .slice(0, 1);
                                return lines.map((line, idx) => (
                                    <p key={idx} className="text-gray-600 break-words">{line}</p>
                                ));
                            })()}
                            {/* Quantity Selector */}
                            <div className="flex flex-wrap items-center space-x-2 ">
                                <span className="text-gray-700">{t('quantity')}:</span>
                                <div className="flex items-center border border-gray-300 rounded-md mt-2 sm:mt-0">
                                    <button
                                        onClick={() => handleQuantityChange(-1)}
                                        className="cursor-pointer px-3 py-1 text-gray-600"
                                    >
                                        -
                                    </button>
                                    <span className="px-4 py-1 border-x border-gray-300">{quantity}</span>
                                    <button
                                        onClick={() => handleQuantityChange(1)}
                                        className="cursor-pointer px-3 py-1 text-gray-600 "
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            {/* Add to Cart Button */}
                            <button
                                onClick={handleAddToCart}
                                className="cursor-pointer w-full bg-[#36A9E1] text-white py-3 px-6 rounded-md hover:bg-[#3f93ba] transition-colors duration-200 mt-2"
                            >
                                {t('addToCart')}
                            </button>
                            {/* Wishlist Button */}
                            <button onClick={onAddToWishlist} className="cursor-pointer w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center mt-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                {t('addToWishlist')}
                            </button>
                            {/* Birth List Modal */}
                            {showBirthListModal && (
                                <BirthListSelectModal
                                    show={showBirthListModal}
                                    onClose={() => setShowBirthListModal(false)}
                                    product={product}
                                    userId={session?.user?.id}
                                />
                            )}
                        </div>
                    </div>
                </div>
                {/* Product Details Tabs */}
                <div className="mt-10 sm:mt-16">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px  flex flex-wrap space-x-4 sm:space-x-8 overflow-x-auto">
                            {[t('tabDetails')].map((tab, idx) => (//t('tabDescription'), 
                                <div
                                    key={tab}
                                    // onClick={() => setActiveTab(idx === 0 ? 'DETALLES DEL PRODUCTO' : 'DETALLES DEL PRODUCTO')}
                                    className={`pb-4 px-1 select-none text-xs sm:text-sm font-medium ${activeTab === (idx === 0 ? 'DETALLES DEL PRODUCTO' : 'DETALLES DEL PRODUCTO')
                                        ? 'border-b-2 border-[#36A9E1] text-[#36A9E1]'
                                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {tab}
                                </div>
                            ))}
                        </nav>
                    </div>
                    <div className="mt-4 sm:mt-6 pb-10 sm:pb-16 border-b border-gray-200">
                        <div className="prose max-w-none">
                            {(() => {
                                let desc = typeof product.description === 'object' ? product.description[locale] : product.description;
                                if (!desc) return null;
                                // Find the first bullet (• or -) and split
                                // Only split on hyphens surrounded by spaces or bullet (•)
                                const bulletRegex = /\s-\s|\s-|-\s|\s-|\u2022/;
                                const firstBulletIdx = desc.search(bulletRegex);
                                let intro = desc;
                                let bullets = [];
                                if (firstBulletIdx !== -1) {
                                    intro = desc.slice(0, firstBulletIdx).trim();
                                    bullets = desc.slice(firstBulletIdx)
                                        .split(/\s-\s|\s-|-\s|\s-|\u2022/)
                                        .map(line => line.trim())
                                        .filter(Boolean);
                                }
                                return <>
                                    {intro && <p className="text-gray-600 break-words">{intro}</p>}
                                    {bullets.length > 0 && (
                                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                                            {bullets.map((line, idx) => <li key={idx}>{line}</li>)}
                                        </ul>
                                    )}
                                </>;
                            })()}
                        </div>
                    </div>
                </div>
                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-10 sm:mt-16">
                        <ProductSlider
                            title={t('relatedProducts')}
                            products={relatedProducts}
                            className="w-full"
                            slidesPerView={{
                                mobile: 1.5,
                                tablet: 2.5,
                                desktop: 4
                            }}
                        />
                    </div>
                )}
            </div>
        </ShopLayout>
    );
}