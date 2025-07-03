// components/FadeSlider.jsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import Link from 'next/link';

export default function FadeSlider() {
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/slider')
            .then(res => res.json())
            .then(data => {
                setSlides(data);
                setLoading(false);
            });
    }, []);
    return (
        <div className="w-full h-[45vw] min-h-[450px] max-h-[600px] md:h-[100vh] md:min-h-[350px] md:max-h-full relative">
            <Swiper
                modules={[EffectFade, Autoplay, Pagination]}
                effect="fade"
                speed={1000}
                autoplay={{
                    delay: 7000,
                    disableOnInteraction: false
                }}
                pagination={{
                    clickable: true,
                    bulletClass: 'swiper-pagination-bullet bg-white/50',
                    bulletActiveClass: 'swiper-pagination-bullet-active !bg-white'
                }}
                loop={true}
                className="h-full w-full"
            >
                {slides.map((slide) => (
                    <SwiperSlide key={slide.id} className="relative w-full h-full ">
                        <div className="absolute inset-0 bg-black/20 flex rounded-lg   p-3 md:p-6 group-hover:bg-black/30 transition-colors duration-300 z-10 flex-col items-center justify-center text-center px-2 md:px-0">
                            <h2 className="text-2xl md:text-5xl font-bold text-white mb-2 md:mb-4 animate-fadeIn drop-shadow-lg">
                                {slide.title}
                            </h2>
                            <p className="text-base md:text-2xl text-white/90 animate-fadeIn delay-100 drop-shadow-md">
                                {slide.subtitle}
                            </p>
                        </div>
                        <Image
                            src={slide.imageUrl}
                            alt="img"
                            fill
                            className="object-cover object-center"
                            priority
                            quality={100}
                            sizes="100vw"
                        />
                        <div className="absolute bottom-15 left-1/2 -translate-x-1/2 z-20 flex justify-center w-full md:w-auto md:font-semibold   md:left-50 md:translate-x-0 md:justify-center md:items-center">
                            <Link
                                href={slide.btnLink}
                                className="flex items-center uppercase  text-white rounded-md transition-colors text-sm md:text-4xl mx-auto relative group"
                            >
                                <span
                                    className="relative z-10"
                                >
                                    {slide.btnText || 'Learn More'}
                                </span>
                                <span
                                    className="absolute left-0 -bottom-1 w-0 h-[3px] bg-white transition-all duration-500 group-hover:w-full"
                                    aria-hidden="true"
                                />
                            </Link>
                        </div>
                        {/* <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex justify-center w-full md:w-auto  md:left-50 md:translate-x-0 md:justify-center md:items-center">
                            <Link
                                href={slide.btnLink}
                                className="flex items-center uppercase  text-white rounded-md transition-colors text-sm md:text-4xl mx-auto relative group"
                            >
                                <span
                                    style={{
                                        WebkitTextStroke: '1.5px #fff',
                                        color: 'white',
                                        textShadow: '2px 2px 8px #000, 0 2px 12px #000'
                                    }}
                                    className="relative z-10"
                                >
                                    {slide.btnText || 'Learn More'}
                                </span>
                                <span
                                    className="absolute left-0 -bottom-1 w-0 h-[5px] bg-white transition-all duration-500 group-hover:w-full shadow-[0_2px_8px_0_rgba(0,0,0,0.7)]"
                                    aria-hidden="true"
                                />
                            </Link>
                        </div> */}
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}