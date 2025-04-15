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

// Nested Menu Structure for Productos
const productMenuTree = {
    label: "Productos",
    submenu: [
        {
            label: "Alimentación",
            submenu: [
                { label: "Tronas de viaje" },
                { label: "Robots de cocina" },
                { label: "Platos y cubiertos" },
                { label: "Botellas y vasos" },
                { label: "Baberos" },
                { label: "Botes y fiambreras" },
                { label: "Termos" },
                { label: "Lactancia" }
            ]
        },
        {
            label: "Baño",
            submenu: [
                { label: "Accesorios baño" },
                { label: "Kits higiene y cosmética" },
                { label: "Cajas toallitas" },
                { label: "Pañales y contenedores pañales" },
                { label: "Orinales y reductores WC" }
            ]
        },
        {
            label: "Casa",
            submenu: [
                { label: "Intercomunicadores" },
                { label: "Tronas" },
                { label: "Barandillas de escalera" },
                { label: "Hamacas" }
            ]
        },
        {
            label: "Habitación",
            submenu: [
                { label: "Cuna, colecho y moisés" },
                { label: "Mobiliario" },
                { label: "Colchones y protectores" },
                { label: "Téxtil" },
                { label: "Cambiadores y fundas" },
                { label: "Luces y decoración" },
                { label: "Barreras cama" }
            ]
        },
        { label: "Gemelos" }, // No submenu means it's a direct category
        {
            label: "Madres",
            submenu: [
                { label: "Ropa embarazo y porteo" },
                { label: "Sujetadores embarazo i lactancia" },
                { label: "Basicos embarazo" },
                { label: "Basicos hospital" }]
        },
        {
            label: "Cochecitos",
            submenu: [
                { label: "Sillas de paseo" },
                { label: "Accesorios cochecito" }
            ]
        },
        {
            label: "Entretenimientos",
            submenu: [
                { label: "Doudous y peluches" },
                { label: "Botellas sensoriales" },
                { label: "Alfombras de actividades" },
                { label: "Bolsa almacenaje" },
                { label: "Mordedores" },
                { label: "Varios" }
            ]
        },
        {
            label: "Salud",
            submenu: [
                { label: "Aspirador nasal" },
                { label: "Termómetros" },
                { label: "Humidificadores" },
                { label: "Cojines" },
                { label: "Cojines cabeza plana" },
                { label: "Casco antiruido" }
            ]
        },
        {
            label: "Sillas De Coche",
            submenu: [
                { label: "Grupo 0+" },
                { label: "Grupo 0-1" },
                { label: "Grupo 0-1 - 2" },
                { label: "Grupo 0-1 - 2 - 3" },
                { label: "Grupo 2-3" },
                { label: "Fundas silla" },
                { label: "Accesorios coche" }
            ]
        },
        {
            label: "Otros Productos",
            submenu: [
                { label: "Mochilas" },
                { label: "Fulares y bandoleras" },
                { label: "Ropa porteo" },
                { label: "Cunas de viaje" },
                { label: "Ropa bebé" },
                { label: "Bolsas maternales" },
                { label: "Bolsas muda" },
                { label: "Porta Documentos" },
                { label: "Mochilas infantiles" },
                { label: "Arrullos" },
                { label: "Silla para bici" },
                { label: "Cambiadores de viaje" }
            ]
        }
    ]
};

// Sample product data with MORE SPECIFIC categories assigned
const products = [
    {
        id: 1,
        name: "Robot De Cuina Chefy6",
        category: "Robots de cocina", // Specific category
        price: "119,00 €",
        priceValue: parsePrice("119,00 €"),
        salesCount: 50,
        imageUrl: "/assets/images/screenshot_3.png",
        imageUrlHover: "/assets/images/screenshot_2.png",
        description: "¡ Nuevo modelo! chefy 6 es un completo robot de cocina para bebés multifuncional 6 en 1, de diseño compacto y con grandes prestaciones. Además,..."
    },
    {
        id: 2,
        name: "Bolso Trona De Viaje Arlo...",
        category: "Tronas de viaje", // Specific category
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
        category: "Tronas", // Specific category
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
        category: "Termos", // Specific category
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
        category: "Botellas y vasos", // Specific category
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
        category: "Tronas", // Specific category (Accessory for Tronas)
        price: "99,00 €",
        priceValue: parsePrice("99,00 €"),
        salesCount: 45,
        imageUrl: "/assets/images/screenshot_3.png",
        imageUrlHover: "/assets/images/screenshot_2.png",
        description: "Permite usar la trona Tripp Trapp® desde el nacimiento. Acogedor y ergonómico para el recién nacido."
    }
];

// Helper function to find a category node and its path by label
function findCategoryAndPath(node, labelToFind, currentPath = []) {
    const pathIncludingSelf = [...currentPath, node.label]; // Build path first
    if (node.label === labelToFind) {
        return { node, path: pathIncludingSelf };
    }
    if (node.submenu) {
        for (const subNode of node.submenu) {
            // Pass the updated path for the *parent* node
            const result = findCategoryAndPath(subNode, labelToFind, pathIncludingSelf);
            if (result) return result;
        }
    }
    return null;
}

// Helper function to get all LEAF category labels under a given node
function getAllLeafCategoryLabels(node) {
    let labels = [];
    if (!node.submenu || node.submenu.length === 0) {
        // Only add if it's a leaf node (has no submenu)
        labels.push(node.label);
    } else {
        // If it has a submenu, recurse
        node.submenu.forEach(subNode => {
            labels = labels.concat(getAllLeafCategoryLabels(subNode));
        });
    }
    return labels;
}

export default function Page() {
    const [viewMode, setViewMode] = useState('grid');
    const [sortOrder, setSortOrder] = useState('sales-desc');
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    // Initialize with the root label from the tree
    const [categoryPath, setCategoryPath] = useState([productMenuTree.label]);

    // Get the current category node based on the last item in the path
    const currentCategoryLabel = categoryPath[categoryPath.length - 1];
    // Start search from the root of the tree
    const currentCategoryData = useMemo(() => findCategoryAndPath(productMenuTree, currentCategoryLabel), [currentCategoryLabel]);
    const currentSubcategories = currentCategoryData?.node?.submenu || [];

    // Memoize filtered and sorted products
    const filteredAndSortedProducts = useMemo(() => {
        let filtered = [...products];

        // If a specific category (not just 'Productos') is selected
        if (currentCategoryData?.node && categoryPath.length > 1) {
            // Get all LEAF category labels under the selected node
            const targetLeafLabels = getAllLeafCategoryLabels(currentCategoryData.node);
            // Filter products whose specific category is within the target leaves
            filtered = products.filter(product => targetLeafLabels.includes(product.category));
        } // else, if path is just ['Productos'], show all products

        // Then sort the filtered list
        const sortableProducts = [...filtered];
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
    }, [sortOrder, categoryPath, currentCategoryData?.node]); // Update dependency

    const handleSortChange = (event) => {
        setSortOrder(event.target.value);
    };

    // Navigate down the category tree by adding the new label to the path
    const handleCategoryChange = (categoryLabel) => {
        // We don't need findCategoryAndPath here, just append if it's a valid subcategory
        const currentSubs = currentCategoryData?.node?.submenu || [];
        const nextCategory = currentSubs.find(sub => sub.label === categoryLabel);
        if (nextCategory) {
            setCategoryPath([...categoryPath, categoryLabel]);
        }
    };

    // Handle sibling category selection - replaces last item in path
    const handleSiblingCategoryChange = (siblingLabel) => {
        // Replace the last element in the path with the selected sibling
        const newPath = [...categoryPath.slice(0, -1), siblingLabel];
        setCategoryPath(newPath);
    };

    // Navigate back up using breadcrumbs
    const handleBreadcrumbClick = (index) => {
        // Slice the path up to and including the clicked index
        setCategoryPath(categoryPath.slice(0, index + 1));
    };

    const handleOpenQuickView = (product) => {
        setQuickViewProduct(product);
    };

    const handleCloseQuickView = () => {
        setQuickViewProduct(null);
    };

    return (
        <ShopLayout>
            <div className="relative w-[1500px] h-full flex flex-col justify-start items-start mt-20">
                <Image src="/assets/images/bg-beagrumb.jpg" alt="logo" className="w-full h-[20vh] object-cover" width={2010} height={2010} />
                <div className="absolute inset-0 flex items-center mt-14 justify-center">
                    <h1 className="text-4xl text-zinc-800 font-bold">Tienda</h1>
                </div>
            </div>
            <div className="container w-[1500px] bg-white  px-4 py-8">
                {/* Breadcrumbs */}
                <nav aria-label="Breadcrumb" className="mb-6">
                    <ol className="flex items-center space-x-1 text-sm text-gray-500 flex-wrap">
                        {categoryPath.map((label, index) => (
                            <li key={index} className="flex items-center">
                                {index > 0 && (
                                    <svg className="w-3 h-3 mx-1 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                                )}
                                {index < categoryPath.length - 1 ? (
                                    <button onClick={() => handleBreadcrumbClick(index)} className="hover:underline hover:text-gray-700">
                                        {label}
                                    </button>
                                ) : (
                                    <span className="font-semibold text-gray-700">{label}</span>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Category/Subcategory List Sidebar */}
                    <aside className="w-full md:w-1/4 lg:w-1/5 flex-shrink-0">
                        {/*   <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">
                            {currentCategoryLabel === productMenuTree.label ? "Categorías" : `Subcategorías de ${categoryPath[categoryPath.length - 2] || "Productos"}`}
                        </h3> */}

                        {/* Show subcategories if available, otherwise show siblings */}
                        {currentSubcategories.length > 0 ? (
                            <ul className="space-y-1">
                                {currentSubcategories.map((subCategory) => (
                                    <li key={subCategory.label}>
                                        <button
                                            onClick={() => handleCategoryChange(subCategory.label)}
                                            className={`w-full text-left px-2 py-1.5 rounded text-gray-600 hover:bg-gray-100 hover:font-semibold transition-colors duration-150`}
                                        >
                                            {subCategory.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            categoryPath.length > 1 && (
                                /* Get the parent's submenu (siblings) when there are no subcategories */
                                <ul className="space-y-1">
                                    {categoryPath.length > 2 &&
                                        findCategoryAndPath(productMenuTree, categoryPath[categoryPath.length - 2])?.node?.submenu?.map((siblingCategory) => (
                                            <li key={siblingCategory.label}>
                                                <button
                                                    onClick={() => handleSiblingCategoryChange(siblingCategory.label)}
                                                    className={`w-full text-left px-2 py-1.5 rounded transition-colors duration-150 
                                                        ${siblingCategory.label === currentCategoryLabel
                                                        ? 'text-[#00B0C8] font-semibold bg-gray-100'
                                                            : 'text-gray-600 hover:bg-gray-100 hover:font-semibold'
                                                        }`}
                                                >
                                                    {siblingCategory.label}
                                                </button>
                                            </li>
                                        ))
                                    }
                                </ul>
                            )
                        )}
                    </aside>

                    {/* Product Grid Area */}
                    <main className="w-full flex-grow">
                        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
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
                                {/* Sort dropdown */}
                                <label htmlFor="sort-by" className="mr-2 text-gray-600 whitespace-nowrap">Ordenar por:</label>
                                <select
                                    id="sort-by"
                                    className="border rounded p-2 text-gray-600"
                                    value={sortOrder}
                                    onChange={handleSortChange}
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
                            className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col space-y-6'}`}
                        >
                            <AnimatePresence>
                                {filteredAndSortedProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        viewMode={viewMode}
                                        onQuickViewClick={handleOpenQuickView}
                                    />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                        {/* No results message */}
                        {filteredAndSortedProducts.length === 0 && (
                            <p className="text-center text-gray-500 mt-8">No hay productos que coincidan con la categoría seleccionada.</p>
                        )}
                    </main>
                </div>
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