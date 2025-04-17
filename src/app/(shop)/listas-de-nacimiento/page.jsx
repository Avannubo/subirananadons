'use client';
import ProductSlider from "@/components/landing/ProductSlider";

import { useState } from 'react';
import ShopLayout from "@/components/Layouts/shop-layout";
import Image from "next/image";
import Link from "next/link";
import { motion } from 'framer-motion';

const featuredProducts = [
    {
        id: 1,
        name: "Peck 2 Pints Silicon",
        price: "23,95 €",
        imageUrl: "/assets/images/Screenshot_4.png",
        imageUrlHover: "/assets/images/Screenshot_1.png",
        category: "Alimentación"
    },
    {
        id: 2,
        name: "Sac Cobés Bùba Paper Boat",
        price: "78,00 €",
        imageUrl: "/assets/images/Screenshot_3.png",
        imageUrlHover: "/assets/images/Screenshot_2.png",
        category: "Habitación"
    },
    {
        id: 3,
        name: "Robot De Cuina Chefy6",
        price: "119,00 €",
        imageUrl: "/assets/images/Screenshot_2.png",
        imageUrlHover: "/assets/images/Screenshot_3.png",
        category: "Alimentación"
    },
    {
        id: 4,
        name: "Trona De Viaje Arlo",
        price: "49,90 €",
        imageUrl: "/assets/images/Screenshot_1.png",
        imageUrlHover: "/assets/images/Screenshot_4.png",
        category: "Alimentación"
    },
    {
        id: 5,
        name: "Tripp Trapp Natural",
        price: "259,00 €",
        imageUrl: "/assets/images/Screenshot_4.png",
        imageUrlHover: "/assets/images/Screenshot_1.png",
        category: "Habitación"
    },
    {
        id: 6,
        name: "Termo papillero",
        price: "24,90 €",
        imageUrl: "/assets/images/Screenshot_3.png",
        imageUrlHover: "/assets/images/Screenshot_2.png",
        category: "Alimentación"
    },
    {
        id: 7,
        name: "Biberón aprendizaje",
        price: "12,90 €",
        imageUrl: "/assets/images/Screenshot_2.png",
        imageUrlHover: "/assets/images/Screenshot_3.png",
        category: "Alimentación"
    },
    {
        id: 8,
        name: "Newborn Set Tripp Trapp",
        price: "99,00 €",
        imageUrl: "/assets/images/Screenshot_1.png",
        imageUrlHover: "/assets/images/Screenshot_4.png",
        category: "Habitación"
    }
];
// Sample birth lists data
const birthLists = [
    {
        id: 1,
        babyName: "Lucas García",
        parents: "María y Juan García",
        dueDate: "2024-06-15",
        image: "/assets/images/Screenshot_1.png",
        status: "active",
        progress: 65 // percentage of items purchased
    },
    {
        id: 2,
        babyName: "Emma Martínez",
        parents: "Ana y Pedro Martínez",
        dueDate: "2024-07-20",
        image: "/assets/images/Screenshot_2.png",
        status: "active",
        progress: 30
    },
    {
        id: 3,
        babyName: "Pablo Rodríguez",
        parents: "Laura y Carlos Rodríguez",
        dueDate: "2024-05-10",
        image: "/assets/images/Screenshot_3.png",
        status: "active",
        progress: 85
    }
];
export default function BirthListsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [hoveredProduct, setHoveredProduct] = useState(null);

    // Filter birth lists based on search term
    const filteredLists = birthLists.filter(list =>
        list.babyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        list.parents.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ShopLayout>
            {/* Hero Section */}
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
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Buscar por ID de la lista, nombre del bebé o padres..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-6 py-4 rounded-full border-2 border-white bg-white/90 focus:bg-white focus:border-[#00B0C8] focus:outline-none text-lg"
                                />
                                <button className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            <div className="container mx-auto px-4 py-12"> 
                <div className="mb-16">
                    {filteredLists.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredLists.map((list) => (
                                <motion.div
                                    key={list.id}
                                    className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ y: -5 }}
                                >
                                    <Link href={`/listas-de-nacimiento/${list.id}`}>
                                        <div className="relative h-48">
                                            <Image
                                                src={list.image}
                                                alt={list.babyName}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-xl font-semibold mb-2">{list.babyName}</h3>
                                            <p className="text-gray-600 mb-4">{list.parents}</p>
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Fecha prevista:</span>
                                                    <span className="font-medium">{new Date(list.dueDate).toLocaleDateString('es-ES')}</span>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">Progreso:</span>
                                                        <span className="font-medium">{list.progress}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-[#00B0C8] h-2 rounded-full"
                                                            style={{ width: `${list.progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            className="text-center py-12"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <p className="text-gray-500 text-lg">No se encontraron listas que coincidan con tu búsqueda.</p>
                        </motion.div>
                    )}
                </div>
                <div className='flex flex-row space-x-4'>
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
                            <Link
                                href="/listas-de-nacimiento/crear"
                                className="mt-4 md:mt-0 px-8 py-3 bg-white text-[#00B0C8] rounded-full font-medium hover:bg-gray-100 transition-colors"
                            >
                                Crear Lista
                            </Link>
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
                <div className="w-full py-8">
                    <ProductSlider
                        title="Productos Destacados"
                        products={featuredProducts}
                        className="w-full"
                        slidesPerView={{
                            mobile: 2,
                            tablet: 3,
                            desktop: 4
                        }}
                    />
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