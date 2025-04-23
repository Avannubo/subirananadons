'use client';

import { useEffect, useState } from 'react';
import ShopLayout from "@/components/Layouts/shop-layout";
import Image from "next/image";
import Link from "next/link";
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';

// Sample cart data
const initialCartItems = [
    {
        id: 1,
        name: "Tripp Trapp Natural",
        price: "259,00 €",
        priceValue: 259.00,
        quantity: 1,
        imageUrl: "/assets/images/screenshot_1.png",
        brand: "Stokke",
        category: "Habitación"
    },
    {
        id: 2,
        name: "Tripp Trapp Natural",
        price: "259,00 €",
        priceValue: 259.00,
        quantity: 1,
        imageUrl: "/assets/images/screenshot_1.png",
        brand: "Stokke",
        category: "Habitación"
    },
    {
        id: 4,
        name: "Stokke Xplory X Royal Blue",
        price: "1099,00 €",
        priceValue: 1099.00,
        quantity: 1,
        imageUrl: "/assets/images/screenshot_2.png",
        brand: "Stokke",
        category: "Cochecitos"
    }
];

export default function CartPage() {
    const { cartItems, updateQuantity, removeItem } = useCart();
    const [deliveryMethod, setDeliveryMethod] = useState('delivery');
    const [formData, setFormData] = useState({
        name: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        province: '',
        country: 'España',
        notes: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDeliveryMethodChange = (method) => {
        setDeliveryMethod(method);
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((sum, item) => sum + (item.priceValue * item.quantity), 0);
    };

    const calculateShipping = () => {
        const subtotal = calculateSubtotal();
        if (deliveryMethod === 'pickup') return 0;
        return subtotal > 60 ? 0 : 5.99;
    };

    const calculateTax = () => {
        return calculateSubtotal() * 0.21;
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateShipping() + calculateTax();
    };

    return (
        <ShopLayout>
            <div className="container mx-auto px-4 py-8 mt-24 ">
                <h1 className="text-3xl font-bold mb-8 text-zinc-900">Carrito de compra</h1>

                {cartItems.length > 0 ? (
                    <>
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Left Column - User Information */}
                            <div className="lg:w-1/2">
                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    <h2 className="text-xl font-bold mb-6">Datos de Envío</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nombre
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B0C8]"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Apellidos
                                            </label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B0C8]"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B0C8]"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Teléfono
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B0C8]"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Dirección
                                            </label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B0C8]"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Ciudad
                                            </label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B0C8]"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Código Postal
                                            </label>
                                            <input
                                                type="text"
                                                name="postalCode"
                                                value={formData.postalCode}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B0C8]"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Provincia
                                            </label>
                                            <input
                                                type="text"
                                                name="province"
                                                value={formData.province}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B0C8]"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Notas del pedido (opcional)
                                            </label>
                                            <textarea
                                                name="notes"
                                                value={formData.notes}
                                                onChange={handleInputChange}
                                                rows="4"
                                                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B0C8]"
                                                placeholder="Notas sobre tu pedido, por ejemplo, notas especiales para la entrega."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Products */}
                            <div className="lg:w-1/2 flex flex-col">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                    <h2 className="text-xl font-bold p-6 border-b border-gray-200">Tu pedido</h2>
                                    {cartItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-4 p-4 border-b border-gray-200 last:border-b-0"
                                        >
                                            <div className="relative w-20 h-20">
                                                <Image
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover rounded-md"
                                                />
                                            </div>
                                            <div className="flex-grow">
                                                <h3 className="font-medium">{item.name}</h3>
                                                <p className="text-gray-500 text-sm">{item.brand} - {item.category}</p>
                                                <p className="text-[#00B0C8] font-medium">{item.price}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-100"
                                                >
                                                    -
                                                </button>
                                                <span className="w-8 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-100"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Delivery Method Selection */}
                                <div className="bg-white rounded-lg shadow-sm p-6 mt-4 border border-gray-200">
                                    <h2 className="text-xl font-bold mb-4">Método de entrega</h2>
                                    <div className="space-y-4">
                                        <div
                                            className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${deliveryMethod === 'delivery'
                                                ? 'border-[#00B0C8] bg-[#00B0C8]/5'
                                                : 'border-gray-200 hover:border-[#00B0C8]'
                                                }`}
                                            onClick={() => handleDeliveryMethodChange('delivery')}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${deliveryMethod === 'delivery' ? 'border-[#00B0C8]' : 'border-gray-400'
                                                    }`}>
                                                    {deliveryMethod === 'delivery' && (
                                                        <div className="w-2.5 h-2.5 rounded-full bg-[#00B0C8]" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium">Envío a domicilio</p>
                                                    <p className="text-sm text-gray-500">Entrega en 24-48 horas laborables</p>
                                                </div>
                                            </div>
                                            <span className="text-[#00B0C8] font-medium">
                                                {calculateSubtotal() < 60 ? 'Gratis' : '5,99 €'}
                                            </span>
                                        </div>

                                        <div
                                            className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${deliveryMethod === 'pickup'
                                                ? 'border-[#00B0C8] bg-[#00B0C8]/5'
                                                : 'border-gray-200 hover:border-[#00B0C8]'
                                                }`}
                                            onClick={() => handleDeliveryMethodChange('pickup')}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${deliveryMethod === 'pickup' ? 'border-[#00B0C8]' : 'border-gray-400'
                                                    }`}>
                                                    {deliveryMethod === 'pickup' && (
                                                        <div className="w-2.5 h-2.5 rounded-full bg-[#00B0C8]" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium">Recoger en tienda</p>
                                                    <p className="text-sm text-gray-500">Disponible en 2-4 horas</p>
                                                </div>
                                            </div>
                                            <span className="text-[#00B0C8] font-medium">Gratis</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div className="bg-white rounded-lg shadow-sm p-6 mt-4 border border-gray-200">
                                    <h2 className="text-xl font-bold mb-4">Resumen del pedido</h2>
                                    <div className="flex flex-col justify-between items-end gap-4">
                                        <div className="w-full space-y-3">
                                            <div className="flex justify-between">
                                                <span>Subtotal</span>
                                                <span>{calculateSubtotal().toFixed(2)} €</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Envío</span>
                                                <span>{calculateShipping().toFixed(2)} €</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>IVA (21%)</span>
                                                <span>{calculateTax().toFixed(2)} €</span>
                                            </div>
                                            <div className="border-t border-gray-200 pt-3 mt-3">
                                                <div className="flex justify-between font-bold">
                                                    <span>Total</span>
                                                    <span>{calculateTotal().toFixed(2)} €</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full">
                                            <button className="w-full bg-[#00B0C8] text-white py-3 px-6 rounded-md hover:bg-[#0090a8] transition-colors duration-300">
                                                Finalizar compra
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <motion.div
                        className="text-center py-16"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <h2 className="text-2xl font-bold mb-4">Tu carrito está vacío</h2>
                        <p className="text-gray-500 mb-8">¿No sabes qué comprar? ¡Miles de productos te esperan!</p>
                        <Link
                            href="/products"
                            className="inline-block bg-[#00B0C8] text-white py-3 px-6 rounded-md hover:bg-[#0090a8] transition-colors duration-300"
                        >
                            Continuar comprando
                        </Link>
                    </motion.div>
                )}
            </div>
        </ShopLayout>
    );
} 