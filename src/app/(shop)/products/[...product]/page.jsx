'use client';

import { useState } from 'react';
import ShopLayout from "@/components/Layouts/shop-layout";
import Image from "next/image";
import { motion } from 'framer-motion';
import ProductSlider from '@/components/landing/ProductSlider';
// Sample product data - in production this would come from an API or database
const product = {
    id: 1,
    name: "BAJERA CAPAZO CON SACA BABITAS LIBÉLULAS",
    price: "22,85 €",
    description: "Bajera ajustable de punto algodón Orgánico con babitas estampado y reverso suave rizo impermeable para evitar que las babitas de tu bebé humedezcan el colchón o saquito.",
    details: {
        dimensions: "40 X 80",
        washingInstructions: "Lavar a máquina 30º, Plancha suave, Apto para secadora"
    },
    images: [
        "/assets/images/screenshot_3.png",
        "/assets/images/screenshot_2.png"
    ],
    category: "Habitación"
};
const relatedProducts = [
    {
        id: 1,
        name: 'Tripp Trapp Natural',
        price: '259,00 €',
        priceValue: 259.00,
        imageUrl: '/assets/images/screenshot_1.png',
        imageUrlHover: '/assets/images/screenshot_3.png',
        category: 'Habitación',
        brand: 'Stokke',
        description: 'La trona que crece con tu hijo'
    },
    {
        id: 2,
        name: 'Stokke Xplory X Royal Blue',
        price: '1099,00 €',
        priceValue: 1099.00,
        imageUrl: '/assets/images/screenshot_2.png',
        imageUrlHover: '/assets/images/screenshot_3.png',
        category: 'Cochecitos',
        brand: 'Stokke',
        description: 'Cochecito premium con diseño elegante'
    },
    {
        id: 3,
        name: 'Cuna Sleepi Natural',
        price: '799,00 €',
        priceValue: 799.00,
        imageUrl: '/assets/images/screenshot_3.png',
        imageUrlHover: '/assets/images/screenshot_4.png',
        category: 'Habitación',
        brand: 'Stokke',
        description: 'Cuna evolutiva que se adapta al crecimiento'
    },
    {
        id: 4,
        name: 'Saco Xplory X Royal Blue',
        price: '169,00 €',
        priceValue: 169.00,
        imageUrl: '/assets/images/screenshot_4.png',
        imageUrlHover: '/assets/images/screenshot_1.png',
        category: 'Accesorios',
        brand: 'Stokke',
        description: 'Saco de invierno para cochecito'
    },
    {
        id: 5,
        name: 'Steps Bouncer Gris',
        price: '199,00 €',
        priceValue: 199.00,
        imageUrl: '/assets/images/screenshot_1.png',
        imageUrlHover: '/assets/images/screenshot_2.png',
        category: 'Habitación',
        brand: 'Stokke',
        description: 'Hamaca ergonómica para bebés'
    },
    {
        id: 6,
        name: 'Cambiador Sleepi Natural',
        price: '89,00 €',
        priceValue: 89.00,
        imageUrl: '/assets/images/screenshot_3.png',
        imageUrlHover: '/assets/images/screenshot_4.png',
        category: 'Habitación',
        brand: 'Stokke',
        description: 'Cambiador para cuna Sleepi'
    },
    {
        id: 7,
        name: 'Organizador Xplory X',
        price: '39,00 €',
        priceValue: 39.00,
        imageUrl: '/assets/images/screenshot_2.png',
        imageUrlHover: '/assets/images/screenshot_1.png',
        category: 'Accesorios',
        brand: 'Stokke',
        description: 'Organizador para cochecito'
    },
    {
        id: 8,
        name: 'Cojín Steps Baby',
        price: '49,00 €',
        priceValue: 49.00,
        imageUrl: '/assets/images/screenshot_3.png',
        imageUrlHover: '/assets/images/screenshot_2.png',
        category: 'Accesorios',
        brand: 'Stokke',
        description: 'Cojín para trona Steps'
    }
];

export default function Page() {
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('DETALLES DEL PRODUCTO');

    const handleQuantityChange = (change) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1) {
            setQuantity(newQuantity);
        }
    };

    return (
        <ShopLayout>
            <div className="container mx-auto px-4 py-8  mt-22">
                {/* Breadcrumb */}
                {/* <nav className="mb-8">
                    <ol className="flex items-center space-x-2 text-sm text-gray-500">
                        <li><a href="/products" className="hover:text-gray-700">Productos</a></li>
                        <li><span className="mx-2">/</span></li>
                        <li><a href="#" className="hover:text-gray-700">{product.category}</a></li>
                        <li><span className="mx-2">/</span></li>
                        <li className="text-gray-900 font-medium">{product.name}</li>
                    </ol>
                </nav>*/}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Product Images */}
                    <div className="space-y-4">
                        <motion.div
                            className="relative w-full h-[600px] overflow-hidden rounded-lg bg-gray-100"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Image
                                src={product.images[selectedImage]}
                                alt={product.name}
                                fill
                                className="object-cover "
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </motion.div>
                        <div className="flex space-x-4">
                            {product.images.map((image, index) => (
                                <button
                                    key={index}
                                    className={`relative w-20 h-20 rounded-md overflow-hidden ${selectedImage === index ? 'ring-2 ring-[#00B0C8]' : 'ring-1 ring-gray-200'
                                        }`}
                                    onClick={() => setSelectedImage(index)}
                                >
                                    <Image
                                        src={image}
                                        alt={`${product.name} ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                        <p className="text-2xl font-semibold text-gray-900">{product.price}</p>

                        <div className="space-y-4">
                            <p className="text-gray-600">{product.description}</p>

                            <div className="py-4">
                                <h3 className="font-bold text-gray-900 mb-2">Detalles del producto</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-600">
                                    <li>Dimensiones: {product.details.dimensions}</li>
                                    <li>Instrucciones de lavado: {product.details.washingInstructions}</li>
                                </ul>
                            </div>

                            {/* Quantity Selector */}
                            <div className="flex items-center space-x-4 ">
                                <span className="text-gray-700">Cantidad:</span>
                                <div className="flex items-center border border-gray-300 rounded-md">
                                    <button
                                        onClick={() => handleQuantityChange(-1)}
                                        className="px-3 py-1 text-gray-600"
                                    >
                                        -
                                    </button>
                                    <span className="px-4 py-1 border-x border-gray-300">{quantity}</span>
                                    <button
                                        onClick={() => handleQuantityChange(1)}
                                        className="px-3 py-1 text-gray-600 "
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Add to Cart Button */}
                            <button className="w-full bg-[#00B0C8] text-white py-3 px-6 rounded-md hover:bg-[#009bb1] transition-colors duration-200">
                                Añadir al carrito
                            </button>

                            {/* Wishlist Button */}
                            <button className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                Añadir a mi lista
                            </button>
                        </div>
                    </div>
                </div>

                {/* Product Details Tabs */}
                <div className="mt-16">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {['DESCRIPCIÓN', 'DETALLES DEL PRODUCTO'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`${activeTab === tab
                                        ? 'border-[#00B0C8] text-[#00B0C8]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="mt-6 pb-16 border-b border-gray-200">
                        {activeTab === 'DESCRIPCIÓN' && (
                            <div className="prose max-w-none">
                                <p className="text-gray-600">{product.description}</p>
                            </div>
                        )}
                        {activeTab === 'DETALLES DEL PRODUCTO' && (
                            <div className="prose max-w-none">
                                <ul className="list-disc list-inside space-y-2 text-gray-600">
                                    <li>Dimensiones: {product.details.dimensions}</li>
                                    <li>Instrucciones de lavado: {product.details.washingInstructions}</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                <div className="mt-16">
                    <ProductSlider
                        title="PRODUCTOS RELACIONADOS"
                        products={relatedProducts}
                        className="w-full"
                        slidesPerView={{
                            mobile: 1.5,
                            tablet: 2.5,
                            desktop: 4
                        }}
                    />
                </div>
            </div>
           
        </ShopLayout>
    );
}