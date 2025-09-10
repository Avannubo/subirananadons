"use client";
import React from 'react';
import useShopParameter from '@/lib/useShopParameter';
import ShopLayout from '@/components/Layouts/shop-layout';  
import { useLocale } from 'next-intl';
export default function PrivacyPage() {
    const { value: privacyText, loading } = useShopParameter('privacy_policy');
    const [bannerUrl, setBanner] = React.useState(null);
    const locale = useLocale();
    React.useEffect(() => {
        async function fetchBanner() {
            try {
                const res = await fetch('/api/shop-parameters?key=privacy_banner');
                const data = await res.json();
                setBanner(data?.find?.(p => p.key === 'privacy_banner')?.value || null);
            } catch {
                setBanner(null);
            }
        }
        fetchBanner();
    }, []);
    function formatNumberedHeadings(text) {
        if (!text) return '';
        return text
            .replace(/^(\d+\.[^\n]*)/gm, '<span style="display:block;font-size:1.5em;font-weight:bold;margin-top:1.2em;">$1</span>')
            .replace(/\n/g, '<br/>');
    }
    // privacyText is expected to be an object with language keys (es, ca, ...)
    let translatedText = '';
    if (privacyText && typeof privacyText === 'object' && privacyText[locale]?.value) {
        translatedText = privacyText[locale].value;
    } else if (privacyText && typeof privacyText === 'object') {
        // fallback to 'es' if locale not found
        translatedText = privacyText['es']?.value || '';
    } else if (typeof privacyText === 'string') {
        translatedText = privacyText;
    }
    return (
        <ShopLayout>
            {bannerUrl ? (
                <div className="relative w-full mt-10 h-[30vw] min-h-[120px] max-h-[180px] sm:h-[40vh] flex flex-col justify-center items-center rounded-b-2xl overflow-hidden shadow-md">
                    <img
                        src={bannerUrl}
                        alt="banner"
                        fill
                        className="object-cover"
                        priority
                    />
                    {/* Overlay for contrast */}
                    <div className="absolute inset-0 bg-white/70 z-10 pointer-events-none" />
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                        <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-800 shadow-amber-50 mt-8 lg:mt-20 drop-shadow-lg">{locale === 'ca' ? 'Política de Privacitat' : 'Política de Privacidad'}</h1>
                    </div>
                </div>
            ) : (
                <div className="w-full mt-10 h-[30vw] min-h-[120px] max-h-[180px] sm:h-[40vh] flex flex-col justify-center items-center rounded-b-2xl bg-white">
                    <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-800 mt-8 lg:mt-20">{locale === 'ca' ? 'Política de Privacitat' : 'Política de Privacidad'}</h1>
                </div>
            )}
            <div className="container mx-auto px-4 py-12 max-w-[1500px]">
                <div className="prose max-w-none">
                    {loading ? (
                        <p className="text-gray-400">{locale === 'ca' ? 'Carregant...' : 'Cargando...'}</p>
                    ) : translatedText ? (
                        <div dangerouslySetInnerHTML={{ __html: formatNumberedHeadings(translatedText) }} />
                    ) : (
                        <p className="text-gray-400">{locale === 'ca' ? 'No hi ha contingut de política de privacitat disponible.' : 'No hay contenido de política de privacidad disponible.'}</p>
                    )}
                </div>
            </div>
        </ShopLayout>
    );
}