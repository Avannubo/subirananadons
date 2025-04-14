'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Placeholder icons (replace with actual icons)
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
    </svg>
);
const MinusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
    </svg>
);
const WishlistIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
);

export default function ProductQuickView({ product, onClose }) {
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(product?.imageUrl); // State for main image

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
                        <CloseIcon />
                    </button>

                    {/* Modal Content */}
                    <div className="flex flex-col md:flex-row overflow-y-auto pt-8">
                        {/* Image Section */}
                        <div className="w-full md:w-1/2 p-6 flex flex-col items-center">
                            <div className="relative w-full h-80 mb-4">
                                <Image
                                    key={selectedImage} // Add key to force re-render on src change (for potential transitions)
                                    src={selectedImage || '/placeholder.png'} // Use selectedImage state, provide fallback
                                    alt={product.name}
                                    layout="fill"
                                    objectFit="cover" // Changed back to cover
                                    priority
                                />
                            </div>
                            {/* Thumbnails (Optional) */}
                            <div className="flex space-x-2 justify-center">
                                {thumbnailImages.map((thumb, index) => (
                                    <div
                                        key={index}
                                        className={`relative w-16 h-16 border rounded overflow-hidden cursor-pointer ${selectedImage === thumb ? 'border-black border-2' : 'border-gray-200'}`}
                                        onClick={() => handleThumbnailClick(thumb)}
                                    >
                                        <Image
                                            src={thumb}
                                            alt={`Thumbnail ${index + 1}`}
                                            layout="fill"
                                            objectFit="cover" // Changed back to cover
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
                                            <MinusIcon />
                                        </button>
                                        <input
                                            type="number"
                                            value={quantity}
                                            readOnly // Or implement onChange if direct input is needed
                                            className="w-12 text-center border-l border-r border-gray-300 focus:outline-none"
                                        />
                                        <button onClick={incrementQuantity} className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r focus:outline-none">
                                            <PlusIcon />
                                        </button>
                                    </div>
                                </div>
                                <button className="w-full bg-black text-white uppercase py-3 rounded font-semibold hover:bg-gray-800 transition duration-200 mb-3">
                                    Comprar
                                </button>
                                <button className="w-full bg-gray-200 text-gray-700 uppercase py-3 rounded font-semibold hover:bg-gray-300 transition duration-200 flex items-center justify-center">
                                    <WishlistIcon />
                                    Añadir a mi lista
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
} 