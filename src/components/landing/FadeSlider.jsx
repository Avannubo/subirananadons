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
        <div className=" w-full h-screen">
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
                    <SwiperSlide key={slide.id} className="relative">
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center">
                            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-fadeIn">
                                {slide.title}
                            </h2>
                            <p className="text-xl md:text-2xl text-white/90 animate-fadeIn delay-100">
                                {slide.subtitle}
                            </p>
                        </div>
                        <Image
                            src={slide.imageUrl}
                            alt="img"
                            fill
                            className="object-cover"
                            priority
                            quality={100}
                        />
                        <div className="absolute bottom-5 left-25 transform translate-x-25 z-20">
                            <Link 
                                href={slide.btnLink}
                                className="flex items-center px-6 py-3 uppercase bg-[#00B0C8] text-white rounded-md  hover:bg-[#008da0dc] transition-colors text-md"
                            >
                                {slide.btnText || 'Learn More'}
                            </Link>
                        </div>

                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}