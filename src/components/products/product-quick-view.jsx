'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { getTranslatedField } from '@/lib/getTranslatedField';
import { useCart } from '@/contexts/CartContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
export default function ProductQuickView({ product, onClose }) {
    const { addToCart } = useCart();


    // Get current locale from next-intl
    const locale = useLocale();
    console.log(product.description);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(product?.imageUrl); // State for main image
    const { data: session } = useSession();
    const router = useRouter();
    // Update selectedImage if the product changes (edge case)
    useEffect(() => {
        if (product) {
            setSelectedImage(product.imageUrl);
        }
    }, [product]);

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await addToCart(product, quantity);
            router.push('/cart');
        } catch (error) {
            toast.error('Error al añadir al carrito');
            console.error('Error adding to cart:', error);
        }
    };
    // Handle clicks outside the modal content to close it
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };
    // Prevent scrolling when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);
    if (!product) return null;
    // Get translated name/description
    const translatedName = getTranslatedField(product, 'name', locale);
    const translatedDescription = getTranslatedField(product, 'description', locale);
    const incrementQuantity = () => setQuantity(q => q + 1);
    const decrementQuantity = () => setQuantity(q => Math.max(1, q - 1)); // Prevent quantity < 1
    // Get available images for thumbnails (remove duplicates)
    const thumbnailImages = Array.from(
        new Set([
            product.imageUrl,
            product.imageUrlHover,
            // Add more actual image URLs from product data if available
            // product.image3,
            // product.image4,
        ].filter(Boolean))
    ).slice(0, 4); // Filter out falsy values, remove duplicates, and limit
    const handleThumbnailClick = (imageUrl) => {
        setSelectedImage(imageUrl);
    };
    // Function to handle add to wishlist
    const handleAddToWishlist = () => {
        // If not logged in, redirect to login page with a return URL
        if (!session) {
            router.push(`/api/auth/signin?callbackUrl=${encodeURIComponent('/dashboard/listas')}`);
        } else {
            // User is logged in, navigate to listas
            router.push('/dashboard/listas');
        }
    };
    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-[#00000050] z-40 flex items-center justify-center p-2 sm:p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleBackdropClick}
                aria-modal="true"
                role="dialog"
            >
                <motion.div
                    className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-4xl max-h-[95vh] flex flex-col relative"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="cursor-pointer absolute top-2 right-2 text-gray-500 hover:text-gray-800 z-50 bg-white rounded-full p-1 sm:top-3 sm:right-3"
                        aria-label="Cerrar vista rápida"
                    >
                        <X className="h-6 w-6" />
                    </button>
                    {/* Modal Content */}
                    <div className="flex flex-col md:flex-row overflow-y-auto pt-8 md:pt-8">
                        {/* Image Section */}
                        <div className="w-full md:w-1/2 pb-4 px-2 sm:px-6 flex flex-col items-center">
                            <div className="relative w-full h-56 sm:h-80 mb-4 mt-2 flex items-center justify-center">
                                <img
                                    key={selectedImage}
                                    src={selectedImage || '/placeholder.png'}
                                    alt={product.name}
                                    className="rounded-lg object-contain max-w-full max-h-full h-auto w-auto"
                                    loading="eager"
                                />
                            </div>
                            {/* Thumbnails */}
                            <div className="flex space-x-2 justify-center">
                                {thumbnailImages.map((thumb, index) => (
                                    <div
                                        key={index}
                                        className={`relative w-12 h-12 sm:w-16 sm:h-16 border rounded overflow-hidden cursor-pointer ${selectedImage === thumb ? 'border-[#36A9E1] border-2' : 'border-gray-200'}`}
                                        onClick={() => handleThumbnailClick(thumb)}
                                    >
                                        <img
                                            src={thumb}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 p-4 sm:p-6 flex flex-col justify-between">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">{translatedName}</h2>
                                {product.discount?.active ? (
                                    <div className="mb-3">
                                        <div className="flex items-center gap-3">
                                            <p className="text-2xl sm:text-3xl font-bold text-red-600">
                                                {`${product.discount.finalPrice.toFixed(2).replace('.', ',')} €`}
                                            </p>
                                            <p className="text-lg sm:text-xl text-gray-400 line-through">
                                                {product.price}
                                            </p>
                                        </div>
                                        <p className="text-sm text-red-600 font-medium mt-1">
                                            {product.discount.type === 'percentage'
                                                ? `${product.discount.value}% de descuento`
                                                : `${product.discount.value}€ de descuento`}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{product.price}</p>
                                )}
                                <p className="text-xs sm:text-sm text-gray-500 mb-4">Impuestos incluidos</p>
                                <p className="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed line-clamp-3">
                                    {translatedDescription?.length > 0 ? translatedDescription : ''}
                                    {translatedDescription && translatedDescription.length > 0 ? '...' : ''}
                                </p>
                            </div>
                            {/* Actions */}
                            <div className="mt-auto">
                                <div className="flex items-center mb-4">
                                    <span className="text-xs sm:text-sm font-medium text-gray-600 mr-4 uppercase">Cantidad</span>
                                    <div className="flex items-center border border-gray-300 rounded">
                                        <button onClick={decrementQuantity} className="cursor-pointer px-2 sm:px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l focus:outline-none">
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <input
                                            type="number"
                                            value={quantity}
                                            readOnly
                                            className="w-10 sm:w-12 text-center border-l border-r border-gray-300 focus:outline-none"
                                        />
                                        <button onClick={incrementQuantity} className="cursor-pointer px-2 sm:px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r focus:outline-none">
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                {/* Lista button */}
                                {/* <div className='mb-3'>
                                    <button
                                        onClick={handleAddToWishlist}
                                        className="w-full bg-gray-400 text-white uppercase p-2 py-3 rounded font-semibold transition duration-200 hover:bg-gray-500 mb-2"
                                    >
                                        Añadir a mi lista
                                    </button>
                                </div> */}
                                {/* Comprar and Ver detalles side by side */}
                                <div className="flex flex-row gap-2 mb-1">
                                    <button
                                        className="cursor-pointer w-1/2 bg-black text-white py-3 rounded font-medium hover:bg-gray-700 transition duration-200"
                                        onClick={() => router.push(`/products/${product.id}`)}
                                    >
                                        Més informació
                                    </button>
                                    <button
                                        className="cursor-pointer w-1/2 bg-[#36A9E1] text-white py-3 rounded font-medium hover:bg-[#3f93ba] transition duration-200"
                                        onClick={handleAddToCart}
                                    >
                                        Afegir al carret
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}