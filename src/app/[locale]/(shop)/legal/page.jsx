"use client";
import { useTranslations } from 'next-intl';
import React from 'react';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import { useState, useEffect } from 'react';

export default function LegalPage() {
    const t = useTranslations('legalPage');
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
                    <Image
                        src={bannerUrl}
                        alt="banner"
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
                    <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-800 mt-8 lg:mt-20">{t('title')}</h1>
                </div>
            )}
            <div className="container mx-auto px-4 py-12 max-w-[1500px]">
                <div className="prose max-w-none">
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">{t('companySection')}</h2>
                        <p>{t('companyText')}</p>
                        <p>{t('cifText')}</p>
                        <p>{t('emailText')}</p>
                    </section>
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">{t('domainSection')}</h2>
                        <p>{t('domainText')}</p>
                    </section>
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">{t('ipSection')}</h2>
                        <p>{t('ipText')}</p>
                    </section>
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">{t('rightsSection')}</h2>
                        <p>{t('rightsText1')}</p>
                        <p>{t('rightsText2')}</p>
                        <p>{t('rightsText3')}</p>
                    </section>
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">{t('webSection')}</h2>
                        <p>{t('webText')}</p>
                    </section>
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">{t('dataSection')}</h2>
                        <p>{t('dataText1')}</p>
                        <p>{t('dataText2')}</p>
                        <p>{t('dataText3')}</p>
                    </section>
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">{t('responsibilitySection')}</h2>
                        <p>{t('responsibilityText1')}</p>
                        <p>{t('responsibilityText2')}</p>
                    </section>
                </div>
            </div>
            <Footer />
        </>
    );
}
