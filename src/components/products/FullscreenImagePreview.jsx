'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
export default function FullscreenImagePreview({ images, initialIndex, onClose }) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    // Minimum swipe distance for gesture detection (in pixels)
    const minSwipeDistance = 50;
    useEffect(() => {
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);
    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };
    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };
    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;
        if (isLeftSwipe) {
            nextImage();
        }
        if (isRightSwipe) {
            previousImage();
        }
    };
    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };
    const previousImage = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 h-screen z-50 bg-[#00000050] flex items-center justify-center"
            onClick={onClose}
        >
            {/* Close button */}
            <button
                className="absolute top-4 right-4 z-50 text-white p-2"
                onClick={onClose}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            {/* Image counter */}
            <div className="absolute top-4 left-4 text-white text-sm">
                {currentIndex + 1} / {images.length}
            </div>
            {/* Main image */}
            <div
                className="w-full h-full flex items-center justify-center m-4"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <motion.img
                    key={currentIndex}
                    src={images[currentIndex]}
                    alt={`Preview ${currentIndex + 1}`}
                    className="max-h-full max-w-full object-contain"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
            {/* Navigation buttons */}
            {images.length > 1 && (
                <>
                    <button
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#00B0C8] p-2"
                        onClick={(e) => {
                            e.stopPropagation();
                            previousImage();
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#00B0C8] p-2"
                        onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </>
            )}
        </motion.div>
    );
}
