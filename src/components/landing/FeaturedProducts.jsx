'use client';

import { useEffect, useState } from 'react';
import ProductSlider from './ProductSlider';
import { fetchFeaturedProducts } from '@/services/ProductService';

// Fallback sample data for testing and when API fails
const sampleFeaturedProducts = [
    {
        id: 'sample1',
        name: 'Cuna de Viaje Plegable',
        category: 'Cunas',
        price: '129,99 €',
        priceValue: 129.99,
        imageUrl: 'https://www.subirananadon.com/wp-content/uploads/2023/02/CUNA-COLECHO-SLEEP2GETHER.jpg',
        imageUrlHover: 'https://www.subirananadon.com/wp-content/uploads/2023/02/CUNA-COLECHO-SLEEP2GETHER.jpg',
        description: 'Cuna de viaje plegable con colchón incluido',
        reference: 'CN001',
        brand: 'Chicco'
    },
    {
        id: 'sample2',
        name: 'Cochecito 3 Piezas Todo Terreno',
        category: 'Cochecitos',
        price: '499,99 €',
        priceValue: 499.99,
        imageUrl: 'https://www.subirananadon.com/wp-content/uploads/2023/02/COCHE-ONE.jpg',
        imageUrlHover: 'https://www.subirananadon.com/wp-content/uploads/2023/02/COCHE-ONE.jpg',
        description: 'Cochecito completo 3 piezas con silla, capazo y adaptador para grupo 0',
        reference: 'CC002',
        brand: 'Jané'
    },
    {
        id: 'sample3',
        name: 'Silla de Auto Grupo 0+',
        category: 'Sillas de Auto',
        price: '199,99 €',
        priceValue: 199.99,
        imageUrl: 'https://www.subirananadon.com/wp-content/uploads/2023/02/MATRIX-LIGHT-2-RED-BEING.jpg',
        imageUrlHover: 'https://www.subirananadon.com/wp-content/uploads/2023/02/MATRIX-LIGHT-2-RED-BEING.jpg',
        description: 'Silla de auto para bebés de 0 a 13kg',
        reference: 'SA003',
        brand: 'Bébé Confort'
    },
    {
        id: 'sample4',
        name: 'Intercomunicador Digital con Vídeo',
        category: 'Seguridad',
        price: '89,99 €',
        priceValue: 89.99,
        imageUrl: 'https://www.subirananadon.com/wp-content/uploads/2023/02/VIGILABEBE.jpg',
        imageUrlHover: 'https://www.subirananadon.com/wp-content/uploads/2023/02/VIGILABEBE.jpg',
        description: 'Monitor vigilabebés con pantalla y visión nocturna',
        reference: 'SG004',
        brand: 'Motorola'
    },
    {
        id: 'sample5',
        name: 'Trona Evolutiva Multifunción',
        category: 'Alimentación',
        price: '149,99 €',
        priceValue: 149.99,
        imageUrl: 'https://www.subirananadon.com/wp-content/uploads/2023/02/TRONA.jpg',
        imageUrlHover: 'https://www.subirananadon.com/wp-content/uploads/2023/02/TRONA.jpg',
        description: 'Trona evolutiva que crece con el bebé',
        reference: 'AL005',
        brand: 'Stokke'
    },
    {
        id: 'sample6',
        name: 'Esterilizador de Biberones Eléctrico',
        category: 'Alimentación',
        price: '59,99 €',
        priceValue: 59.99,
        imageUrl: 'https://www.subirananadon.com/wp-content/uploads/2023/02/TERMOMETRO.jpg',
        imageUrlHover: 'https://www.subirananadon.com/wp-content/uploads/2023/02/TERMOMETRO.jpg',
        description: 'Esterilizador eléctrico para 6 biberones',
        reference: 'AL006',
        brand: 'Philips Avent'
    }
];

export default function FeaturedProducts({ limit = 8, forceUseSampleData = false, debug = false }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [usingSampleData, setUsingSampleData] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getProducts = async () => {
            try {
                setLoading(true);
                setError(null);

                // If forceUseSampleData is true, use sample data
                if (forceUseSampleData) {
                    console.log('Using sample data as requested by forceUseSampleData parameter');
                    setProducts(sampleFeaturedProducts.slice(0, limit));
                    setUsingSampleData(true);
                    return;
                }

                // Fetch data from API
                console.log(`Fetching featured products from database, limit: ${limit}`);
                const response = await fetch(`/api/products/featured?limit=${limit}`);

                if (!response.ok) {
                    throw new Error(`API request failed with status: ${response.status}`);
                }

                const data = await response.json();

                // Check API response format
                if (data.success && Array.isArray(data.products)) {
                    console.log(`Successfully fetched ${data.products.length} featured products from database`);

                    if (data.products.length > 0) {
                        setProducts(data.products);
                        setUsingSampleData(false);
                    } else {
                        console.log('API returned empty products array, using sample data as fallback');
                        setProducts(sampleFeaturedProducts.slice(0, limit));
                        setUsingSampleData(true);
                    }
                } else {
                    console.error('Invalid API response format:', data);
                    setError('Invalid API response format');
                    setProducts(sampleFeaturedProducts.slice(0, limit));
                    setUsingSampleData(true);
                }
            } catch (error) {
                console.error('Error fetching featured products:', error);
                setError(error.message || 'Failed to fetch featured products');
                // Fallback to sample data on error
                setProducts(sampleFeaturedProducts.slice(0, limit));
                setUsingSampleData(true);
            } finally {
                setLoading(false);
            }
        };

        getProducts();
    }, [limit, forceUseSampleData]);

    if (loading) {
        return (
            <div className="w-full py-8">
                <div className="container mx-auto">
                    <h2 className="text-3xl text-black font-bold mb-8">Productos Destacados</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(Math.min(limit, 4))].map((_, index) => (
                            <div key={index} className="bg-gray-100 animate-pulse rounded-lg h-64"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return null; // Don't render the section if there are no products
    }

    return (
        <div className="w-full py-8">
            <ProductSlider
                title="Productos Destacados"
                products={products}
                className="w-full"
                slidesPerView={{
                    mobile: 2,
                    tablet: 3,
                    desktop: 4
                }}
            />
            {usingSampleData && (
                <div className="container mx-auto mt-2">
                    <p className="text-xs text-gray-500 text-center">
                        Mostrando datos de ejemplo. {error ? `Error: ${error}` : 'No se encontraron productos destacados en la base de datos.'}
                    </p>
                </div>
            )}
            {/* {debug && (
                <div className="container mx-auto mt-4 p-4 bg-gray-100 rounded">
                    <h3 className="text-sm font-bold mb-2">Debug Information:</h3>
                    <ul className="text-xs space-y-1">
                        <li>Source: {usingSampleData ? 'Sample Data' : 'Database'}</li>
                        <li>Products Count: {products.length}</li>
                        <li>Requested Limit: {limit}</li>
                        {error && <li className="text-red-500">Error: {error}</li>}
                    </ul>
                </div>
            )} */}
        </div>
    );
} 