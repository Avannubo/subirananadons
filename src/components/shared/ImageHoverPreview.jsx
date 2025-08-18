'use client';
import { useState } from 'react';

export default function ImageHoverPreview({ src, alt, className }) {
    const [showPreview, setShowPreview] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        // Calculate position for the preview box
        const x = e.clientX;
        const y = e.clientY;

        // Adjust position to prevent preview from going off screen
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Preview dimensions
        const previewWidth = 200;  // Adjust these values as needed
        const previewHeight = 200;

        // Calculate final position ensuring preview stays within viewport
        const finalX = Math.min(x, windowWidth - previewWidth - 20);
        const finalY = Math.min(y, windowHeight - previewHeight - 20);

        setPosition({
            x: finalX,
            y: finalY
        });
    };

    return (
        <div className="relative inline-block"
            onMouseEnter={() => setShowPreview(true)}
            onMouseLeave={() => setShowPreview(false)}
            onMouseMove={handleMouseMove}>

            <img src={src} alt={alt} className={className} />

            {showPreview && src && (
                <div
                    className="fixed z-50 rounded-lg shadow-lg overflow-hidden bg-white"
                    style={{
                        left: `${position.x + 30}px`,
                        top: `${position.y - 50}px`,
                        width: '200px',  // Adjust size as needed
                        height: 'auto'
                    }}
                >
                    <img
                        src={src}
                        alt={alt}
                        className="w-full h-full object-contain p-2"
                    />
                </div>
            )}
        </div>
    );
}
