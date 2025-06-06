// components/FadeSlider.jsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';

export default function FadeSlider() {
    const slides = [
        {
            id: 1,
            image: '/assets/images/Screenshot_1.png',
            // title: 'Premium Collection',
            // subtitle: 'Explore our exclusive designs'
        },
        {
            id: 2,
            image: '/assets/images/Screenshot_2.png',
            // title: 'Summer Edition',
            // subtitle: 'New arrivals just for you'
        },
        {
            id: 3,
            image: '/assets/images/Screenshot_3.png',
            // title: 'Limited Offers',
            // subtitle: 'Special discounts available'
        },
        {
            id: 4,
            image: '/assets/images/listas.png',
            // title: 'Limited Offers',
            // subtitle: 'Special discounts available'
        }
    ];

    return (
        <div className=" w-full h-screen">
            <Swiper
                modules={[EffectFade, Autoplay, Pagination]}
                effect="fade"
                speed={1000}
                autoplay={{
                    delay: 5000,
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
                            src={slide.image}
                            alt="img"
                            fill
                            className="object-cover"
                            priority
                            quality={100}
                        />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}