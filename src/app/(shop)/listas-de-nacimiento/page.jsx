'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ShopLayout from "@/components/Layouts/shop-layout";
import Image from "next/image";
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function BirthListsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchTerm) {
            toast.error('Por favor ingresa un enlace de lista de nacimiento');
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
                toast.error('Enlace de lista de nacimiento inválido');
                return;
            }

            // Navigate to the birth list page
            router.push(`/listas-de-nacimiento/${id}`);
        } catch (error) {
            toast.error('Enlace de lista de nacimiento inválido');
        }
    };

    return (
        <ShopLayout>
            <motion.div
                className="relative w-full h-[35vh] bg-gray-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Image
                    src="/assets/images/bg-beagrumb.jpg"
                    alt="Birth Lists Header"
                    fill
                    className="object-cover"
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEDQIHq4C7sgAAAABJRU5ErkJggg=="
                />
                <div className="absolute inset-0 text-zinc-900 mt-20">
                    <div className="container mx-auto h-full flex flex-col items-center justify-center px-4 text-center">
                        <motion.h1
                            className="text-4xl font-bold text-zinc-900 mb-4"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            Listas de Nacimiento
                        </motion.h1>
                        <motion.div
                            className="w-full max-w-2xl"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                        >
                            <form onSubmit={handleSearch} className="relative">
                                <input
                                    type="text"
                                    placeholder="Pega aquí el enlace de una lista de nacimiento"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-6 py-4 rounded-full border-2 border-white bg-white/90 focus:bg-white focus:border-[#00B0C8] focus:outline-none text-lg shadow-sm"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#00B0C8] transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            </form>
                            <p className="mt-4 text-sm text-gray-600">
                                Ingresa el enlace completo o el ID de la lista de nacimiento para acceder a ella
                            </p>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-row  gap-6 mb-12">
                    
                      <motion.div
                    className="flex-1 bg-gradient-to-r from-[#00B0C8] to-[#0090a8] rounded-lg p-8 mb-12 text-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    <div className="flex flex-col  items-start justify-start space-y-4">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">¿Esperando un bebé?</h2>
                            <p className="text-white/90">Crea tu propia lista de nacimiento y compártela con tus seres queridos. Es fácil, rápido y te ayudará a organizar todo lo que necesitas para la llegada de tu bebé.</p>
                        </div>
                        <button
                            onClick={() => router.push('/dashboard/listas')}
                            className="mt-4 md:mt-0 px-8 py-3 bg-white text-[#00B0C8] rounded-full font-medium hover:bg-gray-100 transition-colors"
                        >
                            Crear Lista
                        </button>
                    </div>
                </motion.div>
                <motion.div
                    className="flex-1 bg-gradient-to-r from-[#00B0C8] to-[#0090a8] rounded-lg p-8 mb-12 text-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    <div className="flex flex-col  items-start justify-start space-y-4">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">¿No sabes qué comprar?</h2>
                            <p className="text-white/90">Mira los productos esenciales y más comprados para un primer comprador en nuestra página de recomendaciones. Encuentra inspiración y asegúrate de elegir lo mejor para el bebé.</p>
                        </div>
                        <Link 
                            href="/recomendations"
                            className="mt-4 md:mt-0 px-8 py-3 bg-white text-[#00B0C8] rounded-full font-medium hover:bg-gray-100 transition-colors"
                        >
                            Ver Recomendaciones
                        </Link>
                    </div>
                </motion.div>
</div>
              
                {/* How It Works Section */}
                <motion.div
                    className="mt-16 py-12 bg-gray-50 rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="container mx-auto px-4">
                        <h2 className="text-2xl font-bold text-center mb-12">¿Cómo Funciona?</h2>
                        <div className="flex flex-row space-x-4">
                            <div className="flex-1 text-center">
                                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-[#00B0C8] text-white">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Iniciar Sesión</h3>
                                <p className="text-gray-600">Regístrate o inicia sesión para empezar tu lista</p>
                            </div>
                            <div className="flex-1 text-center">
                                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-[#00B0C8] text-white">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Crea tu Lista</h3>
                                <p className="text-gray-600">Añade los productos que necesitas para el bebé</p>
                            </div>
                            <div className="flex-1 text-center">
                                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-[#00B0C8] text-white">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Comparte</h3>
                                <p className="text-gray-600">Envía tu lista a familiares y amigos</p>
                            </div>
                            <div className="flex-1 text-center">
                                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-[#00B0C8] text-white">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8 4-8-4V5l8 4 8-4v2zM4 13.8V7.2l8 4 8-4v6.6" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Recibe los Regalos</h3>
                                <p className="text-gray-600">Gestiona tu lista y recibe notificaciones de las compras</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </ShopLayout>
    );
}