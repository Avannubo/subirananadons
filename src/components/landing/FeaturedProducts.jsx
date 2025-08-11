'use client';
import { useEffect, useState } from 'react';
import ProductSlider from './ProductSlider'; 
export default function FeaturedProducts({ limit = 8, forceUseSampleData = false, locale }) {
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
                // if (forceUseSampleData) {
                //     setProducts(sampleFeaturedProducts.slice(0, limit));
                //     setUsingSampleData(true);
                //     return;
                // }

                // Fetch data from API
                const response = await fetch(`/api/products/featured?limit=${limit}`);

                if (!response.ok) {
                    throw new Error(`API request failed with status: ${response.status}`);
                }

                const data = await response.json();

                // Check API response format
                if (data.success && Array.isArray(data.products)) {
                    if (data.products.length > 0) {
                        setProducts(data.products);
                        setUsingSampleData(false);
                    } else {
                        // setProducts(sampleFeaturedProducts.slice(0, limit));
                        // setUsingSampleData(true);
                    }
                } else {
                    setError('Invalid API response format');
                    // setProducts(sampleFeaturedProducts.slice(0, limit));
                    // setUsingSampleData(true);
                }
            } catch (error) {
                setError(error.message || 'Failed to fetch featured products');
                // Fallback to sample data on error
                // setProducts(sampleFeaturedProducts.slice(0, limit));
                // setUsingSampleData(true);
            } finally {
                setLoading(false);
            }
        };

        getProducts();
    }, [limit, forceUseSampleData]);

    if (loading) {
        return (
            <div className="w-full py-8">
                <div className="container mx-auto px-2">
                    <h2 className="text-2xl md:text-3xl text-black font-bold mb-6 md:mb-8">{locale === 'ca' ? 'Productes Destacats' : 'Productos Destacados'}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {[...Array(Math.min(limit, 4))].map((_, index) => (
                            <div key={index} className="bg-gray-100 animate-pulse rounded-lg h-48 md:h-64"></div>
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
            <div className="container mx-auto px-2">
                <ProductSlider
                    title={locale === 'ca' ? 'Productes Destacats' : 'Productos Destacados'}
                    products={products}
                    className="w-full"
                    slidesPerView={{
                        mobile: 2,
                        tablet: 3,
                        desktop: 4
                    }}
                />
                {usingSampleData && (
                    <div className="mt-2">
                        <p className="text-xs text-gray-500 text-center">
                            {locale === 'ca'
                                ? `Mostrant dades d'exemple. ${error ? `Error: ${error}` : "No s'han trobat productes destacats a la base de dades."}`
                                : `Mostrando datos de ejemplo. ${error ? `Error: ${error}` : 'No se encontraron productos destacados en la base de datos.'}`}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}