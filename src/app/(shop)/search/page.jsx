'use client';

import { useState, useEffect } from 'react';
import ShopLayout from "@/components/Layouts/shop-layout";
import Image from "next/image";
import Link from "next/link";
import { motion } from 'framer-motion';
import { Range } from 'react-range';

// Sample categories
const categories = [
    { id: 1, name: "Cochecitos", count: 24 },
    { id: 2, name: "Habitación", count: 18 },
    { id: 3, name: "Alimentación", count: 12 },
    { id: 4, name: "Baño", count: 8 },
    { id: 5, name: "Viaje", count: 15 },
    { id: 6, name: "Seguridad", count: 10 },
];

// Sample products (using the same data structure as your brands page)
const allProducts = [
    {
        id: 1,
        name: "Tripp Trapp Natural",
        price: 259.00,
        priceFormatted: "259,00 €",
        image: "/assets/images/joie.png",
        hoverImage: "/assets/images/Screenshot_1.png",
        brand: "Stokke",
        category: "Habitación"
    },
    {
        id: 2,
        name: "Robot De Cuina Chefy6",
        price: 119.00,
        priceFormatted: "119,00 €",
        image: "/assets/images/Screenshot_2.png",
        hoverImage: "/assets/images/Screenshot_3.png",
        brand: "Miniland",
        category: "Alimentación"
    },
    {
        id: 3,
        name: "Trona De Viaje Arlo",
        price: 49.90,
        priceFormatted: "49,90 €",
        image: "/assets/images/Screenshot_1.png",
        hoverImage: "/assets/images/Screenshot_4.png",
        brand: "Joie",
        category: "Viaje"
    },
    {
        id: 4,
        name: "Newborn Set Tripp Trapp",
        price: 99.00,
        priceFormatted: "99,00 €",
        image: "/assets/images/Screenshot_4.png",
        hoverImage: "/assets/images/Screenshot_1.png",
        brand: "Stokke",
        category: "Habitación"
    },
    {
        id: 5,
        name: "Bañera Plegable Flexi Bath",
        price: 45.00,
        priceFormatted: "45,00 €",
        image: "/assets/images/Screenshot_3.png",
        hoverImage: "/assets/images/Screenshot_2.png",
        brand: "Stokke",
        category: "Baño"
    },
    {
        id: 6,
        name: "Termo Papillero Premium",
        price: 24.90,
        priceFormatted: "24,90 €",
        image: "/assets/images/Screenshot_2.png",
        hoverImage: "/assets/images/Screenshot_3.png",
        brand: "Suavinex",
        category: "Alimentación"
    },
    {
        id: 7,
        name: "Barrera de Seguridad Flex",
        price: 89.90,
        priceFormatted: "89,90 €",
        image: "/assets/images/Screenshot_1.png",
        hoverImage: "/assets/images/Screenshot_4.png",
        brand: "BabyDan",
        category: "Seguridad"
    },
    {
        id: 8,
        name: "Cochecito Xplory X Royal",
        price: 1099.00,
        priceFormatted: "1.099,00 €",
        image: "/assets/images/Screenshot_4.png",
        hoverImage: "/assets/images/Screenshot_1.png",
        brand: "Stokke",
        category: "Cochecitos"
    },
    {
        id: 9,
        name: "Set Babero Silicona",
        price: 15.90,
        priceFormatted: "15,90 €",
        image: "/assets/images/Screenshot_3.png",
        hoverImage: "/assets/images/Screenshot_2.png",
        brand: "Miniland",
        category: "Alimentación"
    },
    {
        id: 10,
        name: "Monitor Bebé Digital",
        price: 159.00,
        priceFormatted: "159,00 €",
        image: "/assets/images/Screenshot_2.png",
        hoverImage: "/assets/images/Screenshot_3.png",
        brand: "Philips Avent",
        category: "Seguridad"
    },
    {
        id: 11,
        name: "Cuna Colecho Side",
        price: 199.00,
        priceFormatted: "199,00 €",
        image: "/assets/images/Screenshot_1.png",
        hoverImage: "/assets/images/Screenshot_4.png",
        brand: "Chicco",
        category: "Habitación"
    },
    {
        id: 12,
        name: "Mochila Portabebés Adapt",
        price: 179.00,
        priceFormatted: "179,00 €",
        image: "/assets/images/Screenshot_4.png",
        hoverImage: "/assets/images/Screenshot_1.png",
        brand: "Ergobaby",
        category: "Viaje"
    }
];

export default function SearchPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 1500]);
    const [sortBy, setSortBy] = useState('default');
    const [viewMode, setViewMode] = useState('grid');
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const [filteredProducts, setFilteredProducts] = useState(allProducts);

    // Filter products based on search term, categories, and price range
    useEffect(() => {
        let filtered = [...allProducts];

        // Search term filter
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.brand.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Category filter
        if (selectedCategories.length > 0) {
            filtered = filtered.filter(product =>
                selectedCategories.includes(product.category)
            );
        }

        // Price range filter
        filtered = filtered.filter(product =>
            product.price >= priceRange[0] && product.price <= priceRange[1]
        );

        // Sort products
        switch (sortBy) {
            case 'price-asc':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'newest':
                filtered.reverse();
                break;
        }

        setFilteredProducts(filtered);
    }, [searchTerm, selectedCategories, priceRange, sortBy]);

    const handleCategoryToggle = (category) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const handleQuickView = (e, product) => {
        e.preventDefault();
        console.log('Quick view:', product);
    };

    const handleAddToCart = (e, product) => {
        e.preventDefault();
        console.log('Add to cart:', product);
    };

    return (
        <ShopLayout>
            {/* Header with Search Bar */}
            <motion.div
                className="relative w-full h-[300px] bg-gray-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Image
                    src="/assets/images/bg-beagrumb.jpg"
                    alt="Search header"
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 flex flex-col mt-14 items-center justify-center space-y-6">
                    {/* <motion.h1
                        className="text-4xl font-bold text-zinc-900"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        Buscar Productos
                    </motion.h1> */}
                    <motion.div
                        className="w-full max-w-2xl px-4"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar productos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full focus:bg-white px-6 py-4 rounded-full border-2 border-gray-200 focus:border-[#00B0C8] focus:outline-none text-lg"
                            />
                            <button className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
            <div className="container mx-auto px-4 py-8">
                {/* Removing breadcrumb section */}
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <motion.div
                        className="w-full md:w-1/4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        <div className="sticky top-24 bg-white p-6 rounded-lg border border-gray-200">
                            {/* Categories */}
                            <div className="mb-8">
                                <h3 className="text-lg font-medium mb-4">Categorías</h3>
                                <div className="space-y-2">
                                    {categories.map((category) => (
                                        <label
                                            key={category.id}
                                            className="flex items-center space-x-3 cursor-pointer group"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.includes(category.name)}
                                                onChange={() => handleCategoryToggle(category.name)}
                                                className="form-checkbox h-5 w-5 text-[#00B0C8] rounded border-gray-300 focus:ring-[#00B0C8]"
                                            />
                                            <span className="text-gray-700 group-hover:text-[#00B0C8] transition-colors">
                                                {category.name}
                                            </span>
                                            <span className="text-gray-400 text-sm">({category.count})</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="mb-8">
                                <h3 className="text-lg font-medium mb-4">Precio</h3>
                                <div className="px-2 py-4">
                                    <Range
                                        step={10}
                                        min={0}
                                        max={1500}
                                        values={priceRange}
                                        onChange={setPriceRange}
                                        renderTrack={({ props, children }) => {
                                            const { key, ...restProps } = props;
                                            return (
                                                <div
                                                    key={key}
                                                    {...restProps}
                                                    className="h-1 w-full bg-gray-200 rounded-full"
                                                >
                                                    <div
                                                        className="h-1 bg-[#00B0C8]"
                                                        style={{
                                                            width: `${((priceRange[1] - priceRange[0]) / 1500) * 100}%`,
                                                            left: `${(priceRange[0] / 1500) * 100}%`
                                                        }}
                                                    />
                                                    {children}
                                                </div>
                                            );
                                        }}
                                        renderThumb={({ props }) => {
                                            const { key, ...restProps } = props;
                                            return (
                                                <div
                                                    key={key}
                                                    {...restProps}
                                                    className="h-5 w-5 rounded-full bg-white border-2 border-[#00B0C8] focus:outline-none"
                                                />
                                            );
                                        }}
                                    />
                                    <div className="flex justify-between mt-2 text-sm text-gray-600">
                                        <span>{priceRange[0]}€</span>
                                        <span>{priceRange[1]}€</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Products Section */}
                    <motion.div
                        className="w-full md:w-3/4"
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
                                    onChange={(e) => setSortBy(e.target.value)}
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

                        {/* Products Grid/List */}
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
                                        {/* Product Image with Hover Effect */}
                                        <div className={`aspect-square relative overflow-hidden ${viewMode === 'list' ? 'w-1/3' : 'w-full'}`}>
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                fill
                                                className={`object-cover transition-opacity duration-500 ${hoveredProduct === product.id ? 'opacity-0' : 'opacity-100'}`}
                                            />
                                            <Image
                                                src={product.hoverImage}
                                                alt={`${product.name} - hover`}
                                                fill
                                                className={`object-cover transition-opacity duration-500 ${hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'}`}
                                            />

                                            {/* Quick View & Add to Cart Buttons */}
                                            <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="flex justify-center space-x-2">
                                                    <button
                                                        onClick={(e) => handleQuickView(e, product)}
                                                        className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                                                    >
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleAddToCart(e, product)}
                                                        className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                                                    >
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
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
                                            <p className="text-md font-light text-primary">{product.priceFormatted}</p>
                                            {viewMode === 'list' && (
                                                <p className="text-gray-600 mt-2">{product.brand}</p>
                                            )}
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* No Results Message */}
                        {filteredProducts.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12"
                            >
                                <p className="text-gray-500 text-lg">No se encontraron productos que coincidan con tu búsqueda.</p>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </div>
        </ShopLayout>
    );
} 