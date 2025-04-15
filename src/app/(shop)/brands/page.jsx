'use client';

import { useState, useEffect } from 'react';
import ShopLayout from "@/components/Layouts/shop-layout";
import Image from "next/image";
import Link from "next/link";
import { motion } from 'framer-motion';

// Sample brands data - in production this would come from your API/database
const brands = [
    { id: 1, name: "Stokke", logo: "/assets/images/joie.png" },
    { id: 2, name: "Joie", logo: "/assets/images/joie.png" },
    { id: 3, name: "Cybex", logo: "/assets/images/joie.png" },
    { id: 4, name: "Bugaboo", logo: "/assets/images/joie.png" },
    { id: 5, name: "Babyzen", logo: "/assets/images/joie.png" },
    { id: 6, name: "Uppababy", logo: "/assets/images/joie.png" },
    { id: 7, name: "Nuna", logo: "/assets/images/joie.png" },
    { id: 8, name: "Silver Cross", logo: "/assets/images/joie.png" },
    { id: 9, name: "Maxi-Cosi", logo: "/assets/images/joie.png" },
    { id: 10, name: "Britax", logo: "/assets/images/joie.png" },
    { id: 11, name: "Chicco", logo: "/assets/images/joie.png" },

];

// Sample products data - in production this would come from your API/database
const products = [
    {
        id: 1,
        name: "Tripp Trapp Natural",
        price: "259,00 €",
        image: "/assets/images/joie.png",
        hoverImage: "/assets/images/Screenshot_1.png",
        brand: "Stokke",
        category: "Habitación"
    },
    {
        id: 2,
        name: "Newborn Set Tripp Trapp",
        price: "99,00 €",
        image: "/assets/images/joie.png",
        hoverImage: "/assets/images/Screenshot_1.png",
        brand: "Stokke",
        category: "Habitación"
    },
    {
        id: 3,
        name: "Trona De Viaje Arlo",
        price: "49,90 €",
        image: "/assets/images/joie.png",
        hoverImage: "/assets/images/Screenshot_1.png",
        brand: "Joie",
        category: "Alimentación"
    },
    {
        id: 4,
        name: "Stokke Xplory X Royal Blue",
        price: "1099,00 €",
        image: "/assets/images/joie.png",
        hoverImage: "/assets/images/Screenshot_1.png",
        brand: "Stokke",
        category: "Cochecitos"
    },
    {
        id: 5,
        name: "Stokke Steps Chair Oak",
        price: "259,00 €",
        image: "/assets/images/joie.png",
        hoverImage: "/assets/images/Screenshot_1.png",
        brand: "Stokke",
        category: "Habitación"
    },
    {
        id: 6,
        name: "Stokke Clikk High Chair",
        price: "149,00 €",
        image: "/assets/images/joie.png",
        hoverImage: "/assets/images/Screenshot_1.png",
        brand: "Stokke",
        category: "Habitación"
    },
    {
        id: 7,
        name: "Stokke Sleepi Mini Bundle",
        price: "789,00 €",
        image: "/assets/images/joie.png",
        hoverImage: "/assets/images/Screenshot_1.png",
        brand: "Stokke",
        category: "Habitación"
    },
    {
        id: 8,
        name: "Stokke Flexi Bath",
        price: "45,00 €",
        image: "/assets/images/joie.png",
        hoverImage: "/assets/images/Screenshot_1.png",
        brand: "Stokke",
        category: "Baño"
    },
    {
        id: 9,
        name: "Stokke JetKids BedBox",
        price: "159,00 €",
        image: "/assets/images/joie.png",
        hoverImage: "/assets/images/Screenshot_1.png",
        brand: "Stokke",
        category: "Viaje"
    }
];

export default function BrandsPage() {
    const [selectedBrand, setSelectedBrand] = useState(brands[0].name);
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('default');
    const [filteredProducts, setFilteredProducts] = useState([]);

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
                // In a real app, you'd sort by date
                sorted.reverse();
                break;
            default:
                // Keep default order
                break;
        }

        setFilteredProducts(sorted);
    }, [selectedBrand, sortBy]);

    const handleQuickView = (e, product) => {
        e.preventDefault();
        // Implement quick view functionality
        console.log('Quick view:', product);
    };

    const handleAddToCart = (e, product) => {
        e.preventDefault();
        // Implement add to cart functionality
        console.log('Add to cart:', product);
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };

    return (
        <ShopLayout>
            {/* Header Image */}
            <motion.div
                className="relative w-full h-[300px]  bg-gray-100"
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
                        className="text-4xl font-bold text-zinc-900"
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
                <motion.nav
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
                </motion.nav>

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
                                                        width={1000}
                                                        height={1000}
                                                        className="cover w-12 h-10 rounded-lg"
                                                    />
                                                </div>
                                                <span className="hover:text-[#00B0C8] transition-colors">{brand.name}</span>
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
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        layout: { duration: 0.3 },
                                        opacity: { delay: 0.1 * index, duration: 0.3 }
                                    }}
                                >
                                    <Link
                                        href={`/products/${product.category.toLowerCase()}/${product.name.toLowerCase().replace(/\s+/g, '-')}`}
                                        className={`group relative overflow-hidden duration-300 flex ${viewMode === 'grid' ? 'flex-col' : 'flex-row gap-6'
                                            }`}
                                        onMouseEnter={() => setHoveredProduct(product.id)}
                                        onMouseLeave={() => setHoveredProduct(null)}
                                    >
                                        {/* Image Container with Hover Effect */}
                                        <div className={`aspect-square relative overflow-hidden   ${viewMode === 'list' ? 'w-1/3' : 'w-full'
                                            }`}>
                                            {/* Main Image */}
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                fill
                                                className={`object-cover transition-opacity duration-500 ${hoveredProduct === product.id ? 'opacity-0' : 'opacity-100'}`}
                                            />

                                            {/* Hover Image */}
                                            <Image
                                                src={product.hoverImage || product.image}
                                                alt={`${product.name} - hover`}
                                                fill
                                                className={`object-cover transition-opacity duration-500 ${hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'}`}
                                            />

                                            {/* Action Buttons */}
                                            <div className="absolute bottom-0 left-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="flex flex-row justify-center space-x-2">
                                                    <button
                                                        className="bg-white text-primary font-bold rounded-full hover:bg-gray-100 transition-colors p-2 shadow-lg"
                                                        onClick={(e) => handleQuickView(e, product)}
                                                    >
                                                        {/* Quick View Icon */}
                                                        <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none">
                                                            <circle cx="10.5" cy="10.5" r="6.5" stroke="#000000" strokeLinejoin="round" />
                                                            <path d="M19.6464 20.3536C19.8417 20.5488 20.1583 20.5488 20.3536 20.3536C20.5488 20.1583 20.5488 19.8417 20.3536 19.6464L19.6464 20.3536ZM20.3536 19.6464L15.3536 14.6464L14.6464 15.3536L19.6464 20.3536L20.3536 19.6464Z" fill="#000000" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        className="bg-white text-primary font-bold rounded-full hover:bg-gray-100 transition-colors p-2 shadow-lg"
                                                        onClick={(e) => handleAddToCart(e, product)}
                                                    >
                                                        {/* Add to Cart Icon */}
                                                        <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none">
                                                            <path d="M7.5 18C8.32843 18 9 18.6716 9 19.5C9 20.3284 8.32843 21 7.5 21C6.67157 21 6 20.3284 6 19.5C6 18.6716 6.67157 18 7.5 18Z" stroke="#000000" strokeWidth="1.5" />
                                                            <path d="M16.5 18.0001C17.3284 18.0001 18 18.6716 18 19.5001C18 20.3285 17.3284 21.0001 16.5 21.0001C15.6716 21.0001 15 20.3285 15 19.5001C15 18.6716 15.6716 18.0001 16.5 18.0001Z" stroke="#000000" strokeWidth="1.5" />
                                                            <path d="M2 3L2.26121 3.09184C3.5628 3.54945 4.2136 3.77826 4.58584 4.32298C4.95808 4.86771 4.95808 5.59126 4.95808 7.03836V9.76C4.95808 12.7016 5.02132 13.6723 5.88772 14.5862C6.75412 15.5 8.14857 15.5 10.9375 15.5H12M16.2404 15.5C17.8014 15.5 18.5819 15.5 19.1336 15.0504C19.6853 14.6008 19.8429 13.8364 20.158 12.3075L20.6578 9.88275C21.0049 8.14369 21.1784 7.27417 20.7345 6.69708C20.2906 6.12 18.7738 6.12 17.0888 6.12H11.0235M4.95808 6.12H7" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Product Info */}
                                        <div className={`flex-grow flex flex-col ${viewMode === 'grid'
                                            ? 'py-4 pb-8 justify-center items-center'
                                            : 'justify-center'
                                            }`}>
                                            <h3 className={`text-lg font-medium mb-2 group-hover:text-[#00B0C8] transition-colors ${viewMode === 'grid' ? 'text-center' : ''
                                                }`}>{product.name}</h3>
                                            <p className="text-md font-light text-primary">{product.price}</p>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </ShopLayout>
    );
} 