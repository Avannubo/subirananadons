"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
const ImageGallery = () => {
    const [offers, setOffers] = useState([]);
    useEffect(() => {
        fetch('/api/offers')
            .then(res => res.json())
            .then(data => {
                if (!Array.isArray(data)) {
                    data = data ? [data] : [];
                }
                console.log("Offers fetched:", data);
                setOffers(data);
            })
            .catch(err => {
                console.error("Error in offers fetch:", err);
            });
    }, []);
    // Get locale from URL or default to 'ca'
    let locale = 'ca';
    if (typeof window !== 'undefined') {
        const pathLocale = window.location.pathname.split('/')[1];
        if (['ca', 'es'].includes(pathLocale)) locale = pathLocale;
    }
    return (
        <div className="w-full overflow-hidden bg-white">
            <div className="container mx-auto mt-4 md:mt-20 py-8 md:pt-4 md:pb-12 relative px-2 md:px-0">
                <h2 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8 text-gray-800">
                    {locale === 'ca' ? 'Ofertes' : 'Ofertas'}
                </h2>
                {/* First row with 2 offers */}
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-4 md:mb-6">
                    {offers.slice(0, 2).map((item, idx) => {
                        // Handle new translation structure
                        let title = '';
                        let description = '';
                        if (item.title && typeof item.title === 'object') {
                            title = item.title[locale] || item.title.ca || item.title.es || '';
                        } else {
                            title = item.title || '';
                        }
                        if (item.description && typeof item.description === 'object') {
                            description = item.description[locale] || item.description.ca || item.description.es || '';
                        } else {
                            description = item.description || '';
                        }
                        return (
                            <Link
                                key={item._id || idx}
                                href={`/brands?brand=${encodeURIComponent(item._id)}`}
                                className={`relative rounded-lg overflow-hidden w-full ${idx === 0 ? 'md:w-3/5' : 'md:w-2/5'} min-h-[220px] h-[45vw] max-h-[340px] md:max-h-[420px]`}
                            >
                                <div className="relative w-full h-full group">
                                    {/* Brand logo at top left of the container */}
                                    {item.brandLogo && (
                                        <div className='absolute top-2 left-2 p-2 w-16 h-16 md:w-34 md:h-34 flex items-center justify-center bg-white rounded-md z-10'>
                                            <img
                                                src={item.brandLogo}
                                                alt={item.brand}
                                                className="object-contain w-full h-full"
                                            />
                                        </div>
                                    )}
                                    <Image
                                        src={item.imageUrl}
                                        alt={title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        unoptimized={item.imageUrl.startsWith('data:image')}
                                        sizes="100vw"
                                    />
                                    <div className="absolute inset-0 bg-black/20 flex items-end p-3 md:p-6 transition-colors duration-300 group-hover:bg-black/30">
                                        <div className="text-white w-full">
                                            <h3 className="text-xl md:text-4xl font-bold mb-1 line-clamp-2">{title}</h3>
                                            <p className="text-white/90 text-lg line-clamp-2">{description}</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
                {/* Second row with 2 offers */}
                <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                    {offers.slice(2, 4).map((item, idx) => {
                        let title = '';
                        let description = '';
                        if (item.title && typeof item.title === 'object') {
                            title = item.title[locale] || item.title.ca || item.title.es || '';
                        } else {
                            title = item.title || '';
                        }
                        if (item.description && typeof item.description === 'object') {
                            description = item.description[locale] || item.description.ca || item.description.es || '';
                        } else {
                            description = item.description || '';
                        }
                        return (
                            <Link
                                key={item._id || idx}
                                href={`/brands?brand=${encodeURIComponent(item._id)}`}
                                className={`relative rounded-lg overflow-hidden w-full ${idx === 1 ? 'md:w-3/5' : 'md:w-2/5'} min-h-[220px] h-[45vw] max-h-[340px] md:max-h-[420px]`}
                            >
                                <div className="relative w-full h-full group">
                                    {/* Brand logo at top left of the container */}
                                    {item.brandLogo && (
                                        <div className='absolute top-2 left-2 w-16 h-16 md:w-34 md:h-34 p-2 flex items-center justify-center bg-white rounded-md z-10'>
                                            <img
                                                src={item.brandLogo}
                                                alt={item.brand}
                                                className="object-contain w-full h-full"
                                            />
                                        </div>
                                    )}
                                    <Image
                                        src={item.imageUrl}
                                        alt={title}
                                        fill
                                        className="object-cover rounded-lg transition-transform duration-500 group-hover:scale-105"
                                        unoptimized={item.imageUrl.startsWith('data:image')}
                                        sizes="100vw"
                                    />
                                    <div className="absolute inset-0 bg-black/20 flex rounded-lg items-end p-3 md:p-6 group-hover:bg-black/30 transition-colors duration-300">
                                        <div className="text-white w-full">
                                            <h3 className="text-xl md:text-4xl font-bold mb-1 line-clamp-2">{title}</h3>
                                            <p className="text-white/90 text-lg line-clamp-2">{description}</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
export default ImageGallery;