'use client';

import { useState, useEffect } from 'react';
import ShopLayout from "@/components/Layouts/shop-layout";
import Image from "next/image";
import Link from "next/link";
import { motion } from 'framer-motion';
import ProductCard from "@/components/products/product-card";
import ProductQuickView from "@/components/products/product-quick-view";

// Helper function to parse price
const parsePrice = (price) => {
    return parseFloat(price.replace(/[^0-9,]/g, '').replace(',', '.'));
};

// Sample brands data - in production this would come from your API/database
const brands = [
    { id: 1, name: "Stokke", logo: "/assets/images/screenshot_1.png" },
    { id: 2, name: "Joie", logo: "/assets/images/screenshot_2.png" },
    { id: 3, name: "Cybex", logo: "/assets/images/screenshot_3.png" },
    { id: 4, name: "Bugaboo", logo: "/assets/images/screenshot_4.png" },
    { id: 5, name: "Babyzen", logo: "/assets/images/screenshot_1.png" },
    { id: 6, name: "Uppababy", logo: "/assets/images/screenshot_2.png" },
    { id: 7, name: "Nuna", logo: "/assets/images/screenshot_3.png" },
    { id: 8, name: "Silver Cross", logo: "/assets/images/screenshot_4.png" },
    { id: 9, name: "Maxi-Cosi", logo: "/assets/images/screenshot_1.png" },
    { id: 10, name: "Britax", logo: "/assets/images/screenshot_2.png" },
    { id: 11, name: "Chicco", logo: "/assets/images/screenshot_3.png" },
];

// Sample products data - in production this would come from your API/database
const products = [
    {
        id: 1,
        name: "Tripp Trapp Natural",
        category: "Habitación",
        price: "259,00 €",
        priceValue: parsePrice("259,00 €"),
        salesCount: 45,
        imageUrl: "/assets/images/screenshot_1.png",
        imageUrlHover: "/assets/images/screenshot_2.png",
        brand: "Stokke",
        description: "La silla que crece con tu hijo. Tripp Trapp® es una silla ergonómica de madera de haya que se puede usar desde el nacimiento."
    },
    {
        id: 2,
        name: "Newborn Set Tripp Trapp",
        category: "Habitación",
        price: "99,00 €",
        priceValue: parsePrice("99,00 €"),
        salesCount: 30,
        imageUrl: "/assets/images/screenshot_1.png",
        imageUrlHover: "/assets/images/screenshot_2.png",
        brand: "Stokke",
        description: "El Set Recién Nacido Tripp Trapp® es el primer asiento elevado ergonómico que permite a tu bebé sentarse cómodamente a la mesa."
    },
    {
        id: 3,
        name: "Trona De Viaje Arlo",
        category: "Alimentación",
        price: "49,90 €",
        priceValue: parsePrice("49,90 €"),
        salesCount: 25,
        imageUrl: "/assets/images/screenshot_1.png",
        imageUrlHover: "/assets/images/screenshot_2.png",
        brand: "Joie",
        description: "Trona de viaje compacta y ligera, perfecta para usar en casa o fuera. Fácil de plegar y transportar."
    },
    {
        id: 4,
        name: "Stokke Xplory X Royal Blue",
        category: "Cochecitos",
        price: "1099,00 €",
        priceValue: parsePrice("1099,00 €"),
        salesCount: 15,
        imageUrl: "/assets/images/screenshot_1.png",
        imageUrlHover: "/assets/images/screenshot_2.png",
        brand: "Stokke",
        description: "El cochecito más innovador con asiento elevado que acerca al bebé a sus padres. Diseño premium y máxima comodidad."
    },
    {
        id: 5,
        name: "Stokke Steps Chair Oak",
        category: "Habitación",
        price: "259,00 €",
        priceValue: parsePrice("259,00 €"),
        salesCount: 35,
        imageUrl: "/assets/images/screenshot_1.png",
        imageUrlHover: "/assets/images/screenshot_2.png",
        brand: "Stokke",
        description: "Sistema de asiento modular que evoluciona con tu hijo, desde recién nacido hasta niño. Fabricada en madera de roble natural."
    },
    {
        id: 6,
        name: "Stokke Clikk High Chair",
        category: "Habitación",
        price: "149,00 €",
        priceValue: parsePrice("149,00 €"),
        salesCount: 40,
        imageUrl: "/assets/images/screenshot_1.png",
        imageUrlHover: "/assets/images/screenshot_2.png",
        brand: "Stokke",
        description: "Trona moderna y funcional que se monta en un clic. Diseño ergonómico y fácil de limpiar."
    },
    {
        id: 7,
        name: "Stokke Sleepi Mini Bundle",
        category: "Habitación",
        price: "789,00 €",
        priceValue: parsePrice("789,00 €"),
        salesCount: 20,
        imageUrl: "/assets/images/screenshot_1.png",
        imageUrlHover: "/assets/images/screenshot_2.png",
        brand: "Stokke",
        description: "Cuna evolutiva que crece con tu bebé. Incluye colchón y extensión para convertirla en cama infantil."
    },
    {
        id: 8,
        name: "Stokke Flexi Bath",
        category: "Baño",
        price: "45,00 €",
        priceValue: parsePrice("45,00 €"),
        salesCount: 55,
        imageUrl: "/assets/images/screenshot_1.png",
        imageUrlHover: "/assets/images/screenshot_2.png",
        brand: "Stokke",
        description: "Bañera plegable perfecta para el baño diario. Compacta y fácil de guardar, ideal para espacios pequeños."
    },
    {
        id: 9,
        name: "Stokke JetKids BedBox",
        category: "Viaje",
        price: "159,00 €",
        priceValue: parsePrice("159,00 €"),
        salesCount: 28,
        imageUrl: "/assets/images/screenshot_1.png",
        imageUrlHover: "/assets/images/screenshot_2.png",
        brand: "Stokke",
        description: "Maleta-cama que hace que viajar con niños sea más fácil. Se convierte en una cama de avión para mayor comodidad."
    }
];

export default function BrandsPage() {
    const [selectedBrand, setSelectedBrand] = useState(brands[0].name);
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('default');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [quickViewProduct, setQuickViewProduct] = useState(null);

    useEffect(() => {
        let sorted = [...products].filter(product => !selectedBrand || product.brand === selectedBrand);

        switch (sortBy) {
            case 'price-asc':
                sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
                break;
            case 'price-desc':
                sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
                break;
            case 'name-asc':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'newest':
                sorted.reverse();
                break;
            default:
                break;
        }

        setFilteredProducts(sorted);
    }, [selectedBrand, sortBy]);

    const handleOpenQuickView = (product) => {
        setQuickViewProduct(product);
    };

    const handleCloseQuickView = () => {
        setQuickViewProduct(null);
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };

    return (
        <ShopLayout>
            {/* Header Image */}
            <motion.div
                className="relative w-full h-[30vh]  bg-gray-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Image
                    src="/assets/images/bg-beagrumb.jpg"
                    alt="Brands header"
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.h1
                        className="text-4xl font-bold text-zinc-900 mt-20"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        Marcas
                    </motion.h1>
                </div>
            </motion.div>

            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                {/*   <motion.nav
                    className="mb-8"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <ol className="flex items-center space-x-2 text-sm text-gray-500">
                        <li><Link href="/" className="hover:text-gray-700">Inicio</Link></li>
                        <li><span className="mx-2">/</span></li>
                        <li className="text-gray-900 font-medium">Marcas</li>
                    </ol>
                </motion.nav>*/}

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Brands Sidebar */}
                    <motion.div
                        className="w-full md:w-1/6"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        <div className="sticky top-24 bg-white">
                            <h2 className="font-medium text-lg mb-4 px-4">Marcas</h2>
                            <div className="max-h-[calc(100vh-450px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                <ul className="space-y-1">
                                    {brands.map((brand, index) => (
                                        <motion.li
                                            key={brand.id}
                                            className='hover:font-bold text-zinc-700 transition-all duration-300'
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 * index, duration: 0.5 }}
                                        >
                                            <button
                                                onClick={() => setSelectedBrand(brand.name)}
                                                className={`w-full text-left px-4 py-2 transition-colors hover:bg-gray-50 flex items-center gap-3 ${selectedBrand === brand.name
                                                    ? 'bg-gray-50 font-medium text-[#00B0C8]'
                                                    : ''
                                                    }`}
                                            >
                                                <div className="relative">
                                                    <Image
                                                        src={brand.logo}
                                                        alt={brand.name}
                                                        width={100}
                                                        height={100}
                                                        className="object-cover overflow-hidden w-10 h-10 rounded-lg"
                                                    />
                                                </div>
                                                <span className="hover:text-[#00B0C8] transition-colors active:font-bold">{brand.name}</span>
                                            </button>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </motion.div>

                    {/* Products Section */}
                    <motion.div
                        className="w-full md:w-5/6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        {/* Controls */}
                        <motion.div
                            className="flex justify-between items-center mb-6"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        >
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 ${viewMode === 'grid' ? 'text-[#00B0C8]' : 'text-gray-400'}`}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 ${viewMode === 'list' ? 'text-[#00B0C8]' : 'text-gray-400'}`}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                            </div>
                            <div className="flex items-center">
                                <span className="mr-2 text-sm text-gray-500">Ordenar por:</span>
                                <select
                                    className="border rounded-md py-1 px-2 text-sm"
                                    onChange={handleSortChange}
                                    value={sortBy}
                                >
                                    <option value="default">Por defecto</option>
                                    <option value="price-asc">Precio: menor a mayor</option>
                                    <option value="price-desc">Precio: mayor a menor</option>
                                    <option value="name-asc">Nombre</option>
                                    <option value="newest">Más nuevos</option>
                                </select>
                            </div>
                        </motion.div>

                        {/* Products Grid */}
                        <motion.div
                            layout
                            className={`${viewMode === 'grid'
                                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                                : 'space-y-6'
                                }`}
                        >
                            {filteredProducts.map((product, index) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    index={index}
                                    viewMode={viewMode}
                                    onQuickViewClick={handleOpenQuickView}
                                />
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Quick View Modal */}
            {quickViewProduct && (
                <ProductQuickView
                    product={quickViewProduct}
                    onClose={handleCloseQuickView}
                />
            )}
        </ShopLayout>
    );
} 