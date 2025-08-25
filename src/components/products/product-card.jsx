"use client"
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from 'react';
import React from 'react';
import { useLocale } from 'next-intl';
import { getTranslatedField } from '@/lib/getTranslatedField';
import { useCart } from '@/contexts/CartContext.jsx';
import { useSession } from 'next-auth/react';
import { addProductToBirthList, fetchBirthLists } from '@/services/BirthListService';
import { toast } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import BirthListSelectModal from './BirthListSelectModal.jsx';
// Product Card Component - Handles both grid and list view with hover effect
export default function ProductCard({
    product,
    viewMode = "grid",
    onQuickViewClick
}) {
    console.log(product);

    const [isHovered, setIsHovered] = useState(false);
    const [showBirthListModal, setShowBirthListModal] = useState(false);
    const { addToCart } = useCart();
    const { data: session } = useSession();
    const router = useRouter();
    const locale = useLocale();
    const currentImageUrl = isHovered && product.imageUrlHover ? product.imageUrlHover : product.imageUrl;

    // Get translated name/description
    const translatedName = getTranslatedField(product, 'name', locale);
    const translatedDescription = getTranslatedField(product, 'description', locale);

    // Calculate discount percentage
    const getDiscountPercentage = () => {
        if (!product.discount?.active) return null;
        if (product.discount.type === 'percentage') return product.discount.value;
        return Math.round(((product.priceValue - product.discount.finalPrice) / product.priceValue) * 100);
    };
    const HoverButton = ({ children, onClick, disabled }) => (
        <button
            className={`bg-white rounded-full p-2 shadow text-gray-700 hover:bg-gray-100 transition duration-200 focus:outline-none flex items-center justify-center ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await addToCart(product, 1);
            // Import translation utility
            const { getTranslatedField } = require('@/lib/getTranslatedField');
            const locale = typeof window !== 'undefined' ? (window.__NEXT_INTL_LOCALE || window.navigator.language || 'ca').split('-')[0] : 'ca';
            // toast.success(`${getTranslatedField(product, 'name', locale) || product.name} añadido al carrito`);
        } catch (error) {
            toast.error('Error al añadir al carrito');
            // console.error('Error adding to cart:', error);
        }
    };
    // Generate the product URL based on product id only
    const productUrl = `/products/${product.id}`;

    // Modal wrapper for BirthListSelectModal with framer-motion, AnimatePresence, backdrop click-to-close, scroll lock
    function BirthListModalWrapper({ show, onClose, product, userId }) {
        React.useEffect(() => {
            if (show) {
                document.body.style.overflow = 'hidden';
            }
            return () => {
                document.body.style.overflow = 'unset';
            };
        }, [show]);

        const handleBackdropClick = (e) => {
            if (e.target === e.currentTarget) {
                onClose();
            }
        };

        return (
            <BirthListSelectModal
                show={show}
                onClose={onClose}
                product={product}
                userId={userId}
            />
        );
    }

    // Render product card and modal
    const cardContent = viewMode === 'grid' ? (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
                boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
                borderRadius: '10px',
                // padding: '10px',
            }}
            className="m-2 flex flex-col items-center text-center h-full group hover:text-[#00B0C8]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link href={productUrl} className="w-full flex flex-col items-center">
                <div className="relative w-full h-64 mb-4">
                    {product.discount?.active && (
                        <div className="absolute top-0 right-4 bg-red-600 text-white rounded-bl-lg rounded-br-lg  w-12 h-8 flex items-center justify-center transform ">
                            <span className="text-sm font-bold -rotate-12">
                                {product.discount.type === 'percentage'
                                    ? `-${product.discount.value}%`
                                    : `-${product.discount.value}€`}
                            </span>
                        </div>
                    )}
                    <img
                        src={currentImageUrl}
                        alt={product.name.ca || product.name.es || product.name}
                        className="transition-opacity duration-300 ease-in-out rounded-lg object-contain w-full h-full"
                    />
                    {/* Discount Badge */}

                    {/* Hover Overlay Buttons - Grid View */}
                    <div className="absolute -bottom-2 p- left-1/2 transform -translate-x-1/2 flex items-center justify-center space-x-3 px-3 py-2 transition-all duration-300 z-10">
                        <HoverButton onClick={handleAddToCart}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </HoverButton>
                        <HoverButton onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsHovered(false);
                            onQuickViewClick(product);
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </HoverButton>
                        <HoverButton onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsHovered(false);
                            setShowBirthListModal(true);
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </HoverButton>
                    </div>
                </div>
                <h3 className="font-semibold px-4 text-lg  mb-2 w-full whitespace-nowrap overflow-hidden text-ellipsis h-7 min-h-[28px]" title={translatedName}>{translatedName}</h3>
                <div className="flex flex-col items-center">
                    {product.discount?.active ? (
                        <>
                            <p className="text-gray-400 line-through text-sm">{product.price}</p>
                            <p className="text-red-600 font-semibold text-lg">
                                {`${product.discount.finalPrice.toFixed(2).replace('.', ',')} €`}
                            </p>
                        </>
                    ) : (
                        <p className="text-gray-700 hover:text-gray-900">{product.price}</p>
                    )}
                </div>
            </Link>
        </motion.div>
    ) : (
        // List View (Horizontal) Layout
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-row items-start text-left p-4 px-8 w-full overflow-hidden group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link href={productUrl} className="flex flex-row w-full">
                <div className="relative w-1/4 h-60 mr-4 flex-shrink-0">
                    <img
                        src={currentImageUrl}
                        alt={translatedName}
                        className="transition-opacity duration-300 ease-in-out rounded-lg object-contain w-full h-full"
                    />
                    {/* Discount Badge */}
                    {product.discount?.active && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center transform rotate-12">
                            <span className="text-sm font-bold -rotate-12">
                                {product.discount.type === 'percentage'
                                    ? `-${product.discount.value}%`
                                    : `-${product.discount.value}€`}
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex flex-col justify-start w-3/4">
                    <h3 className="font-semibold text-xl mb-2 whitespace-nowrap overflow-hidden text-ellipsis w-full" title={translatedName}>{translatedName}</h3>
                    <div className="mb-3">
                        {product.discount?.active ? (
                            <div className="flex items-center gap-2">
                                <p className="text-gray-400 line-through text-base">{product.price}</p>
                                <p className="text-red-600 font-semibold text-lg">
                                    {`${product.discount.finalPrice.toFixed(2).replace('.', ',')} €`}
                                </p>
                            </div>
                        ) : (
                            <p className="text-gray-700 text-lg">{product.price}</p>
                        )}
                    </div>
                    {translatedDescription &&
                        translatedDescription !== '{"es":"","ca":""}' && (
                            <p className="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed line-clamp-3">
                                {translatedDescription}...
                            </p>
                        )}
                    {/* Action Icons Below Text - List View */}
                    <div className="flex items-center justify-start space-x-3 mt-2">
                        <HoverButton onClick={handleAddToCart}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </HoverButton>
                        <HoverButton onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsHovered(false);
                            onQuickViewClick(product);
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </HoverButton>
                        <HoverButton
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsHovered(false);
                                setShowBirthListModal(true);
                            }}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </HoverButton>
                    </div>
                </div>
            </Link>
        </motion.div>
    );

    return (
        <>
            {cardContent}
            {showBirthListModal && (
                <BirthListModalWrapper
                    show={showBirthListModal}
                    onClose={() => setShowBirthListModal(false)}
                    product={product}
                    userId={session?.user?.id}
                />
            )}
        </>
    );
}