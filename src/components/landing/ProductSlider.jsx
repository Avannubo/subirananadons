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
        mobile: 2
    }
}) {
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const swiperRef = useRef(null);
    const handleQuickView = (product) => {
        setQuickViewProduct(product);
        setIsQuickViewOpen(true);
    };
    const handleCloseQuickView = () => {
        setIsQuickViewOpen(false);
        setQuickViewProduct(null);
    };
    const handleAddToCart = (product) => {
        // Implement add to cart functionality
        console.log('Add to cart:', product);
    };
    return (
        <div className={`px-4 ${className}`}>
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-8">
                    {title && <h2 className="text-3xl text-black font-bold">{title}</h2>}
                    <div className="flex space-x-4">
                        <button
                            onClick={() => swiperRef.current?.slidePrev()}
                            className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={() => swiperRef.current?.slideNext()}
                            className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="relative">
                    <Swiper
                        onBeforeInit={(swiper) => {
                            swiperRef.current = swiper;
                        }}
                        spaceBetween={30}
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
                            320: { slidesPerView: slidesPerView.mobile || 2 },
                            768: { slidesPerView: slidesPerView.tablet || 3 },
                            1024: { slidesPerView: slidesPerView.desktop || 4 },
                        }}
                        loop={true}
                        grabCursor={true}
                        draggable={true}
                        navigation={{
                            enabled: true,
                            prevEl: '.swiper-button-prev',
                            nextEl: '.swiper-button-next',
                        }}
                        className="relative"
                    >
                        {products.map((product) => (
                            <SwiperSlide key={product.id}>
                                <ProductCard
                                    product={product}
                                    onQuickViewClick={() => handleQuickView(product)}
                                    onAddToCartClick={() => handleAddToCart(product)}
                                    isHovered={hoveredProduct === product.id}
                                    setIsHovered={setHoveredProduct}
                                />
                            </SwiperSlide>
                        ))}
                        <div className="swiper-button-prev !hidden"></div>
                        <div className="swiper-button-next !hidden"></div>
                    </Swiper>
                    {/* Custom Pagination */}
                    <div className="custom-pagination flex justify-center items-center mt-8"></div>
                </div>
            </div>
            {/* Quick View Modal */}
            {isQuickViewOpen && quickViewProduct && (
                <ProductQuickView
                    product={quickViewProduct}
                    isOpen={isQuickViewOpen}
                    onClose={handleCloseQuickView}
                />
            )}
            {/* Add custom styles for pagination bullets */}
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