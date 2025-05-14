'use client';

import { useEffect, useState } from 'react';
import ProductSlider from './ProductSlider';
import { fetchFeaturedProducts } from '@/services/ProductService';

export default function FeaturedProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getProducts = async () => {
            try {
                setLoading(true);
                const featuredProducts = await fetchFeaturedProducts();
                setProducts(featuredProducts);
            } catch (error) {
                console.error('Error fetching featured products:', error);
            } finally {
                setLoading(false);
            }
        };

        getProducts();
    }, []);

    if (loading) {
        return (
            <div className="w-full py-8">
                <div className="container mx-auto">
                    <h2 className="text-3xl text-black font-bold mb-8">Productos Destacados</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, index) => (
                            <div key={index} className="bg-gray-100 animate-pulse rounded-lg h-64"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return null; // Don't render the section if there are no featured products
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
        </div>
    );
} 