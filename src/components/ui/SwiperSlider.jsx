'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const SwiperSlider = ({
    slides,
    autoPlayInterval = 5000,
    showArrows = true,
    showDots = true,
    effect = 'fade',
    className = ''
}) => {
    return (
        <div className={`relative group ${className}`}>
            <Swiper
                modules={[Navigation, Pagination, Autoplay, EffectFade]}
                effect={effect}
                spaceBetween={0}
                slidesPerView={1}
                loop={true}
                autoplay={{
                    delay: autoPlayInterval,
                    disableOnInteraction: false,
                }}
                navigation={showArrows ? {
                    prevEl: '.swiper-button-prev',
                    nextEl: '.swiper-button-next',
                } : false}
                pagination={showDots ? {
                    clickable: true,
                    bulletClass: `swiper-pagination-bullet`,
                    bulletActiveClass: `swiper-pagination-bullet-active bg-primary`,
                } : false}
                className="w-full h-full"
            >
                {slides.map((slide, index) => (
                    <SwiperSlide key={index}>
                        {slide}
                    </SwiperSlide>
                ))}

                {showArrows && (
                    <>
                        <button
                            className="swiper-button-prev absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
                            aria-label="Previous slide"
                        >
                            <ChevronLeft className="w-6 h-6 text-gray-800" />
                        </button>
                        <button
                            className="swiper-button-next absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
                            aria-label="Next slide"
                        >
                            <ChevronRight className="w-6 h-6 text-gray-800" />
                        </button>
                    </>
                )}
            </Swiper>

            <style jsx global>{`
                .swiper-pagination-bullet {
                    width: 12px;
                    height: 12px;
                    background: rgba(255, 255, 255, 0.5);
                    opacity: 1;
                    transition: all 0.2s;
                }
                
                .swiper-pagination-bullet-active {
                    transform: scale(1.1);
                }

                .swiper-button-prev::after,
                .swiper-button-next::after {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default SwiperSlider; 