'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import ShopLayout from "@/components/Layouts/shop-layout";
import Image from "next/image";
import { motion, useMotionValue, useTransform } from 'framer-motion';
import ProductSlider from '@/components/landing/ProductSlider';
import { useCart } from '@/contexts/CartContext.jsx';
import { toast } from 'react-hot-toast';
import { fetchProductById, fetchProducts, formatProduct } from '@/services/ProductService';
export default function Page() {
    const t = useTranslations('ProductPage');
    const params = useParams();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('DETALLES DEL PRODUCTO');
    const { addToCart } = useCart();
    const [dragConstraints, setDragConstraints] = useState({ right: 0, left: 0 });

    // Reference for scrollable container
    const scrollContainerRef = useRef(null);

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
                // Fetch product by ID (raw object)
                const productById = await fetchProductById(productId);
                if (!productById) {
                    throw new Error('Product not found');
                }
                setProduct(productById);
                // Fetch related products in the same category
                const relatedResponse = await fetchProducts({
                    category: productById.category?._id || productById.category,
                    limit: 8,
                    status: 'active'
                });
                const formattedRelated = relatedResponse.products
                    .filter(item => item._id !== productById._id)
                    .map(formatProduct)
                    .slice(0, 8);
                setRelatedProducts(formattedRelated);
                setError(null);
            } catch (err) {
                console.error('Error loading product:', err);
                // Show error as toast if available
                if (err && err.message) {
                    toast.error(err.message);
                } else if (typeof err === 'string') {
                    toast.error(err);
                } else {
                    toast.error('Failed to load product. Please try again later.');
                }
                setError('Failed to load product. Please try again later.');
                setProduct(null);
                setRelatedProducts([]);
            } finally {
                setLoading(false);
            }
        }
        loadProduct();
    }, [params]);
    const handleQuantityChange = (change) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1) {
            setQuantity(newQuantity);
        }
    };
    const handleAddToCart = async () => {
        if (!product) return;
        try {
            await addToCart(product, quantity);
            toast.success(`${quantity} ${product.name} añadido al carrito`);
        } catch (error) {
            toast.error('Error al añadir al carrito');
            console.error('Error adding to cart:', error);
        }
    };
    // Loading state
    if (loading) {
        return (
            <ShopLayout>
                <div className="container mx-auto px-4 py-8 mt-22">
                    {/* Skeleton UI ...existing code... */}
                </div>
            </ShopLayout>
        );
    }
    // Error state
    if (error || !product) {
        return (
            <ShopLayout>
                <div className="container mx-auto px-4 py-8 mt-22">
                    {/* Error UI ...existing code... */}
                </div>
            </ShopLayout>
        );
    }
    // Helper functions for translation
    const getTranslated = (obj, fallback = '') => {
        if (!obj) return fallback;
        if (typeof obj === 'object') {
            return obj[locale] || obj['es'] || obj['ca'] || fallback;
        }
        return obj;
    };

    // Images array
    const images = [];
    if (product.image) images.push(product.image);
    if (product.imageHover && product.imageHover !== product.image) images.push(product.imageHover);
    if (product.additionalImages && Array.isArray(product.additionalImages) && product.additionalImages.length > 0) {
        images.push(...product.additionalImages);
    }
    if (images.length === 0) images.push('/assets/images/Screenshot_4.png');

    // Price
    const price = product.price_incl_tax ? `${product.price_incl_tax.toFixed(2).replace('.', ',')} €` : '';

    // Category name
    let categoryName = '';
    if (product.category && typeof product.category === 'object') {
        if (product.category.name && typeof product.category.name === 'object') {
            categoryName = getTranslated(product.category.name, t('uncategorized'));
        } else if (typeof product.category.name === 'string') {
            categoryName = product.category.name;
        } else {
            categoryName = t('uncategorized');
        }
    } else if (typeof product.category === 'string') {
        categoryName = product.category;
    } else {
        categoryName = t('uncategorized');
    }

    // Brand name
    let brandName = '';
    if (product.brand && typeof product.brand === 'object') {
        brandName = product.brand.name || t('notAvailable');
    } else if (typeof product.brand === 'string') {
        brandName = product.brand;
    } else {
        brandName = t('notAvailable');
    }

    // Description
    const description = getTranslated(product.description, t('noDescription'));

    // Product name
    const productName = getTranslated(product.name, t('noName'));

    // Details
    const details = {
        dimensions: product.dimensions || t('notAvailable'),
        washingInstructions: product.care_instructions || t('seeLabel'),
        reference: product.reference || t('notAvailable'),
        brand: brandName
    };

    return (
        <ShopLayout>
            <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8 mt-20">
                {/* Breadcrumb */}
                <nav className="mb-6 sm:mb-8 overflow-x-auto mt-10">
                    <ol className="hidden md:flex items-center space-x-2 text-xs sm:text-sm text-gray-500 min-w-[200px]">
                        <li><a href="/products" className="hover:text-gray-700">{t('breadcrumbProducts')}</a></li>
                        <li><span className="mx-2">/</span></li>
                        <li><a href={`/products?category=${encodeURIComponent(categoryName)}`} className="hover:text-gray-700">{categoryName}</a></li>
                        <li><span className="mx-2">/</span></li>
                        <li className="text-gray-900 font-medium whitespace-nowrap">{productName}</li>
                    </ol>
                </nav>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {/* Product Images */}
                    <div className="space-y-4">
                        <motion.div
                            className="relative w-full h-[320px] xs:h-[400px] sm:h-[500px] md:h-[600px] overflow-hidden rounded-lg bg-white"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Image
                                src={images[selectedImage]}
                                alt={productName}
                                fill
                                className="object-contain"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </motion.div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
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
                                            {images.map((image, index) => (
                                                <div
                                                    key={index}
                                                    className={`relative border border-gray-200 rounded-md overflow-hidden \
                                                        ${selectedImage === index ? 'ring-2 ring-[#00B0C8]' : 'ring-1 ring-gray-200'}\
                                                        w-[90px] xs:w-[120px] sm:w-[140px] md:w-[180px] flex-shrink-0`}
                                                >
                                                    <div
                                                        className="relative h-20 xs:h-28 sm:h-32 md:h-44 cursor-pointer"
                                                        onClick={() => setSelectedImage(index)}
                                                    >
                                                        <Image
                                                            src={image}
                                                            alt={`${productName} ${index + 1}`}
                                                            fill
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
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">{productName}</h1>
                        <p className="text-xl sm:text-2xl font-semibold text-gray-900">{price}</p>
                        <div className="space-y-4">
                            <p className="text-gray-600 break-words">{description}</p>
                            <div className="py-4">
                                <h3 className="font-bold text-gray-900 mb-2">{t('detailsTitle')}</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-600">
                                    {details.dimensions && (
                                        <li>{t('dimensions')}: {details.dimensions}</li>
                                    )}
                                    {details.washingInstructions && (
                                        <li>{t('washingInstructions')}: {details.washingInstructions}</li>
                                    )}
                                    {details.reference && (
                                        <li>{t('reference')}: {details.reference}</li>
                                    )}
                                    {details.brand && (
                                        <li>{t('brand')}: {details.brand}</li>
                                    )}
                                </ul>
                            </div>
                            {/* Quantity Selector */}
                            <div className="flex flex-wrap items-center space-x-2 ">
                                <span className="text-gray-700">{t('quantity')}:</span>
                                <div className="flex items-center border border-gray-300 rounded-md mt-2 sm:mt-0">
                                    <button
                                        onClick={() => handleQuantityChange(-1)}
                                        className="px-3 py-1 text-gray-600"
                                    >
                                        -
                                    </button>
                                    <span className="px-4 py-1 border-x border-gray-300">{quantity}</span>
                                    <button
                                        onClick={() => handleQuantityChange(1)}
                                        className="px-3 py-1 text-gray-600 "
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            {/* Add to Cart Button */}
                            <button
                                onClick={handleAddToCart}
                                className="w-full bg-[#00B0C8] text-white py-3 px-6 rounded-md hover:bg-[#009bb1] transition-colors duration-200 mt-2"
                            >
                                {t('addToCart')}
                            </button>
                            {/* Wishlist Button */}
                            <button className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center   mt-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                {t('addToWishlist')}
                            </button>
                        </div>
                    </div>
                </div>
                {/* Product Details Tabs */}
                <div className="mt-10 sm:mt-16">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex flex-wrap space-x-4 sm:space-x-8 overflow-x-auto">
                            {[t('tabDescription'), t('tabDetails')].map((tab, idx) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(idx === 0 ? 'DESCRIPCIÓN' : 'DETALLES DEL PRODUCTO')}
                                    className={`pb-4 px-1 text-xs sm:text-sm font-medium ${activeTab === (idx === 0 ? 'DESCRIPCIÓN' : 'DETALLES DEL PRODUCTO')
                                        ? 'border-b-2 border-[#00B0C8] text-[#00B0C8]'
                                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="mt-4 sm:mt-6 pb-10 sm:pb-16 border-b border-gray-200">
                        {activeTab === 'DESCRIPCIÓN' && (
                            <div className="prose max-w-none">
                                <p className="text-gray-600">{description}</p>
                            </div>
                        )}
                        {activeTab === 'DETALLES DEL PRODUCTO' && (
                            <div className="prose max-w-none">
                                <ul className="list-disc list-inside space-y-2 text-gray-600">
                                    {details.dimensions && (
                                        <li>{t('dimensions')}: {details.dimensions}</li>
                                    )}
                                    {details.washingInstructions && (
                                        <li>{t('washingInstructions')}: {details.washingInstructions}</li>
                                    )}
                                    {details.reference && (
                                        <li>{t('reference')}: {details.reference}</li>
                                    )}
                                    {details.brand && (
                                        <li>{t('brand')}: {details.brand}</li>
                                    )}
                                </ul>
                            </div>
                        )}
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