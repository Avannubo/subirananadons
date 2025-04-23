'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const FadeSlider = ({
    slides,
    autoPlayInterval = 5000,
    showArrows = true,
    showDots = true,
    className = ''
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    useEffect(() => {
        let interval;
        if (isAutoPlaying) {
            interval = setInterval(() => {
                setCurrentIndex((prevIndex) =>
                    prevIndex === slides.length - 1 ? 0 : prevIndex + 1
                );
            }, autoPlayInterval);
        }
        return () => clearInterval(interval);
    }, [isAutoPlaying, slides.length, autoPlayInterval]);

    const handlePrevious = () => {
        setIsAutoPlaying(false);
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? slides.length - 1 : prevIndex - 1
        );
    };

    const handleNext = () => {
        setIsAutoPlaying(false);
        setCurrentIndex((prevIndex) =>
            prevIndex === slides.length - 1 ? 0 : prevIndex + 1
        );
    };

    const handleDotClick = (index) => {
        setIsAutoPlaying(false);
        setCurrentIndex(index);
    };

    return (
        <div
            className={`relative overflow-hidden ${className}`}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full"
                >
                    {slides[currentIndex]}
                </motion.div>
            </AnimatePresence>

            {showArrows && (
                <>
                    <button
                        onClick={handlePrevious}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-800" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-6 h-6 text-gray-800" />
                    </button>
                </>
            )}

            {showDots && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => handleDotClick(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-200 ${index === currentIndex
                                    ? 'bg-primary scale-110'
                                    : 'bg-white/50 hover:bg-white/80'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default FadeSlider; 