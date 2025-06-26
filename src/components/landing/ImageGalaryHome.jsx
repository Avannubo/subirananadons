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
    return (
        <div className="w-full overflow-hidden bg-white">
            <div className="container mx-auto mt-20 py-12 relative">
                <h2 className="text-3xl font-bold mb-8 text-gray-800">Ofertas</h2>
                {/* First row with 2 offers */}
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                    {offers.slice(0, 2).map((item, idx) => (
                        <Link
                            key={item._id || idx}
                            href={`/brands?brand=${encodeURIComponent(item.brand)}`}
                            className={`relative rounded-lg overflow-hidden ${idx === 0 ? 'md:w-3/5' : 'md:w-2/5'}`}
                            style={{ height: '420px' }}
                        >
                            <div className="relative w-full h-full group">
                                {/* Brand logo at top left of the container */}
                                {item.brandLogo && (
                                    <div className='absolute top-2 left-2 p-2 w-40 h-40 flex items-center justify-center bg-white rounded-md z-10'>
                                        <img
                                            src={item.brandLogo}
                                            alt={item.brand}
                                            className=" object-contain"
                                        />
                                    </div>
                                )}
                                <Image
                                    src={item.imageUrl}
                                    alt={item.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    unoptimized={item.imageUrl.startsWith('data:image')}
                                />
                                <div className="absolute inset-0 bg-black/20 flex items-end p-6 transition-colors duration-300 group-hover:bg-black/30">
                                    <div className="text-white">
                                        <h3 className="text-4xl font-bold mb-1">{item.title}</h3>
                                        <p className="text-white/90">{item.description}</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
                {/* Second row with 2 offers */}
                <div className="flex flex-col md:flex-row gap-6">
                    {offers.slice(2, 4).map((item, idx) => (
                        <Link
                            key={item._id || idx}
                            href={`/brands?brand=${encodeURIComponent(item.brand)}`}
                            className={`relative rounded-lg overflow-hidden ${idx === 1 ? 'md:w-3/5' : 'md:w-2/5'}`}
                            style={{ height: '400px' }}
                        >
                            <div className="relative w-full h-full group">
                                {/* Brand logo at top left of the container */}
                                {item.brandLogo && (
                                    <div className='absolute top-2 left-2 w-40 h-40 p-2 flex items-center justify-center bg-white rounded-md z-10'>
                                    <img
                                        src={item.brandLogo}
                                        alt={item.brand}
                                        className="object-contain"
                                        />
                                        </div>
                                )}
                                <Image
                                    src={item.imageUrl}
                                    alt={item.title}
                                    fill
                                    className="object-cover rounded-lg transition-transform duration-500 group-hover:scale-105"
                                    unoptimized={item.imageUrl.startsWith('data:image')}
                                />
                                <div className="absolute inset-0 bg-black/20 flex rounded-lg items-end p-6 group-hover:bg-black/30 transition-colors duration-300">
                                    <div className="text-white">
                                        <h3 className="text-2xl font-bold mb-1">{item.title}</h3>
                                        <p className="text-white/90">{item.description}</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default ImageGallery;