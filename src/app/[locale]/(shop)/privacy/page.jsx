
"use client";
import React from 'react';
import useShopParameter from '@/lib/useShopParameter';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import { Info, Database, FileText, Shield, User, Contact, RefreshCw } from 'lucide-react';
// Removed export const metadata because it is not allowed in a client component

export default function PrivacyPage() {
    const { value: privacyText, loading } = useShopParameter('privacy_policy');
    const [banner, setBanner] = React.useState(null);
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
    return (
        <>
            <Header />
            {/* Banner section */}
            <div className="relative w-full mt-10 h-[30vw] min-h-[120px] max-h-[180px] sm:h-[40vh] flex flex-col justify-center items-center   overflow-hidden  ">
                <img
                    src={banner || "/assets/images/bg-beagrumb.jpg"}
                    alt="banner"
                    className="object-cover w-full h-full absolute inset-0"
                    style={{ objectFit: 'cover' }}
                />
                {/* Overlay for contrast */}
                <div className="absolute inset-0 bg-white/70 z-10 pointer-events-none" />
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-800 shadow-amber-50 mt-8 lg:mt-20 drop-shadow-lg">Política de Privacidad</h1>
                </div>
            </div>
            <div className="container mx-auto px-4 py-12 max-w-[1500px]">
                <div className="prose max-w-none">
                    {loading ? (
                        <p className="text-gray-400">Cargando...</p>
                    ) : privacyText ? (
                        <div dangerouslySetInnerHTML={{ __html: formatNumberedHeadings(privacyText) }} />
                    ) : (
                        <p className="text-gray-400">No hay contenido de política de privacidad disponible.</p>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
} 