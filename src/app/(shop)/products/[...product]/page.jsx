'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import ShopLayout from "@/components/Layouts/shop-layout";
import Image from "next/image";
import { motion, useMotionValue, useTransform } from 'framer-motion';
import ProductSlider from '@/components/landing/ProductSlider';
import { toast } from 'react-hot-toast';
import { fetchProductById, fetchProducts, formatProduct } from '@/services/ProductService';

export default function Page() {
    const params = useParams();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [activeTab, setActiveTab] = useState('DETALLES DEL PRODUCTO');
    const [dragConstraints, setDragConstraints] = useState({ right: 0, left: 0 });
    const containerRef = useRef(null);
    const dragX = useMotionValue(0);

    useEffect(() => {
        const loadProduct = async () => {
            try {
                if (!params.product || params.product.length === 0) {
                    setError('Invalid product ID');
                    return;
                }

                const productSlug = params.product[0];
                const productData = await fetchProductById(productSlug);
                if (!productData) {
                    setError('Product not found');
                    return;
                }

                const formattedProduct = formatProduct(productData);
                setProduct(formattedProduct);

                // Fetch related products
                const relatedProductsData = await fetchProducts({
                    category: formattedProduct.category,
                    limit: 10,
                    excludeId: formattedProduct._id
                });
                setRelatedProducts(relatedProductsData.products);

            } catch (err) {
                console.error('Error loading product:', err);
                setError('Error loading product');
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [params]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!product) return <div>No product found</div>;

    const tabs = ['DETALLES DEL PRODUCTO', 'OPINIONES', 'ENVÍOS'];

    return (
        <ShopLayout>
            <div className="container mx-auto px-4 py-8 mt-24">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Product Images */}
                    <div className="relative">
                        <div className="aspect-square relative overflow-hidden rounded-lg mb-4">
                            <Image
                                src={product.images?.[selectedImage] || product.image || '/placeholder.png'}
                                alt={product.name}
                                fill
                                className="object-contain"
                            />
                        </div>
                        {product.images && product.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {product.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`aspect-square relative overflow-hidden rounded border-2 ${selectedImage === index ? 'border-primary' : 'border-transparent'
                                            }`}
                                    >
                                        <Image
                                            src={image}
                                            alt={`${product.name} view ${index + 1}`}
                                            fill
                                            className="object-contain"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-2xl font-semibold text-primary">
                                {product.price.toFixed(2)}€
                            </p>
                            {product.brand && (
                                <p className="text-gray-600">Brand: {product.brand}</p>
                            )}
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <h3 className="font-semibold mb-2">Descripción:</h3>
                                <p className="text-gray-600">{product.description}</p>
                            </div>

                            {product.features && product.features.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-2">Características:</h3>
                                    <ul className="list-disc list-inside text-gray-600">
                                        {product.features.map((feature, index) => (
                                            <li key={index}>{feature}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Add to Birth List button */}
                        <div className="flex flex-col space-y-4">
                            <button
                                onClick={() => {
                                    // Implement birth list functionality
                                    toast.success('Coming soon: Add to birth list');
                                }}
                                className="w-full bg-secondary text-white py-3 px-6 rounded-md hover:bg-secondary-dark transition-colors"
                            >
                                Añadir a Lista de Nacimiento
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mt-12">
                    <div className="border-b border-gray-200">
                        <div className="flex space-x-8">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-4 text-sm font-medium border-b-2 ${activeTab === tab
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="py-6">
                        {activeTab === 'DETALLES DEL PRODUCTO' && (
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Especificaciones</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                                        <div key={key} className="border-b pb-2">
                                            <span className="font-medium">{key}: </span>
                                            <span className="text-gray-600">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {activeTab === 'OPINIONES' && (
                            <div>
                                <p>No hay opiniones todavía.</p>
                            </div>
                        )}
                        {activeTab === 'ENVÍOS' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Información de envío</h3>
                                <p>Envío gratuito para pedidos superiores a 60€</p>
                                <p>Entrega estimada: 2-4 días laborables</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold mb-6">Productos relacionados</h2>
                        <ProductSlider products={relatedProducts} />
                    </div>
                )}
            </div>
        </ShopLayout>
    );
}