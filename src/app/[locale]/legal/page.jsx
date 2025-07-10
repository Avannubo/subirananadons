"use client";
import { useTranslations } from 'next-intl';
import React from 'react';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import { useState, useEffect } from 'react';

export default function LegalPage() {
    const t = useTranslations('LegalPage');
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
                    <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-800 mt-8 lg:mt-20"> {t('title')}</h1>
                </div>
            )}
            <div className="container mx-auto px-4 py-12 max-w-[1500px]">
                <div className="prose max-w-none">
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">{t('section1Title')}</h2>
                        <p>{t('section1Text')}</p>
                        <ul className="list-none my-4">
                            <li><strong>{t('companyNameLabel')}</strong> Subirana Nadons, S.L.</li>
                            <li><strong>{t('nifLabel')}</strong> B12345678</li>
                            <li><strong>{t('addressLabel')}</strong> C/ Ejemplo, 123, 08001 Barcelona</li>
                            <li><strong>{t('emailLabel')}</strong> info@subirana.com</li>
                            <li><strong>{t('phoneLabel')}</strong> +34 93 243 25 10</li>
                            <li><strong>{t('registrationLabel')}</strong> Registro Mercantil de Barcelona, Tomo XXXX, Folio XXX, Hoja B-XXXXX</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">{t('section2Title')}</h2>
                        <p>{t('section2Text1')}</p>
                        <p className="mt-4">{t('section2Text2')}</p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">{t('section3Title')}</h2>
                        <p>{t('section3Text1')}</p>
                        <p className="mt-4">{t('section3Text2')}</p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">{t('section4Title')}</h2>
                        <p>{t('section4Text')}</p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">{t('section5Title')}</h2>
                        <p>{t('section5Text1')}</p>
                        <p className="mt-4">{t('section5Text2')}</p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">{t('section6Title')}</h2>
                        <p>{t('section6Text1')}</p>
                        <p className="mt-4 text-sm text-gray-600">{t('section6Text2')}</p>
                    </section>
                </div>
            </div>
            <Footer />
        </>
    );
}
