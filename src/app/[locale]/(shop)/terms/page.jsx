"use client";
import React from 'react';
import useShopParameter from '@/lib/useShopParameter';
import ShopLayout from '@/components/Layouts/shop-layout';
import { useLocale } from 'next-intl';
export default function TermsPage() {
    const { value: termsText, loading } = useShopParameter('terms_conditions');
    const [bannerUrl, setBanner] = React.useState(null);
    const locale = useLocale();
    React.useEffect(() => {
        async function fetchBanner() {
            try {
                const res = await fetch('/api/shop-parameters?key=terms_banner');
                const data = await res.json();
                setBanner(data?.find?.(p => p.key === 'terms_banner')?.value || null);
            } catch {
                setBanner(null);
            }
        }
        fetchBanner();
    }, []);
    function formatNumberedHeadings(text) {
        if (!text) return ''; 
        return text
            // Third-level subsection headings (e.g. 1.1.1 Title)
            .replace(/^(\d+\.\d+\.\d+[^\d][^\n]*)/gm, '<span style="display:block;font-size:0.95em;font-weight:500;margin-top:0.8em;">$1</span>')
            // Subsection headings (e.g. 1.1 Title, 2.2 Title)
            .replace(/^(\d+\.\d+[^\d][^\n]*)/gm, '<span style="display:block;font-size:1em;font-weight:600;margin-top:1em;">$1</span>')
            // Main section headings (e.g. 1. Title)
            .replace(/^(\d+\.[^\d][^\n]*)/gm, '<span style="display:block;font-size:1.5em;font-weight:bold;margin-top:1.2em;">$1</span>')
            .replace(/\n/g, '<br/>');
    }
    // termsText is expected to be an object with language keys (es, ca, ...)
    let translatedText = '';
    if (termsText && typeof termsText === 'object' && termsText[locale]?.value) {
        translatedText = termsText[locale].value;
    } else if (termsText && typeof termsText === 'object') {
        // fallback to 'es' if locale not found
        translatedText = termsText['es']?.value || '';
    } else if (typeof termsText === 'string') {
        translatedText = termsText;
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
                        <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-800 shadow-amber-50 mt-8 lg:mt-20 drop-shadow-lg">{locale === 'ca' ? 'Termes i Condicions' : 'Términos y Condiciones'}</h1>
                    </div>
                </div>
            ) : (
                <div className="w-full mt-10 h-[30vw] min-h-[120px] max-h-[180px] sm:h-[40vh] flex flex-col justify-center items-center rounded-b-2xl bg-white">
                    <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-800 mt-8 lg:mt-20">{locale === 'ca' ? 'Termes i Condicions' : 'Términos y Condiciones'}</h1>
                </div>
            )}
            <div className="container mx-auto px-4 py-12 max-w-[1500px]">
                <div className="prose max-w-none">
                    {loading ? (
                        <p className="text-gray-400">{locale === 'ca' ? 'Carregant...' : 'Cargando...'}</p>
                    ) : translatedText ? (
                        <div dangerouslySetInnerHTML={{ __html: formatNumberedHeadings(translatedText) }} />
                    ) : (
                        <p className="text-gray-400">{locale === 'ca' ? 'No hi ha contingut de termes i condicions disponible.' : 'No hay contenido de términos y condiciones disponible.'}</p>
                    )}
                </div>
            </div>
        </ShopLayout>
    );
}