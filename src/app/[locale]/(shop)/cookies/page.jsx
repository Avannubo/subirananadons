"use client";
import { useTranslations } from 'next-intl';
import React from 'react';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import { useState, useEffect } from 'react';
export default function CookiesPage() {
    const t = useTranslations('CookiesPage');
    const [bannerUrl, setBannerImage] = useState(null);
    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const res = await fetch('/api/portimg/active');
                if (!res.ok) throw new Error('Failed to fetch banner');
                const data = await res.json();
                if (data && data.imageUrl) {
                    setBannerImage(data.imageUrl);
                }
            } catch (err) {
                console.error('Error fetching banner:', err);
            }
        };
        fetchBanner();
    }, []);
    return (
        <>
            <Header />
            {bannerUrl ? (
                <div className="relative w-full mt-10 h-[30vw] min-h-[120px] max-h-[180px] sm:h-[40vh] flex flex-col justify-center items-center rounded-b-2xl overflow-hidden shadow-md">
                    <img
                        src={bannerUrl}
                        alt="bannerUrl"
                        fill
                        className="object-cover"
                        priority
                    />
                    {/* Overlay for contrast */}
                    <div className="absolute inset-0 bg-white/70 z-10 pointer-events-none" />
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                        <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-800 shadow-amber-50 mt-8 lg:mt-20 drop-shadow-lg">{t('title')}</h1>
                    </div>
                </div>
            ) : (
                <div className="w-full mt-10 h-[30vw] min-h-[120px] max-h-[180px] sm:h-[40vh] flex flex-col justify-center items-center rounded-b-2xl bg-white">
                    <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-800 mt-8 lg:mt-20"> {t('title')}</h1>
                </div>
            )}
            <div className="container mx-auto px-4 py-12 max-w-[1500px]">
                <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
                <div className="prose max-w-none">
                    <section className="mb-8">
                        <div className="flex items-center mb-4">
                            <h2 className="text-2xl font-semibold">{t('section1Title')}</h2>
                        </div>
                        <p>{t('section1Text')}</p>
                    </section>
                    <section className="mb-8">
                        <div className="flex items-center mb-4">
                            <h2 className="text-2xl font-semibold">{t('section2Title')}</h2>
                        </div>
                        <h3 className="text-xl font-medium mt-6 mb-3">{t('essentialCookiesTitle')}</h3>
                        <p>{t('essentialCookiesText')}</p>
                        <h3 className="text-xl font-medium mt-6 mb-3">{t('performanceCookiesTitle')}</h3>
                        <p>{t('performanceCookiesText')}</p>
                        <h3 className="text-xl font-medium mt-6 mb-3">{t('functionalityCookiesTitle')}</h3>
                        <p>{t('functionalityCookiesText')}</p>
                        <h3 className="text-xl font-medium mt-6 mb-3">{t('advertisingCookiesTitle')}</h3>
                        <p>{t('advertisingCookiesText')}</p>
                    </section>
                    <section className="mb-8">
                        <div className="flex items-center mb-4">
                            <h2 className="text-2xl font-semibold">{t('section3Title')}</h2>
                        </div>
                        <p>{t('section3Text')}</p>
                    </section>
                    <section className="mb-8">
                        <div className="flex items-center mb-4">
                            <h2 className="text-2xl font-semibold">{t('section4Title')}</h2>
                        </div>
                        <p>{t('section4Text1')}</p>
                        <p className="mt-4">{t('section4Text2')}</p>
                    </section>
                    <section className="mb-8">
                        <div className="flex items-center mb-4">
                            <h2 className="text-2xl font-semibold">{t('section5Title')}</h2>
                        </div>
                        <p>{t('section5Text')}</p>
                    </section>
                    <section>
                        <div className="flex items-center mb-4">
                            <h2 className="text-2xl font-semibold">{t('section6Title')}</h2>
                        </div>
                        <p>{t('section6Text1')}</p>
                        <ul className="list-none my-4">
                            <li><strong>{t('emailLabel')}</strong> info@subirana.com</li>
                            <li><strong>{t('phoneLabel')}</strong> +34 93 243 25 10</li>
                        </ul>
                        <p className="mt-4 text-sm text-gray-600">{t('section6Text2')}</p>
                    </section>
                </div>
            </div>
            <Footer />
        </>
    );
}