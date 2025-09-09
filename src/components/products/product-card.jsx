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

    // Check if discount is currently active based on date range
    const isDiscountActive = () => {
        if (!product.discount?.active) return false;

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
    };

    // Calculate discount percentage
    const getDiscountPercentage = () => {
        if (!isDiscountActive()) return null;
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
                margin: '10px',
                // padding: '10px',
            }}
            className="flex flex-col items-center text-center h-full group hover:text-[#36A9E1] bg-white rounded-lg overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link href={productUrl} className="w-full flex flex-col items-center h-full">
                <div className="relative w-full h-[300px]">
                    {isDiscountActive() && (
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
                        className="transition-opacity duration-300 p-4 ease-in-out rounded-lg object-contain w-full h-full"
                    /> 

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
                <div className="flex-1 w-full flex flex-col justify-between p-4">
                    <h3 className="font-semibold text-lg w-full overflow-hidden text-ellipsis line-clamp-2 min-h-[56px]" title={translatedName}>{translatedName}</h3>
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-auto">
                        {isDiscountActive() ? (
                            <>
                                <span className="text-gray-400 line-through text-base">{product.price}</span>
                                {/* <span className="text-red-500 text-sm font-medium px-1">
                                    {product.discount.type === 'percentage' ? `-${product.discount.value}%` : `-${product.discount.value}€`}
                                </span> */}
                                <span className="text-[#36A9E1] font-bold text-lg">{product.discount.finalPrice.toFixed(2)}€</span>
                            </>
                        ) : (
                            <p className="text-[#36A9E1] font-bold text-lg">{product.price}</p>
                        )}
                    </div>
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
            className="flex flex-row items-start text-left p-4 px-8 w-full overflow-hidden group h-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link href={productUrl} className="flex flex-row w-full ">
                <div className="relative w-1/4 h-60 mr-4 flex-shrink-0">
                    <img
                        src={currentImageUrl}
                        alt={translatedName}
                        className="transition-opacity duration-300 ease-in-out rounded-lg object-contain w-full h-full"
                    />
                    {/* Discount Badge */}
                    {isDiscountActive() && (
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
                        {isDiscountActive() ? (
                            <div className="flex flex-row space-x-4 justify-start gap-2 text-center ">
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