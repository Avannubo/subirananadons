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

// Default products can be moved to a separate data file if needed
const defaultProducts = [
    {
        id: 1,
        name: 'Peck 2 Pints Silicon',
        price: '23,95 €',
        image: '/assets/images/joie.png',
        hoverImage: '/assets/images/Screenshot_1.png',
        category: 'default'
    },
    {
        id: 2,
        name: 'Sac Cobés Bùba Paper Boat',
        price: '78,00 €',
        image: '/assets/images/joie.png',
        hoverImage: '/assets/images/Screenshot_1.png',
        category: 'default'
    }
    // ... you can keep more default products if needed
];

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
    const swiperRef = useRef(null);

    const handleQuickView = (product) => {
        // Implement quick view functionality
        console.log('Quick view:', product);
    };

    const handleAddToCart = (product) => {
        // Implement add to cart functionality
        console.log('Add to cart:', product);
    };

    return (
        <section className={`px-4  ${className}`}>
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
                <Swiper
                    onBeforeInit={(swiper) => {
                        swiperRef.current = swiper;
                    }}
                    spaceBetween={30}
                    pagination={{
                        clickable: true,
                        dynamicBullets: true
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
                    className="pb-12 relative"
                >
                    {products.map((product) => (
                        <SwiperSlide key={product.id}>
                            <Link
                                href={`/products/${encodeURIComponent(product.category.toLowerCase())}/${product.name.toLowerCase().replace(/\s+/g, '-')}`}
                                className="group relative overflow-hidden duration-300 h-full flex flex-col"
                                onMouseEnter={() => setHoveredProduct(product.id)}
                                onMouseLeave={() => setHoveredProduct(null)}
                            >
                                {/* Image Container with Hover Effect */}
                                <div className="aspect-square relative overflow-hidden ">
                                    {/* Main Image */}
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className={`object-cover transition-opacity duration-500 ${hoveredProduct === product.id ? 'opacity-0' : 'opacity-100'}`}
                                    />

                                    {/* Hover Image */}
                                    <Image
                                        src={product.hoverImage || product.image}
                                        alt={`${product.name} - hover`}
                                        fill
                                        className={`object-cover transition-opacity duration-500 ${hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'}`}
                                    />

                                    {/* Action Buttons */}
                                    <div className="absolute bottom-0 left-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="flex flex-row justify-center space-x-2">
                                            <button
                                                className="bg-white text-primary font-bold rounded-full hover:bg-gray-100 transition-colors p-2 shadow-lg"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleQuickView(product);
                                                }}
                                            >
                                                {/* Quick View Icon */}
                                                <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none">
                                                    <circle cx="10.5" cy="10.5" r="6.5" stroke="#000000" strokeLinejoin="round" />
                                                    <path d="M19.6464 20.3536C19.8417 20.5488 20.1583 20.5488 20.3536 20.3536C20.5488 20.1583 20.5488 19.8417 20.3536 19.6464L19.6464 20.3536ZM20.3536 19.6464L15.3536 14.6464L14.6464 15.3536L19.6464 20.3536L20.3536 19.6464Z" fill="#000000" />
                                                </svg>
                                            </button>
                                            <button
                                                className="bg-white text-primary font-bold rounded-full hover:bg-gray-100 transition-colors p-2 shadow-lg"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleAddToCart(product);
                                                }}
                                            >
                                                {/* Add to Cart Icon */}
                                                <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none">
                                                    <path d="M7.5 18C8.32843 18 9 18.6716 9 19.5C9 20.3284 8.32843 21 7.5 21C6.67157 21 6 20.3284 6 19.5C6 18.6716 6.67157 18 7.5 18Z" stroke="#000000" strokeWidth="1.5" />
                                                    <path d="M16.5 18.0001C17.3284 18.0001 18 18.6716 18 19.5001C18 20.3285 17.3284 21.0001 16.5 21.0001C15.6716 21.0001 15 20.3285 15 19.5001C15 18.6716 15.6716 18.0001 16.5 18.0001Z" stroke="#000000" strokeWidth="1.5" />
                                                    <path d="M2 3L2.26121 3.09184C3.5628 3.54945 4.2136 3.77826 4.58584 4.32298C4.95808 4.86771 4.95808 5.59126 4.95808 7.03836V9.76C4.95808 12.7016 5.02132 13.6723 5.88772 14.5862C6.75412 15.5 8.14857 15.5 10.9375 15.5H12M16.2404 15.5C17.8014 15.5 18.5819 15.5 19.1336 15.0504C19.6853 14.6008 19.8429 13.8364 20.158 12.3075L20.6578 9.88275C21.0049 8.14369 21.1784 7.27417 20.7345 6.69708C20.2906 6.12 18.7738 6.12 17.0888 6.12H11.0235M4.95808 6.12H7" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div className="py-4 flex-grow flex flex-col pb-8 justify-center items-center text-black">
                                    <h3 className="text-lg font-medium mb-2 text-center group-hover:text-[#00B0C8] transition-colors">{product.name}</h3>
                                    <p className="text-md font-light text-primary mt-auto">{product.price}</p>
                                </div>
                            </Link>
                        </SwiperSlide>
                    ))}
                    <div className="swiper-button-prev !hidden"></div>
                    <div className="swiper-button-next !hidden"></div>
                </Swiper>
            </div>
        </section>
    );
}