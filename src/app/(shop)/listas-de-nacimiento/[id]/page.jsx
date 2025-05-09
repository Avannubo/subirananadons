'use client';
import { useState, useEffect } from 'react';
import { use } from 'react';
import ShopLayout from "@/components/Layouts/shop-layout";
import Image from "next/image";
import Link from "next/link";
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
// Sample list products (in a real app, this would come from your database)
// available, reserved, purchased
const listProducts = [
    {
        id: 1,
        name: "Tripp Trapp Natural",
        price: "259,00 €",
        image: "/assets/images/joie.png",
        category: "Habitación",
        status: "available",
        quantity: 1,
        reserved: false
    },
    {
        id: 2,
        name: "Cochecito Xplory X Royal",
        price: "1.099,00 €",
        image: "/assets/images/Screenshot_2.png",
        category: "Cochecitos",
        status: "purchased",
        quantity: 1,
        purchasedBy: "Ana García"
    },
    {
        id: 3,
        name: "Set Básico Recién Nacido",
        price: "149,90 €",
        image: "/assets/images/Screenshot_4.png",
        category: "Esenciales",
        status: "purchased",
        quantity: 1,
        reservedBy: "Carlos Martínez"
    }
];
// Categories for filtering
const categories = [
    "Todos",
    "Habitación",
    "Cochecitos",
    "Alimentación",
    "Baño",
    "Esenciales"
];
export default function BirthListPage({ params }) {
    const id = use(params).id;
    const [selectedCategory, setSelectedCategory] = useState("Todos");
    const [sortBy, setSortBy] = useState("default");
    const [list, setList] = useState(null);
    const [showReserveModal, setShowReserveModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showCopyNotification, setShowCopyNotification] = useState(false);
    // In a real app, fetch the list data based on id
    useEffect(() => {
        // Simulating API call
        setList({
            id: id,
            babyName: "Lucas García",
            parents: "María y Juan García",
            dueDate: "2024-06-15",
            image: "/assets/images/Screenshot_1.png",
            status: "active",
            progress: 65,
            message: "¡Gracias por ayudarnos a preparar la llegada de Lucas! ❤️",
            products: listProducts
        });
    }, [id]);
    if (!list) {
        return (
            <ShopLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#00B0C8]"></div>
                </div>
            </ShopLayout>
        );
    }
    const filteredProducts = list.products
        .filter(product => selectedCategory === "Todos" || product.category === selectedCategory)
        .sort((a, b) => {
            switch (sortBy) {
                case "price-asc":
                    return parseFloat(a.price) - parseFloat(b.price);
                case "price-desc":
                    return parseFloat(b.price) - parseFloat(a.price);
                case "name":
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });
    const handleReserveClick = (product) => {
        setSelectedProduct(product);
        setShowReserveModal(true);
    };
    const handleShareClick = async () => {
        const listUrl = window.location.href;
        try {
            await navigator.clipboard.writeText(listUrl);
            toast.success('¡URL copiada al portapapeles!');
        } catch (err) {
            console.error('Failed to copy URL:', err);
            toast.error('Error al copiar la URL');
        }
    };
    return (
        <ShopLayout>
            {/* Hero Section */}
            <div className="relative w-full h-[35vh] bg-gray-100">
                <Image
                    src="/assets/images/bg-beagrumb.jpg"
                    alt={list.babyName}
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0  mt-20 font-medium">
                    <div className="container mx-auto h-full flex flex-col items-center justify-center px-4 text-center">
                        <motion.h1
                            className="text-4xl font-bold text-zinc-900 mb-4"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                        >
                            Lista de {list.babyName}
                        </motion.h1>
                        <motion.p
                            className="text-lg text-zinc-900 mb-2"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            {list.parents}
                        </motion.p>
                        <motion.p
                            className="text-zinc-900"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            Fecha prevista: {new Date(list.dueDate).toLocaleDateString('es-ES')}
                        </motion.p>
                    </div>
                </div>
            </div>
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                        <div className="w-full md:w-2/3 mb-4 md:mb-0">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Progreso de la lista</span>
                                <span className="font-medium">{list.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-[#00B0C8] h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${list.progress}%` }}
                                />
                            </div>
                        </div>
                        <div className="flex space-x-4 relative">
                            <button
                                onClick={handleShareClick}
                                className="px-4 py-2 bg-[#00B0C8] text-white rounded-full hover:bg-[#0090a8] transition-colors flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                                </svg>
                                Compartir Lista
                            </button>
                        </div>
                    </div>
                    <p className="text-gray-600 text-center italic">{list.message}</p>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full text-sm ${selectedCategory === category
                                    ? 'bg-[#00B0C8] text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 border rounded-md"
                    >
                        <option value="default">Ordenar por</option>
                        <option value="price-asc">Precio: menor a mayor</option>
                        <option value="price-desc">Precio: mayor a menor</option>
                        <option value="name">Nombre</option>
                    </select>
                </div>
                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                        <motion.div
                            key={product.id}
                            className="bg-white rounded-lg overflow-hidden shadow-md"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -5 }}
                        >
                            <div className="relative aspect-square">
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                />
                                {product.status !== 'available' && (
                                    <div className="absolute inset-0 bg-[#00000080] flex items-center justify-center">
                                        <span className="text-white text-2xl font-medium">
                                            {product.status === 'purchased' ? 'Comprado' : 'Reservado'}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-medium mb-2">{product.name}</h3>
                                <p className="text-gray-600 mb-4">{product.price}</p>
                                {product.status === 'available' ? (
                                    <button
                                        onClick={() => handleReserveClick(product)}
                                        className="w-full bg-[#00B0C8] text-white py-2 rounded-md hover:bg-[#0090a8] transition-colors"
                                    >
                                        Comprar Regalo
                                    </button>
                                ) : (
                                    <div className="text-sm text-gray-500">
                                        {product.status === 'purchased'
                                            ? `Comprado por ${product.purchasedBy}`
                                            : `Reservado por ${product.reservedBy}`
                                        }
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
                {/* Reserve Modal */}
                {showReserveModal && selectedProduct && (
                    <div className="fixed inset-0  flex items-center justify-center z-50">
                        <motion.div
                            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                        >
                            <h3 className="text-xl font-bold mb-4">Comprar Regalo</h3>
                            <p className="mb-4">¿Deseas reservar {selectedProduct.name}?</p>
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => setShowReserveModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => {
                                        // Handle reservation logic here
                                        setShowReserveModal(false);
                                    }}
                                    className="px-4 py-2 bg-[#00B0C8] text-white rounded-md hover:bg-[#0090a8]"
                                >
                                    Confirmar Reserva
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </ShopLayout>
    );
} 