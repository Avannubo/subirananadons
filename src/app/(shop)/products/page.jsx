'use client';

import ShopLayout from "@/components/Layouts/shop-layout";
import Image from "next/image";
import ProductCard from "@/components/products/product-card";
import ProductQuickView from "@/components/products/product-quick-view";
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Helper function to parse price string to number
const parsePrice = (priceString) => {
    return parseFloat(priceString.replace(" €", "").replace(",", "."));
};

// Sample product data with descriptions, hover images, sales count, and parsed price
const products = [
    {
        id: 1,
        name: "Robot De Cuina Chefy6",
        price: "119,00 €",
        priceValue: parsePrice("119,00 €"),
        salesCount: 50, // Placeholder sales data
        imageUrl: "/assets/images/screenshot_3.png",
        imageUrlHover: "/assets/images/screenshot_2.png",
        description: "¡ Nuevo modelo! chefy 6 es un completo robot de cocina para bebés multifuncional 6 en 1, de diseño compacto y con grandes prestaciones. Además,..."
    },
    {
        id: 2,
        name: "Bolso Trona De Viaje Arlo...",
        price: "49,90 €",
        priceValue: parsePrice("49,90 €"),
        salesCount: 75,
        imageUrl: "/assets/images/screenshot_3.png",
        imageUrlHover: "/assets/images/screenshot_2.png",
        description: "Arlo es un asiento elevador ultra ligero. Perfecto para cualquier situación ya que se puede usar como elevador y bolso/mochila de viaje,..."
    },
    {
        id: 3,
        name: "Tripp Trapp Natural",
        price: "259,00 €",
        priceValue: parsePrice("259,00 €"),
        salesCount: 30,
        imageUrl: "/assets/images/screenshot_3.png",
        imageUrlHover: "/assets/images/screenshot_2.png",
        description: "La trona que crece con el niño. Desde el nacimiento. Tripp Trapp® es una ingeniosa trona que revolucionó la categoría infantil en 1972,..."
    },
    {
        id: 4,
        name: "Termo papillero",
        price: "24,90 €",
        priceValue: parsePrice("24,90 €"),
        salesCount: 120,
        imageUrl: "/assets/images/screenshot_3.png",
        imageUrlHover: "/assets/images/screenshot_2.png",
        description: "Termo para alimentos sólidos de acero inoxidable, ideal para llevar la comida del bebé. Mantiene la temperatura durante horas."
    },
    {
        id: 5,
        name: "Biberón aprendizaje",
        price: "12,90 €",
        priceValue: parsePrice("12,90 €"),
        salesCount: 90,
        imageUrl: "/assets/images/screenshot_3.png",
        imageUrlHover: "/assets/images/screenshot_2.png",
        description: "Biberón con asas y boquilla de silicona suave, diseñado para facilitar la transición del biberón al vaso."
    },
    {
        id: 6,
        name: "Newborn Set para Tripp Trapp",
        price: "99,00 €",
        priceValue: parsePrice("99,00 €"),
        salesCount: 45,
        imageUrl: "/assets/images/screenshot_3.png",
        imageUrlHover: "/assets/images/screenshot_2.png",
        description: "Permite usar la trona Tripp Trapp® desde el nacimiento. Acogedor y ergonómico para el recién nacido."
    }
];

export default function Page() {
    const [viewMode, setViewMode] = useState('grid');
    const [sortOrder, setSortOrder] = useState('sales-desc'); // State for sorting
    const [quickViewProduct, setQuickViewProduct] = useState(null); // State for quick view

    // Memoize the sorted products array
    const sortedProducts = useMemo(() => {
        const sortableProducts = [...products]; // Create a shallow copy
        switch (sortOrder) {
            case 'price-asc':
                sortableProducts.sort((a, b) => a.priceValue - b.priceValue);
                break;
            case 'price-desc':
                sortableProducts.sort((a, b) => b.priceValue - a.priceValue);
                break;
            case 'name-asc':
                sortableProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                sortableProducts.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'sales-desc':
            default:
                sortableProducts.sort((a, b) => b.salesCount - a.salesCount);
                break;
        }
        return sortableProducts;
    }, [sortOrder]); // Re-sort only when sortOrder changes

    const handleSortChange = (event) => {
        setSortOrder(event.target.value);
    };

    // Open quick view modal
    const handleOpenQuickView = (product) => {
        setQuickViewProduct(product);
    };

    // Close quick view modal
    const handleCloseQuickView = () => {
        setQuickViewProduct(null);
    };

    return (
        <ShopLayout>
            <div className="relative w-full h-full flex flex-col justify-start items-start mt-20">
                <Image src="/assets/images/bg-beagrumb.jpg" alt="logo" className="w-full h-[20vh] object-cover" width={2010} height={2010} />
                <div className="absolute inset-0 flex items-center mt-14 justify-center">
                        <h1 className="text-4xl text-zinc-800 font-bold">Tienda</h1> 
                </div>
            </div>
            <div className="container w-full max-w-6xl mx-auto px-4 py-8  ">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-2">
                        {/* Grid/List view toggle icons */}
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 ${viewMode === 'grid' ? 'text-black' : 'text-gray-400'} hover:text-black`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 ${viewMode === 'list' ? 'text-black' : 'text-gray-400'} hover:text-black`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                    </div>
                    <div className="flex items-center">
                        <label htmlFor="sort-by" className="mr-2 text-gray-600">Ordenar por:</label>
                        <select
                            id="sort-by"
                            className="border rounded p-2 text-gray-600"
                            value={sortOrder} // Bind value to state
                            onChange={handleSortChange} // Add onChange handler
                        >
                            <option value="sales-desc">Ventas en orden decreciente</option>
                            <option value="price-asc">Precio: más bajo primero</option>
                            <option value="price-desc">Precio: más alto primero</option>
                            <option value="name-asc">Nombre: A-Z</option>
                            <option value="name-desc">Nombre: Z-A</option>
                        </select>
                    </div>
                </div>

                {/* Product List/Grid Container */}
                <motion.div
                    layout
                    className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6' : 'flex flex-col space-y-6'}`}
                >
                    <AnimatePresence>
                        {sortedProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                viewMode={viewMode}
                                onQuickViewClick={handleOpenQuickView} // Pass handler to card
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Render Quick View Modal */}
            {quickViewProduct && (
                <ProductQuickView
                    product={quickViewProduct}
                    onClose={handleCloseQuickView}
                />
            )}
        </ShopLayout>
    );
}