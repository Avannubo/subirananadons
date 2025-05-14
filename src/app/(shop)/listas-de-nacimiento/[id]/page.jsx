'use client';
import { useState, useEffect } from 'react';
import { use } from 'react';
import ShopLayout from "@/components/Layouts/shop-layout";
import Image from "next/image";
import Link from "next/link";
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

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
    const [showReserveModal, setShowReserveModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [purchaseForm, setPurchaseForm] = useState({
        buyerName: '',
        buyerEmail: '',
        buyerPhone: '',
        quantity: 1,
        paymentMethod: 'store'
    });
    const [purchaseLoading, setPurchaseLoading] = useState(false);
    const [purchaseStep, setPurchaseStep] = useState(1);
    const [purchaseSuccess, setPurchaseSuccess] = useState(false);
    const [purchaseError, setPurchaseError] = useState(null);

    // Calculate progress percentage based on reserved/purchased items
    const calculateProgress = (items) => {
        if (!items || items.length === 0) return 0;
        let reservedTotal = 0;
        let quantityTotal = 0;

        items.forEach(item => {
            reservedTotal += item.reserved || 0;
            quantityTotal += item.quantity || 0;
        });

        return quantityTotal > 0 ? Math.round((reservedTotal / quantityTotal) * 100) : 0;
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
                        name: item.product.name,
                        price: `${item.product.price_incl_tax.toFixed(2).replace('.', ',')} €`,
                        priceValue: item.product.price_incl_tax,
                        image: item.product.image || '/assets/images/default-product.png',
                        category: item.product.category,
                        status: item.reserved >= item.quantity ? 'purchased' : 'available',
                        quantity: item.quantity,
                        reserved: item.reserved,
                        priority: item.priority
                    }))
                });
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, index) => (
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
                <div className="container mx-auto px-4 py-16">
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
                <div className="container mx-auto px-4 py-16">
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
        });

    const handleReserveClick = (product) => {
        setSelectedProduct(product);
        // Reset purchase form and state
        setPurchaseForm({
            buyerName: '',
            buyerEmail: '',
            buyerPhone: '',
            quantity: 1,
            paymentMethod: 'store'
        });
        setPurchaseStep(1);
        setPurchaseSuccess(false);
        setPurchaseError(null);
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

    // Handle purchase form input changes
    const handlePurchaseChange = (e) => {
        const { name, value, type } = e.target;
        setPurchaseForm(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value, 10) : value
        }));
    };

    // Handle purchase submission
    const handlePurchaseSubmit = async (e) => {
        e.preventDefault();

        try {
            setPurchaseLoading(true);
            setPurchaseError(null);

            // Validate form
            if (!purchaseForm.buyerName || !purchaseForm.buyerEmail) {
                setPurchaseError('Por favor completa todos los campos obligatorios');
                return;
            }

            // Make API request to purchase the gift
            const response = await fetch(`/api/birthlists/${id}/purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    itemId: selectedProduct.id,
                    ...purchaseForm
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al procesar la compra');
            }

            if (!data.success) {
                throw new Error(data.message || 'Error al procesar la compra');
            }

            // Success - update UI
            setPurchaseSuccess(true);
            setPurchaseStep(2);

            // Update list data to reflect the purchase
            setList(prevList => {
                const updatedProducts = prevList.products.map(product => {
                    if (product.id === selectedProduct.id) {
                        return {
                            ...product,
                            reserved: (product.reserved || 0) + purchaseForm.quantity,
                            status: ((product.reserved || 0) + purchaseForm.quantity) >= product.quantity ? 'purchased' : 'available'
                        };
                    }
                    return product;
                });

                // Calculate new progress
                const totalItems = updatedProducts.reduce((sum, p) => sum + p.quantity, 0);
                const reservedItems = updatedProducts.reduce((sum, p) => sum + (p.reserved || 0), 0);
                const progress = totalItems > 0 ? Math.round((reservedItems / totalItems) * 100) : 0;

                return {
                    ...prevList,
                    products: updatedProducts,
                    progress
                };
            });

            // Show success toast
            toast.success('¡Regalo reservado con éxito!');

        } catch (error) {
            console.error('Error purchasing gift:', error);
            setPurchaseError(error.message || 'Ha ocurrido un error al procesar tu compra');
            toast.error('Error al procesar la compra');
        } finally {
            setPurchaseLoading(false);
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
                <div className="absolute inset-0 mt-20 font-medium">
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
                            className="text-zinc-900 "
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
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
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
                                        placeholder="blur"
                                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEDQIHq4C7sgAAAABJRU5ErkJggg=="
                                    />
                                    {product.status !== 'available' && (
                                        <div className="absolute inset-0 bg-[#00000080] flex items-center justify-center">
                                            <span className="text-white text-2xl font-medium">
                                                Comprado
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
                                            Comprado ({product.reserved} de {product.quantity})
                                        </div>
                                    )}
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

            {/* Reserve Modal - Now with purchase functionality */}
            {showReserveModal && selectedProduct && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-[#00000050] flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            {purchaseStep === 1 ? (
                                <>
                                    <h2 className="text-2xl font-bold mb-4">Comprar Regalo</h2>
                                    <p className="mb-6">Completa tus datos para reservar este regalo para {list.babyName}</p>

                                    <div className="flex items-center p-4 bg-gray-50 rounded-lg mb-6">
                                        <div className="relative w-20 h-20 mr-4">
                                            <Image
                                                src={selectedProduct.image}
                                                alt={selectedProduct.name}
                                                fill
                                                className="object-cover rounded"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{selectedProduct.name}</h3>
                                            <p className="text-[#00B0C8] font-bold">{selectedProduct.price}</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Disponible: {selectedProduct.quantity - selectedProduct.reserved} de {selectedProduct.quantity}
                                            </p>
                                        </div>
                                    </div>

                                    {purchaseError && (
                                        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                                            {purchaseError}
                                        </div>
                                    )}

                                    <form onSubmit={handlePurchaseSubmit} className="space-y-4">
                                        <div>
                                            <label htmlFor="buyerName" className="block text-sm font-medium text-gray-700 mb-1">
                                                Nombre completo <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="buyerName"
                                                name="buyerName"
                                                value={purchaseForm.buyerName}
                                                onChange={handlePurchaseChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="buyerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                                Correo electrónico <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                id="buyerEmail"
                                                name="buyerEmail"
                                                value={purchaseForm.buyerEmail}
                                                onChange={handlePurchaseChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="buyerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                                                Teléfono
                                            </label>
                                            <input
                                                type="tel"
                                                id="buyerPhone"
                                                name="buyerPhone"
                                                value={purchaseForm.buyerPhone}
                                                onChange={handlePurchaseChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                                                Cantidad
                                            </label>
                                            <input
                                                type="number"
                                                id="quantity"
                                                name="quantity"
                                                min="1"
                                                max={selectedProduct.quantity - selectedProduct.reserved}
                                                value={purchaseForm.quantity}
                                                onChange={handlePurchaseChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Método de pago
                                            </label>
                                            <div className="space-y-2">
                                                <div className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        id="store"
                                                        name="paymentMethod"
                                                        value="store"
                                                        checked={purchaseForm.paymentMethod === 'store'}
                                                        onChange={handlePurchaseChange}
                                                        className="h-4 w-4 text-[#00B0C8] focus:ring-[#00B0C860]"
                                                    />
                                                    <label htmlFor="store" className="ml-2 text-sm text-gray-700">
                                                        Pagar en tienda al recoger
                                                    </label>
                                                </div>
                                                <div className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        id="online"
                                                        name="paymentMethod"
                                                        value="online"
                                                        checked={purchaseForm.paymentMethod === 'online'}
                                                        onChange={handlePurchaseChange}
                                                        className="h-4 w-4 text-[#00B0C8] focus:ring-[#00B0C860]"
                                                    />
                                                    <label htmlFor="online" className="ml-2 text-sm text-gray-700">
                                                        Pagar ahora online
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end space-x-3 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setShowReserveModal(false)}
                                                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
                                                disabled={purchaseLoading}
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                className={`px-4 py-2 bg-[#00B0C8] text-white rounded hover:bg-[#0090a8] transition-colors ${purchaseLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                disabled={purchaseLoading}
                                            >
                                                {purchaseLoading ? 'Procesando...' : purchaseForm.paymentMethod === 'store' ? 'Reservar Regalo' : 'Continuar al Pago'}
                                            </button>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <>
                                    <div className="text-center py-4">
                                        <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <h2 className="text-2xl font-bold mb-2">¡Regalo Reservado!</h2>
                                        <p className="text-gray-600 mb-6">
                                            {purchaseForm.paymentMethod === 'store' ? (
                                                'Tu regalo ha sido reservado. Puedes pasar a recogerlo y pagarlo en nuestra tienda.'
                                            ) : (
                                                'Tu regalo ha sido reservado. Ahora serás redirigido al proceso de pago.'
                                            )}
                                        </p>

                                        <div className="bg-gray-50 p-4 rounded-md mb-6 text-left">
                                            <p className="font-medium">Detalles:</p>
                                            <ul className="mt-2 space-y-1 text-sm text-gray-600">
                                                <li><span className="font-medium">Regalo:</span> {selectedProduct.name}</li>
                                                <li><span className="font-medium">Cantidad:</span> {purchaseForm.quantity}</li>
                                                <li><span className="font-medium">Total:</span> {(selectedProduct.priceValue * purchaseForm.quantity).toFixed(2).replace('.', ',')} €</li>
                                                <li><span className="font-medium">Para:</span> {list.babyName}</li>
                                            </ul>
                                        </div>

                                        <div className="flex justify-center space-x-3">
                                            <button
                                                onClick={() => setShowReserveModal(false)}
                                                className="px-6 py-2 bg-[#00B0C8] text-white rounded hover:bg-[#0090a8]"
                                            >
                                                {purchaseForm.paymentMethod === 'online' ? 'Proceder al Pago' : 'Aceptar'}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </ShopLayout>
    );
} 