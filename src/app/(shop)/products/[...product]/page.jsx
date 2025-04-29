'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import ShopLayout from "@/components/Layouts/shop-layout";
import Image from "next/image";
import { motion } from 'framer-motion';
import ProductSlider from '@/components/landing/ProductSlider';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'react-hot-toast';
import { fetchProductById, fetchProducts, formatProduct } from '@/services/ProductService';
export default function Page() {
    const params = useParams();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('DETALLES DEL PRODUCTO');
    const { addToCart } = useCart();

    // Reference for scrollable container
    const scrollContainerRef = useRef(null);

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
                if (!params?.product || params.product.length < 2) {
                    throw new Error('Invalid product URL');
                }
                // The last segment of the URL is the product slug
                const productSlug = params.product[params.product.length - 1];
                // Try to extract product ID if it's in the URL (format: product-name-ID)
                const idMatch = productSlug.match(/-([a-f0-9]{24})$/);
                let productData;
                if (idMatch && idMatch[1]) {
                    // If we have an ID in the slug, fetch directly by ID
                    try {
                        const productById = await fetchProductById(idMatch[1]);
                        productData = productById;
                    } catch (idError) {
                        console.error('Error fetching by ID, falling back to slug search:', idError);
                        // If ID fetch fails, fall back to slug search
                    }
                }
                // If we couldn't get the product by ID, try by name
                if (!productData) {
                    // Fetch all products that match this slug (fallback method)
                    const nameResponse = await fetchProducts({
                        limit: 5,
                        name: productSlug.replace(/-/g, ' ').replace(/(-[a-f0-9]{24})$/, '') // Remove ID part if present
                    });
                    if (!nameResponse.products || nameResponse.products.length === 0) {
                        throw new Error('Product not found');
                    }
                    // First try to find an exact match by comparing slugified names
                    const slugifiedProductName = productSlug
                        .replace(/(-[a-f0-9]{24})$/, '') // Remove ID part if present
                        .toLowerCase();
                    productData = nameResponse.products.find(product => {
                        const productNameSlug = product.name
                            .toLowerCase()
                            .replace(/\s+/g, '-')
                            .replace(/[^\w-]+/g, '');
                        return productNameSlug === slugifiedProductName;
                    });
                    // If no exact match, just use the first result
                    if (!productData) {
                        productData = nameResponse.products[0];
                    }
                }
                // Format the product details
                const formattedProduct = {
                    id: productData._id,
                    name: productData.name,
                    price: `${productData.price_incl_tax.toFixed(2).replace('.', ',')} €`,
                    priceValue: productData.price_incl_tax,
                    description: productData.description || 'No description available',
                    details: {
                        dimensions: productData.dimensions || 'N/A',
                        washingInstructions: productData.care_instructions || 'See label',
                        reference: productData.reference || 'N/A',
                        brand: productData.brand || 'N/A'
                    },
                    images: [],
                    category: productData.category || 'Uncategorized'
                };

                // Collect all product images
                if (productData.image) {
                    formattedProduct.images.push(productData.image);
                }

                // Add hover image if different from main image
                if (productData.imageHover && productData.imageHover !== productData.image) {
                    formattedProduct.images.push(productData.imageHover);
                }

                // Add additional images if available
                if (productData.additionalImages && Array.isArray(productData.additionalImages) && productData.additionalImages.length > 0) {
                    formattedProduct.images.push(...productData.additionalImages);
                }

                // Ensure we have at least one image
                if (formattedProduct.images.length === 0) {
                    formattedProduct.images.push('/assets/images/default-product.png');
                }
                setProduct(formattedProduct);
                // Fetch related products in the same category
                const relatedResponse = await fetchProducts({
                    category: productData.category,
                    limit: 8,
                    status: 'active'
                });
                // Format related products and filter out the current product
                const formattedRelated = relatedResponse.products
                    .filter(item => item._id !== productData._id)
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
                <div className="container mx-auto px-4 py-8 mt-22 flex justify-center items-center h-[60vh]">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00B0C8]"></div>
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
                        <h2 className="text-2xl text-red-500 mb-4">Error</h2>
                        <p className="text-gray-600">{error || 'Product not found'}</p>
                        <a href="/products" className="mt-6 inline-block bg-[#00B0C8] text-white py-2 px-6 rounded-md hover:bg-[#009bb1]">
                            Volver a la tienda
                        </a>
                    </div>
                </div>
            </ShopLayout>
        );
    }
    return (
        <ShopLayout>
            <div className="container mx-auto px-4 py-8 mt-22">
                {/* Breadcrumb */}
                <nav className="mb-8">
                    <ol className="flex items-center space-x-2 text-sm text-gray-500">
                        <li><a href="/products" className="hover:text-gray-700">Productos</a></li>
                        <li><span className="mx-2">/</span></li>
                        <li><a href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-gray-700">{product.category}</a></li>
                        <li><span className="mx-2">/</span></li>
                        <li className="text-gray-900 font-medium">{product.name}</li>
                    </ol>
                </nav>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Product Images */}
                    <div className="space-y-4">
                        <motion.div
                            className="relative w-full h-[600px] overflow-hidden rounded-lg bg-white"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Image
                                src={product.images[selectedImage]}
                                alt={product.name}
                                fill
                                className="object-contain"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </motion.div>

                        {/* Imágenes del Producto */}
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
                                        <div className="inline-flex space-x-4 py-2 px-1">
                                            {product.images.map((image, index) => (
                                                <div
                                                    key={index}
                                                    className={`relative border border-gray-200 rounded-md overflow-hidden 
                                                        ${selectedImage === index ? 'ring-2 ring-[#00B0C8]' : 'ring-1 ring-gray-200'}
                                                        w-[180px] flex-shrink-0`}
                                                >
                                                    <div
                                                        className="relative h-44 cursor-pointer"
                                                        onClick={() => setSelectedImage(index)}
                                                    >
                                                        <Image
                                                            src={image}
                                                            alt={`${product.name} ${index + 1}`}
                                                            fill
                                                            className="object-contain"
                                                        /> 
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div> 
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Product Info */}
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                        <p className="text-2xl font-semibold text-gray-900">{product.price}</p>
                        <div className="space-y-4">
                            <p className="text-gray-600">{product.description}</p>
                            <div className="py-4">
                                <h3 className="font-bold text-gray-900 mb-2">Detalles del producto</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-600">
                                    {product.details.dimensions && (
                                        <li>Dimensiones: {product.details.dimensions}</li>
                                    )}
                                    {product.details.washingInstructions && (
                                        <li>Instrucciones de lavado: {product.details.washingInstructions}</li>
                                    )}
                                    {product.details.reference && (
                                        <li>Referencia: {product.details.reference}</li>
                                    )}
                                    {product.details.brand && (
                                        <li>Marca: {product.details.brand}</li>
                                    )}
                                </ul>
                            </div>
                            {/* Quantity Selector */}
                            <div className="flex items-center space-x-4 ">
                                <span className="text-gray-700">Cantidad:</span>
                                <div className="flex items-center border border-gray-300 rounded-md">
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
                                className="w-full bg-[#00B0C8] text-white py-3 px-6 rounded-md hover:bg-[#009bb1] transition-colors duration-200"
                            >
                                Añadir al carrito
                            </button>
                            {/* Wishlist Button */}
                            <button className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                Añadir a mi lista
                            </button>
                        </div>
                    </div>
                </div>
                {/* Product Details Tabs */}
                <div className="mt-16">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {['DESCRIPCIÓN', 'DETALLES DEL PRODUCTO'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-4 px-1 text-sm font-medium ${activeTab === tab
                                        ? 'border-b-2 border-[#00B0C8] text-[#00B0C8]'
                                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="mt-6 pb-16 border-b border-gray-200">
                        {activeTab === 'DESCRIPCIÓN' && (
                            <div className="prose max-w-none">
                                <p className="text-gray-600">{product.description}</p>
                            </div>
                        )}
                        {activeTab === 'DETALLES DEL PRODUCTO' && (
                            <div className="prose max-w-none">
                                <ul className="list-disc list-inside space-y-2 text-gray-600">
                                    {product.details.dimensions && (
                                        <li>Dimensiones: {product.details.dimensions}</li>
                                    )}
                                    {product.details.washingInstructions && (
                                        <li>Instrucciones de lavado: {product.details.washingInstructions}</li>
                                    )}
                                    {product.details.reference && (
                                        <li>Referencia: {product.details.reference}</li>
                                    )}
                                    {product.details.brand && (
                                        <li>Marca: {product.details.brand}</li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16">
                        <ProductSlider
                            title="PRODUCTOS RELACIONADOS"
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