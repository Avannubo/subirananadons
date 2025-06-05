'use client';
import { useState, useEffect } from 'react';
import { use } from 'react';
import ShopLayout from "@/components/Layouts/shop-layout";
import Image from "next/image";
import Link from "next/link";
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext.jsx';
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [availableCategories, setAvailableCategories] = useState(["Todos"]);
    const router = useRouter();
    const { addToCart } = useCart();
    // Remove or simplify unused states related to the modal
    const [selectedProduct, setSelectedProduct] = useState(null);    // Calculate progress percentage based on item states (2=purchased, 1=reserved, 0=available)
    const calculateProgress = (items) => {
        if (!items || items.length === 0) return 0;
        const purchasedCount = items.filter(item => item.state === 2).length;
        const totalItems = items.length;
        return totalItems > 0 ? Math.round((purchasedCount / totalItems) * 100) : 0;
    };
    // Fetch birth list data from API
    useEffect(() => {
        const fetchBirthList = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`/api/birthlists/${id}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch birth list: ${response.status}`);
                }
                const data = await response.json();
                if (!data.success) {
                    throw new Error(data.message || 'Failed to fetch birth list data');
                }
                // Format the data for display
                const birthListData = data.data;
                const progress = calculateProgress(birthListData.items);
                setList({
                    id: birthListData._id,
                    userId: birthListData.user?._id,
                    babyName: birthListData.babyName,
                    parents: birthListData.user ? birthListData.user.name : 'Anónimo',
                    dueDate: birthListData.dueDate,
                    title: birthListData.title,
                    description: birthListData.description,
                    image: birthListData.image,
                    status: birthListData.status,
                    isPublic: birthListData.isPublic,
                    progress: progress,
                    message: birthListData.description || '¡Gracias por ayudarnos a preparar la llegada!',
                    products: birthListData.items.map(item => ({
                        id: item._id,
                        productId: item.product._id,
                        name: item.productSnapshot?.name || item.product.name,
                        price: `${(item.productSnapshot?.price || item.product.price_incl_tax).toFixed(2).replace('.', ',')} €`,
                        priceValue: item.productSnapshot?.price || item.product.price_incl_tax,
                        image: item.productSnapshot?.image || item.product.image || '/assets/images/Screenshot_4.png',
                        category: item.productSnapshot?.category || item.product.category,
                        brand: item.productSnapshot?.brand || item.product.brand,
                        reference: item.productSnapshot?.reference || item.product.reference, status: item.state === 2 ? 'purchased' : item.state === 1 ? 'reserved' : 'available',
                        state: item.state || 0,
                        priority: item.priority
                    }))
                });
                // Extract unique categories from products
                const uniqueCategories = ['Todos'];
                birthListData.items.forEach(item => {
                    if (item.product.category && !uniqueCategories.includes(item.product.category)) {
                        uniqueCategories.push(item.product.category);
                    }
                });
                setAvailableCategories(uniqueCategories);
            } catch (error) {
                console.error('Error fetching birth list:', error);
                setError(error.message || 'Error al cargar la lista de nacimiento');
                toast.error('Error al cargar la lista de nacimiento');
            } finally {
                setLoading(false);
            }
        };
        fetchBirthList();
    }, [id]);
    // Loading state
    if (loading) {
        return (
            <ShopLayout>
                <div className="relative w-full h-[35vh] bg-gray-100 animate-pulse">
                    <div className="absolute inset-0 mt-20">
                        <div className="container mx-auto h-full flex flex-col items-center justify-center px-4">
                            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-56"></div>
                        </div>
                    </div>
                </div>
                <div className="container mx-auto px-4 py-8">
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8 animate-pulse">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                            <div className="w-full md:w-2/3 mb-4 md:mb-0">
                                <div className="flex justify-between mb-2">
                                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2"></div>
                            </div>
                            <div className="h-10 bg-gray-200 rounded-full w-40"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {[...Array(10)].map((_, index) => (
                            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
                                <div className="relative aspect-square bg-gray-200"></div>
                                <div className="p-4">
                                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                                    <div className="h-10 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </ShopLayout>
        );
    }
    // Error state
    if (error) {
        return (
            <ShopLayout>
                <div className="container mx-auto px-4 py-36">
                    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
                        <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Error al cargar la lista</h3>
                        <p className="text-gray-500 mb-6">{error}</p>
                        <Link href="/listas-de-nacimiento" className="px-4 py-2 bg-[#00B0C8] text-white rounded-md hover:bg-[#008da0] transition-colors">
                            Volver a las listas
                        </Link>
                    </div>
                </div>
            </ShopLayout>
        );
    }
    if (!list) {
        return (
            <ShopLayout>
                <div className="container mx-auto px-4 py-36">
                    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Lista no encontrada</h3>
                        <p className="text-gray-500 mb-6">No se pudo encontrar la lista de regalos solicitada.</p>
                        <Link href="/listas-de-nacimiento" className="px-4 py-2 bg-[#00B0C8] text-white rounded-md hover:bg-[#008da0] transition-colors">
                            Volver a las listas
                        </Link>
                    </div>
                </div>
            </ShopLayout>
        );
    }
    const filteredProducts = list.products
        .filter(product => selectedCategory === "Todos" || product.category === selectedCategory)
        .sort((a, b) => {
            switch (sortBy) {
                case "price-asc":
                    return a.priceValue - b.priceValue;
                case "price-desc":
                    return b.priceValue - a.priceValue;
                case "name":
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        }); const handleReserveClick = async (product) => {
            try {
                // Validate required gift information
                if (!list.userId) {
                    console.error('Missing list owner ID');
                    toast.error('Error: No se puede identificar el propietario de la lista');
                    return;
                }

                // Format product for unified cart structure 
                const productForCart = {
                    id: product.productId,
                    name: product.name,
                    price: product.priceValue,
                    image: product.image,
                    brand: product.brand || '',
                    category: product.category || '',
                    type: 'gift',
                    listInfo: {
                        listId: id,
                        itemId: product.id,
                        babyName: list.babyName,
                        listOwnerId: list.userId,
                        status: 'reserved',
                        state: 1, // 1 = reserved
                        addedAt: new Date().toISOString(),
                        price: product.priceValue,
                        priority: product.priority || 0
                    }
                };

                const success = await addToCart(productForCart, 1); if (success) {
                    toast.success('Regalo añadido al carrito');
                } else {
                    toast.error('No se pudo añadir el regalo al carrito');
                }
            } catch (error) {
                console.error('Error adding gift to cart:', error);
                toast.error(error.message || 'Error al añadir el regalo al carrito');
            }
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
                    alt={list?.babyName}
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 mt-20 font-medium">
                    <div className="container mx-auto h-full flex flex-col items-center justify-center px-4 text-center">
                        <motion.h1
                            className="text-4xl font-bold text-zinc-900 mb-4"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                        >
                            Lista de {list?.babyName}
                        </motion.h1>
                        <motion.p
                            className="text-lg text-zinc-900 mb-2"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            {list?.parents}
                        </motion.p>
                        <motion.p
                            className="text-zinc-900 "
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            Fecha prevista: {list && new Date(list.dueDate).toLocaleDateString('es-ES')}
                        </motion.p>
                    </div>
                </div>
            </div>
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                        <div className="w-full md:w-2/3 mb-4 md:mb-0">                <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Regalos comprados</span>
                            <span className="font-medium">{list.progress}%</span>
                        </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-[#00B0C8] h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${list.progress}%` }}
                                    title={`${list.progress}% de los regalos han sido comprados`}
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
                    <div className="w-full md:w-auto mb-4 md:mb-0 overflow-x-auto">
                        <div className="inline-flex border border-gray-200 rounded-lg p-1 min-w-max bg-gray-50">
                            {availableCategories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedCategory === category
                                        ? 'bg-[#00B0C8] text-white shadow-sm'
                                        : 'bg-transparent text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md"
                    >
                        <option value="default">Ordenar por</option>
                        <option value="price-asc">Precio: menor a mayor</option>
                        <option value="price-desc">Precio: mayor a menor</option>
                        <option value="name">Nombre</option>
                    </select> */}
                </div>
                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <motion.div
                                key={product.id}
                                className="bg-white rounded-lg overflow-hidden shadow-sm flex flex-col h-full"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -3 }}
                            >
                                <div className="relative w-full" style={{ aspectRatio: '1/0.8' }}>
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-contain"
                                    />                                    {product.status !== 'available' && (
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center transition-all duration-300">
                                            <div className=" px-4 py-2 rounded-lg">
                                                <span className="text-white text-lg font-medium uppercase tracking-wider">
                                                    {product.status === 'purchased' ? 'Comprado' : 'Reservado'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 flex flex-col flex-grow justify-between">
                                    <div>
                                        <h3 className="text-sm font-medium mb-1 h-10 line-clamp-2">{product.name}</h3>
                                        <p className="text-gray-600 text-sm mb-2">{product.price}</p>
                                    </div>
                                    <div>
                                        {product.status === 'available' ? (
                                            <button
                                                onClick={() => handleReserveClick(product)}
                                                className="w-full bg-[#00B0C8] text-white py-1.5 text-sm rounded-md hover:bg-[#0090a8] transition-colors"
                                            >
                                                Añadir al carrito
                                            </button>
                                        ) : (
                                            <div className="text-center py-1.5 bg-gray-100 rounded-md">
                                                <span className="text-sm text-gray-600">
                                                    {product.status === 'purchased' ? 'Comprado' : 'Reservado'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <p className="text-gray-500">No se encontraron productos en esta categoría.</p>
                        </div>
                    )}
                </div>
            </div>
        </ShopLayout>
    );
}