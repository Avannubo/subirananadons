"use client"
import Image from "next/image";
import Link from "next/link";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'react-hot-toast';
// Product Card Component - Handles both grid and list view with hover effect
export default function ProductCard({ product, viewMode = "grid", onQuickViewClick }) {
    const [isHovered, setIsHovered] = useState(false);
    const { addToCart } = useCart(); 
    const currentImageUrl = isHovered && product.imageUrlHover ? product.imageUrlHover : product.imageUrl; 
    const HoverButton = ({ children, onClick }) => (
        <button
            className="bg-white rounded-full p-2 shadow text-gray-700 hover:bg-gray-100 transition duration-200 focus:outline-none"
            onClick={onClick}
        >
            {children}
        </button>
    );
    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await addToCart(product, 1);
            toast.success(`${product.name} añadido al carrito`);
        } catch (error) {
            toast.error('Error al añadir al carrito');
            console.error('Error adding to cart:', error);
        }
    };
    // Generate the product URL based on category and name
    const productUrl = `/products/${encodeURIComponent(
        product.category?.toLowerCase().replace(/\s+/g, '-') || 'category'
    )}/${encodeURIComponent(
        product.name.toLowerCase().replace(/\s+/g, '-')
    )}-${product.id}`;
    if (viewMode === 'grid') {
        // Grid View Layout
        return (
            <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                    boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
                    borderRadius: '10px',
                    padding: '10px',
                }}
                className="m-2 flex flex-col items-center text-center h-full group hover:text-[#00B0C8]"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Link href={productUrl} className="w-full flex flex-col items-center">
                    <div className="relative w-full h-64 mb-4">
                        <Image
                            src={currentImageUrl}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="transition-opacity duration-300 ease-in-out rounded-lg object-cover"
                        />
                        {/* Hover Overlay Buttons */}
                        <div className="absolute bottom-2 left-2 flex items-center justify-center space-x-3 bg-opacity-0 group-hover:bg-opacity-70 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <HoverButton onClick={handleAddToCart}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            </HoverButton>
                            <HoverButton onClick={(e) => {
                                e.preventDefault(); 
                                e.stopPropagation();
                                setIsHovered(false);
                                onQuickViewClick(product);
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </HoverButton>
                        </div>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 flex-grow">{product.name}</h3>
                    <p className="text-gray-700 hover:text-gray-900">{product.price}</p>
                </Link>
            </motion.div>
        );
    } else {
        // List View (Horizontal) Layout
        return (
            <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-row items-start text-left p-4 w-full overflow-hidden group "
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Link href={productUrl} className="flex flex-row w-full">
                    <div className="relative w-1/4 h-40 mr-4 flex-shrink-0">
                        <Image
                            src={currentImageUrl}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 25vw"
                            className="transition-opacity duration-300 ease-in-out rounded-lg object-cover"
                        />
                        {/* Hover Overlay Buttons */}
                        <div className="absolute bottom-2 right-2 flex items-center justify-center space-x-3 bg-opacity-0 group-hover:bg-opacity-30 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <HoverButton onClick={handleAddToCart}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            </HoverButton>
                            <HoverButton onClick={(e) => {
                                e.preventDefault(); // Prevent navigation
                                e.stopPropagation();
                                setIsHovered(false);
                                onQuickViewClick(product);
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </HoverButton>
                        </div>
                    </div>
                    <div className="flex flex-col justify-start  ">
                        <h3 className="font-semibold text-xl mb-2">{product.name}</h3>
                        <p className="text-gray-700 text-lg mb-3">{product.price}</p>
                        <p className="text-gray-600 text-sm">{product.description}</p>
                    </div>
                </Link>
            </motion.div>
        );
    }
} 