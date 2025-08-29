// components/ProductSlider.jsx
'use client';
import { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from "@/components/products/product-card";
import ProductQuickView from '../products/product-quick-view';
// Default products can be moved to a separate data file if needed
export default function ProductSlider({
    title = "Productes",
    products = defaultProducts,
    className = "w-screen",
    slidesPerView = {
        default: 4,
        desktop: 4,
        tablet: 3,
        mobile: 1
    }
}) {
    const [showBirthListModal, setShowBirthListModal] = useState(false);
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const swiperRef = useRef(null);
    const [viewMode, setViewMode] = useState('grid');
    const handleOpenQuickView = (product) => {
        setQuickViewProduct(product);
    };
    const handleCloseQuickView = () => {
        setQuickViewProduct(null);
    };
    const handleOpenBirthListSelectModal = (product) => {
        setBirthListProduct(product);
    };
    const handleCloseBirthListSelectModal = () => {
        setBirthListProduct(null);
    };
    const handleAddToCart = (product) => {
        // Implement add to cart functionality
        console.log('Add to cart:', product);
    };
    // Determine if we should show navigation arrows (for 5 or more products)
    const showNavigation = products.length >= 5;
    return (
        <div className={`px-2 md:px-4 ${className}`}>
            <div className="container mx-auto">
                <div className="flex flex-row justify-between items-center mb-4 md:mb-8 gap-2 md:gap-0">
                    {title && <h2 className="text-2xl md:text-4xl text-black font-bold">{title}</h2>}
                    {showNavigation && (
                        <div className="flex space-x-2 md:space-x-4">
                            <button
                                onClick={() => swiperRef.current?.slidePrev()}
                                className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                            >
                                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={() => swiperRef.current?.slideNext()}
                                className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                            >
                                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
                <div className="relative">
                    <Swiper
                        onBeforeInit={(swiper) => {
                            swiperRef.current = swiper;
                        }}
                        spaceBetween={16}
                        style={{ height: 'auto' }}
                        autoHeight={true}
                        pagination={{
                            clickable: true,
                            el: '.custom-pagination',
                            type: 'bullets',
                            bulletClass: 'custom-bullet',
                            bulletActiveClass: 'custom-bullet-active',
                            renderBullet: function (index, className) {
                                return `<span class="${className}"></span>`;
                            }
                        }}
                        modules={[Pagination, Navigation]}
                        breakpoints={{
                            0: {
                                slidesPerView: 1,
                                spaceBetween: 8
                            },
                            540: {
                                slidesPerView: 2,
                                spaceBetween: 12
                            },
                            768: {
                                slidesPerView: 3,
                                spaceBetween: 16
                            },
                            1024: {
                                slidesPerView: 4,
                                spaceBetween: 24
                            }
                        }}
                        loop={products.length >= (slidesPerView.desktop || 4)}
                        grabCursor={true}
                        draggable={true}
                        navigation={{
                            enabled: showNavigation,
                            prevEl: '.swiper-button-prev',
                            nextEl: '.swiper-button-next',
                        }}
                        className="relative"
                    >
                        {products.map((product) => (
                            <SwiperSlide key={product.id} className="!h-auto flex">
                                <div className="h-full flex-1 flex flex-col">
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        viewMode={viewMode}
                                        onQuickViewClick={handleOpenQuickView}
                                        onOpenBirthListModal={handleOpenBirthListSelectModal}
                                        className="h-full flex-1"
                                    />
                                </div>
                            </SwiperSlide>
                        ))}
                        <div className="swiper-button-prev !hidden"></div>
                        <div className="swiper-button-next !hidden"></div>
                    </Swiper>
                    {/* Custom Pagination */}
                    <div className="custom-pagination flex justify-center items-center mt-4 md:mt-8"></div>
                </div>
            </div>
            {/* Render Quick View Modal */}
            {quickViewProduct && (
                <ProductQuickView
                    product={quickViewProduct}
                    onClose={handleCloseQuickView}
                />
            )}
            {/* Render Birth List Modal with backdrop and scroll lock */}
            {showBirthListModal && (
                <BirthListModalWrapper
                    show={showBirthListModal}
                    onClose={handleCloseBirthListSelectModal}
                    product={birthListProduct}
                    userId={session?.user?.id}
                />
            )}
            <style jsx global>{`
                .custom-bullet {
                    width: 8px;
                    height: 8px;
                    display: inline-block;
                    border-radius: 50%;
                    background: #D9D9D9;
                    margin: 0 5px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .custom-bullet-active {
                    background: #0096FF;
                    width: 10px;
                    height: 10px;
                }
            `}</style>
        </div>
    );
}