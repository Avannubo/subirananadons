'use client';

import FadeSlider from '@/components/ui/FadeSlider';
import SwiperSlider from '@/components/ui/SwiperSlider';
import Image from 'next/image';

const SliderExample = () => {
    // Example slides data
    const slides = [
        <div key="1" className="relative w-full h-[500px]">
            <Image
                src="/assets/slide1.jpg"
                alt="Slide 1"
                fill
                className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-white text-center">
                    <h2 className="text-4xl font-bold mb-4">Welcome to Our Store</h2>
                    <p className="text-xl">Discover amazing products</p>
                </div>
            </div>
        </div>,
        <div key="2" className="relative w-full h-[500px]">
            <Image
                src="/assets/slide2.jpg"
                alt="Slide 2"
                fill
                className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-white text-center">
                    <h2 className="text-4xl font-bold mb-4">Special Offers</h2>
                    <p className="text-xl">Limited time deals</p>
                </div>
            </div>
        </div>,
        <div key="3" className="relative w-full h-[500px]">
            <Image
                src="/assets/slide3.jpg"
                alt="Slide 3"
                fill
                className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-white text-center">
                    <h2 className="text-4xl font-bold mb-4">New Collection</h2>
                    <p className="text-xl">Check out our latest arrivals</p>
                </div>
            </div>
        </div>
    ];

    return (
        <div className="space-y-8">
            <section>
                <h2 className="text-2xl font-bold mb-4">Fade Slider Example</h2>
                <FadeSlider
                    slides={slides}
                    autoPlayInterval={5000}
                    showArrows={true}
                    showDots={true}
                    className="h-[500px] rounded-lg overflow-hidden"
                />
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-4">Swiper Slider Example</h2>
                <SwiperSlider
                    slides={slides}
                    autoPlayInterval={5000}
                    showArrows={true}
                    showDots={true}
                    effect="fade"
                    className="h-[500px] rounded-lg overflow-hidden"
                />
            </section>
        </div>
    );
};

export default SliderExample; 