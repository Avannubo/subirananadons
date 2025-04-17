'use client';

import { useState, useEffect } from 'react';
import ShopLayout from "@/components/Layouts/shop-layout";
import Image from "next/image";
import Link from "next/link";
import { motion } from 'framer-motion';
import { Range } from 'react-range';
import ProductCard from "@/components/products/product-card";
import ProductQuickView from "@/components/products/product-quick-view";
// Sample categories
const categories = [
    { id: 1, name: "Cochecitos", count: 24 },
    { id: 2, name: "Habitación", count: 18 },
    { id: 3, name: "Alimentación", count: 12 },
    { id: 4, name: "Baño", count: 8 },
    { id: 5, name: "Viaje", count: 15 },
    { id: 6, name: "Seguridad", count: 10 },
];

const allProducts = [
    {
        id: 1,
        name: "Tripp Trapp Natural",
        priceValue: 259.00,
        price: "259,00€",
        imageUrl: "/assets/images/joie.png",
        imageUrlHover: "/assets/images/Screenshot_1.png",
        brand: "Stokke",
        category: "Habitación"
    },
    {
        id: 2,
        name: "Robot De Cuina Chefy6",
        priceValue: 119.00,
        price: "119,00€",
        imageUrl: "/assets/images/Screenshot_2.png",
        imageUrlHover: "/assets/images/Screenshot_3.png",
        brand: "Miniland",
        category: "Alimentación"
    },
    {
        id: 3,
        name: "Trona De Viaje Arlo",
        priceValue: 49.90,
        price: "49,90€",
        imageUrl: "/assets/images/Screenshot_1.png",
        imageUrlHover: "/assets/images/Screenshot_4.png",
        brand: "Joie",
        category: "Viaje"
    },
    {
        id: 4,
        name: "Newborn Set Tripp Trapp",
        priceValue: 99.00,
        price: "99,00€",
        imageUrl: "/assets/images/Screenshot_4.png",
        imageUrlHover: "/assets/images/Screenshot_1.png",
        brand: "Stokke",
        category: "Habitación"
    },
    {
        id: 5,
        name: "Bañera Plegable Flexi Bath",
        priceValue: 45.00,
        price: "45,00€",
        imageUrl: "/assets/images/Screenshot_3.png",
        imageUrlHover: "/assets/images/Screenshot_2.png",
        brand: "Stokke",
        category: "Baño"
    },
    {
        id: 6,
        name: "Termo Papillero Premium",
        priceValue: 24.90,
        price: "24,90€",
        imageUrl: "/assets/images/Screenshot_2.png",
        imageUrlHover: "/assets/images/Screenshot_3.png",
        brand: "Suavinex",
        category: "Alimentación"
    },
    {
        id: 7,
        name: "Barrera de Seguridad Flex",
        priceValue: 89.90,
        price: "89,90€",
        imageUrl: "/assets/images/Screenshot_1.png",
        imageUrlHover: "/assets/images/Screenshot_4.png",
        brand: "BabyDan",
        category: "Seguridad"
    },
    {
        id: 8,
        name: "Cochecito Xplory X Royal",
        priceValue: 1099.00,
        price: "1.099,00€",
        imageUrl: "/assets/images/Screenshot_4.png",
        imageUrlHover: "/assets/images/Screenshot_1.png",
        brand: "Stokke",
        category: "Cochecitos"
    },
    {
        id: 9,
        name: "Set Babero Silicona",
        priceValue: 15.90,
        price: "15,90€",
        imageUrl: "/assets/images/Screenshot_3.png",
        imageUrlHover: "/assets/images/Screenshot_2.png",
        brand: "Miniland",
        category: "Alimentación"
    },
    {
        id: 10,
        name: "Monitor Bebé Digital",
        priceValue: 159.00,
        price: "159,00€",
        imageUrl: "/assets/images/Screenshot_2.png",
        imageUrlHover: "/assets/images/Screenshot_3.png",
        brand: "Philips Avent",
        category: "Seguridad"
    },
    {
        id: 11,
        name: "Cuna Colecho Side",
        priceValue: 199.00,
        price: "199,00€",
        imageUrl: "/assets/images/Screenshot_1.png",
        imageUrlHover: "/assets/images/Screenshot_4.png",
        brand: "Chicco",
        category: "Habitación"
    },
    {
        id: 12,
        name: "Mochila Portabebés Adapt",
        priceValue: 179.00,
        price: "179,00 €",
        imageUrl: "/assets/images/Screenshot_4.png",
        imageUrlHover: "/assets/images/Screenshot_1.png",
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
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [quickViewProduct, setQuickViewProduct] = useState(null);

    const handleQuickView = (product) => {
        setQuickViewProduct(product);
        setIsQuickViewOpen(true);
    };

    const handleCloseQuickView = () => {
        setIsQuickViewOpen(false);
        setQuickViewProduct(null);
    };

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
            product.priceValue >= priceRange[0] && product.priceValue <= priceRange[1]
        );

        // Sort products
        switch (sortBy) {
            case 'price-asc':
                filtered.sort((a, b) => a.priceValue - b.priceValue);
                break;
            case 'price-desc':
                filtered.sort((a, b) => b.priceValue - a.priceValue);
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
                                <ProductCard
                                    key={index}
                                    product={product}
                                    viewMode={viewMode}
                                    onQuickViewClick={handleQuickView}
                                    addToCart={handleAddToCart}
                                />
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
            {isQuickViewOpen && quickViewProduct && (
                <ProductQuickView
                    product={quickViewProduct}
                    isOpen={isQuickViewOpen}
                    onClose={handleCloseQuickView}
                />
            )}
        </ShopLayout>
    );
}