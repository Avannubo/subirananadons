'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ShopLayout from "@/components/Layouts/shop-layout";
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import CrearLista from '@/components/ui/CrearListasBtn';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
export default function BirthListsPage() {
    const { data: session } = useSession();
    const [searchTerm, setSearchTerm] = useState('');
    const [bannerImage, setBannerImage] = useState(null);
    const router = useRouter();
    const t = useTranslations('BirthListsPage');
    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const res = await fetch('/api/portimg/active');
                if (!res.ok) throw new Error('Failed to fetch banner');
                const data = await res.json();
                if (data && (data.image || data.imageUrl)) {
                    setBannerImage(data.image || data.imageUrl);
                }
            } catch (err) {
                console.error('Error fetching banner:', err);
            }
        };
        fetchBanner();
    }, []);
    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchTerm) {
            toast.error(t('searchErrorEmpty'));
            return;
        }
        try {
            // Extract the ID from the URL
            let id;
            if (searchTerm.includes('/listas-de-nacimiento/')) {
                // Extract ID from full URL
                const matches = searchTerm.match(/\/listas-de-nacimiento\/([^/?]+)/);
                id = matches ? matches[1] : null;
            } else {
                // Treat the input as a direct ID
                id = searchTerm.trim();
            }
            if (!id) {
                toast.error(t('searchErrorInvalid'));
                return;
            }
            // Navigate to the birth list page
            router.push(`/listas-de-nacimiento/${id}`);
        } catch (error) {
            toast.error(t('searchErrorInvalid'));
        }
    };
    return (
        <ShopLayout>
            {bannerImage ? (
                <div className="relative w-full mt-10 h-[30vw] min-h-[120px] max-h-[180px] sm:h-[40vh] flex flex-col justify-center items-center rounded-b-2xl overflow-hidden shadow-md">
                    <img
                        src={bannerImage}
                        alt={t('bannerAlt')}
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
            {/* Search bar below the banner */}
            <div className="w-full flex flex-col items-center m-2  p-2 relative">
                <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto flex flex-col items-center">
                    <div className="w-full flex items-center bg-white bg-opacity-90 rounded-full shadow-md px-4 py-3 mb-2 border border-gray-200">
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none text-lg placeholder-gray-400 px-2"
                        />
                        <button
                            type="submit"
                            className="ml-2 text-gray-500 hover:text-[#36A9E1] focus:outline-none"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-gray-700 text-sm text-center drop-shadow-sm">
                        {t('searchHelp')}
                    </p>
                </form>
            </div>
            <div className="container mx-auto p-4">
                <div className="flex flex-col md:flex-row gap-6 mb-12">
                    <motion.div
                        className="flex-1 bg-gradient-to-r from-[#36A9E1] to-[#3f93ba] rounded-lg p-8 mb-6 md:mb-12 text-white"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div>
                                <h2 className="text-2xl text-center font-bold mb-2">{t('expectingTitle')}</h2>
                                <p className="text-white/90 text-center">{t('expectingDesc')}</p>
                            </div>
                            <CrearLista />
                        </div>
                    </motion.div>
                    <motion.div
                        className="flex-1 bg-gradient-to-r from-[#36A9E1] to-[#3f93ba] rounded-lg p-8 mb-6 md:mb-12 text-white"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div>
                                <h2 className="text-2xl text-center font-bold mb-2">{t('recommendTitle')}</h2>
                                <p className="text-white/90 text-center">{t('recommendDesc')}</p>
                            </div>
                            <Link
                                href="/recomendations"
                                className="mt-4 md:mt-0 px-8 py-3 bg-white text-[#36A9E1] rounded-full font-medium hover:bg-gray-100 transition-colors"
                            >
                                {t('recommendBtn')}
                            </Link>
                        </div>
                    </motion.div>
                </div>
                {/* How It Works Section */}
                <motion.div
                    className="mt-8 md:mt-16 py-8 md:py-12  rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="container mx-auto px-2 md:px-4">
                        <h2 className="text-2xl font-bold text-center mb-8 md:mb-12">{t('howWorksTitle')}</h2>
                        <div className="flex flex-col p-4 md:flex-row md:space-x-4 space-y-8 md:space-y-0 overflow-x-auto">
                            <div className="flex-1 min-w-[220px] shadow-md p-6 rounded-lg text-center">
                                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4">
                                    <svg className="w-8 h-8 text-[#36A9E1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{t('howWorksStep1Title', { default: 'Crea tu lista / Crea la teva llista' })}</h3>
                                <p className="text-gray-600">{t('howWorksStep1Desc', { default: 'Inicia sesión con tu usuario, accede a tu perfil y crea y personaliza tu lista / Inicia sesió amb el teu usuari, accedeix al teu perfil i crea i personalitza la teva llista' })}</p>
                            </div>
                            <div className="flex-1 min-w-[220px] shadow-md p-6 rounded-lg  text-center">
                                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4">
                                    <svg className="w-8 h-8  text-[#36A9E1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{t('howWorksStep2Title', { default: 'Añade los productos / Afegeix els productes' })}</h3>
                                <p className="text-gray-600">{t('howWorksStep2Desc', { default: 'Elige tus productos favoritos entre todo el catalogo de nuestra tienda / Eligeix els teus productes favorits entre tot el cataleg de la nostra botiga' })}</p>
                            </div>
                            <div className="flex-1 min-w-[220px] shadow-md p-6 rounded-lg  text-center">
                                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4">
                                    <svg className="w-8 h-8  text-[#36A9E1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{t('howWorksStep3Title', { default: 'Comparte tu lista / Comparteix la teva llista' })}</h3>
                                <p className="text-gray-600">{t('howWorksStep3Desc', { default: 'Envía el enlace generado para que tus amigos y familiares compren tus regalos / Enviía l\'enllaç generat per a que els teus amics i familiars comprin els teus regals' })}</p>
                            </div>
                            <div className="flex-1 min-w-[220px] shadow-md  p-6 rounded-lg  text-center">
                                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4">
                                    <svg className="w-8 h-8  text-[#36A9E1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m8-8v13m-8 0V8m-8 8v13" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{t('howWorksStep4Title', { default: 'Adquiere tus regalos / Adquireix els teus regals' })}</h3>
                                <p className="text-gray-600">{t('howWorksStep4Desc', { default: 'Cuando la lista esté finalizada, podrás recoger todos los regalos en la tienda / Quan la llista estigui finalitzada podràs recollir tots els teus regals a la botiga' })}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </ShopLayout>
    );
}