'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
export default function ProductQuickView({ product, onClose }) {
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
    const incrementQuantity = () => setQuantity(q => q + 1);
    const decrementQuantity = () => setQuantity(q => Math.max(1, q - 1)); // Prevent quantity < 1
    // Get available images for thumbnails
    const thumbnailImages = [
        product.imageUrl,
        product.imageUrlHover,
        // Add more actual image URLs from product data if available
        // product.image3,
        // product.image4,
    ].filter(Boolean).slice(0, 4); // Filter out falsy values and limit
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
                className="fixed inset-0 bg-[#00000070] z-40 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleBackdropClick}
                aria-modal="true"
                role="dialog"
            >
                <motion.div
                    className="bg-white rounded-lg shadow-xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col relative"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Close Button - Moved outside the scrollable content div */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 z-50 bg-white rounded-full p-1"
                        aria-label="Cerrar vista rápida"
                    >
                        <X className="h-6 w-6" />
                    </button>
                    {/* Modal Content */}
                    <div className="flex flex-col md:flex-row overflow-y-auto pt-8">
                        {/* Image Section */}
                        <div className="w-full md:w-1/2 pb-6 px-6 flex flex-col items-center">
                            <div className="relative w-full h-80 mb-4">
                                <Image
                                    key={selectedImage} // Add key to force re-render on src change (for potential transitions)
                                    src={selectedImage || '/placeholder.png'} // Use selectedImage state, provide fallback
                                    alt={product.name}
                                    layout="fill"
                                    objectFit="cover"
                                    priority
                                    className="rounded-lg"
                                />
                            </div>
                            {/* Thumbnails (Optional) */}
                            <div className="flex space-x-2 justify-center">
                                {thumbnailImages.map((thumb, index) => (
                                    <div
                                        key={index}
                                        className={`relative w-16 h-16 border rounded overflow-hidden cursor-pointer ${selectedImage === thumb ? 'border-[#00B0C8] border-2' : 'border-gray-200'}`}
                                        onClick={() => handleThumbnailClick(thumb)}
                                    >
                                        <Image
                                            src={thumb}
                                            alt={`Thumbnail ${index + 1}`}
                                            layout="fill"
                                            objectFit="cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Details Section */}
                        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-800 mb-2">{product.name}</h2>
                                <p className="text-3xl font-bold text-gray-900 mb-3">{product.price}</p>
                                <p className="text-sm text-gray-500 mb-4">Impuestos incluidos</p>
                                <p className="text-sm text-gray-600 mb-6 leading-relaxed">{product.description}</p>
                            </div>
                            {/* Actions */}
                            <div className="mt-auto">
                                <div className="flex items-center mb-4">
                                    <span className="text-sm font-medium text-gray-600 mr-4 uppercase">Cantidad</span>
                                    <div className="flex items-center border border-gray-300 rounded">
                                        <button onClick={decrementQuantity} className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l focus:outline-none">
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <input
                                            type="number"
                                            value={quantity}
                                            readOnly // Or implement onChange if direct input is needed
                                            className="w-12 text-center border-l border-r border-gray-300 focus:outline-none"
                                        />
                                        <button onClick={incrementQuantity} className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r focus:outline-none">
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className='flex flex-row  space-x-3'>
                                    <button className="w-full bg-black text-white uppercase p-2 rounded font-semibold hover:bg-gray-800 transition duration-200 mb-3">
                                        Ver detalles
                                    </button>
                                    <button
                                        onClick={handleAddToWishlist}
                                        className="w-full bg-gray-400 text-white uppercase p-2 rounded font-semibold transition duration-200 mb-3 hover:bg-gray-500"
                                        >
                                        Añadir a mi lista
                                    </button> 
                                </div>
                                <div>
                                    <button
                                        className="w-full bg-black text-white uppercase py-3 rounded font-semibold hover:bg-gray-800 transition duration-200 mb-3"
                                    >
                                        Comprar
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