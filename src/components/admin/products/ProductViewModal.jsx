'use client';
import { Dialog } from '@headlessui/react';
import { FiX, FiPackage, FiDollarSign, FiTag, FiBox, FiImage } from 'react-icons/fi';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function ProductViewModal({ isOpen, onClose, product }) {
    if (!product) return null;

    // Get all product images for the gallery
    const [galleryImages, setGalleryImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState('');

    // Update images when product changes
    useEffect(() => {
        if (product) {
            const images = [];

            // Add main image
            if (product.image) {
                images.push(product.image);
            }

            // Add hover image if it exists and is different
            if (product.imageHover && product.imageHover !== product.image) {
                images.push(product.imageHover);
            }

            // Add additional images if they exist
            if (product.additionalImages && Array.isArray(product.additionalImages) && product.additionalImages.length > 0) {
                images.push(...product.additionalImages);
            }

            // If no images, add placeholder
            if (images.length === 0) {
                images.push('/assets/images/product-placeholder.jpg');
            }

            setGalleryImages(images);
            setSelectedImage(images[0]);
        }
    }, [product]);

    // Format price with 2 decimal places and € symbol
    const formatPrice = (price) => {
        return `${parseFloat(price).toFixed(2)} €`;
    };

    // Calculate available stock
    const availableStock = product.stock?.available || 0;

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden">
                    {/* Header with product name */}
                    <div className="flex justify-between items-center p-4 border-b border-gray-300 bg-gray-50">
                        <Dialog.Title className="text-lg font-medium text-gray-800 flex items-center">
                            <FiPackage className="mr-2 text-[#00B0C8]" />
                            {product.name}
                        </Dialog.Title>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="p-6 max-h-[80vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Left column - Product Image */}
                            <div className="md:col-span-1 flex flex-col items-center">
                                <div className="bg-gray-50 p-1 rounded-lg border border-gray-200 w-full">
                                    <div className="relative h-56 w-full">
                                        <Image
                                            src={selectedImage}
                                            alt={product.name}
                                            fill
                                            style={{ objectFit: 'contain' }}
                                            className="rounded-md"
                                        />
                                    </div>
                                </div>
                                {/* Product Gallery */}
                                {galleryImages.length > 1 && (
                                    <div className="w-full mt-3">
                                        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2 flex items-center">
                                            <FiImage className="mr-1 text-[#00B0C8]" /> Galería ({galleryImages.length} imágenes)
                                        </h4>
                                        <div className="flex space-x-2 overflow-x-auto pb-2">
                                            {galleryImages.map((img, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setSelectedImage(img)}
                                                    className={`flex-shrink-0 w-14 h-14 relative rounded border ${selectedImage === img
                                                        ? 'border-[#00B0C8] ring-2 ring-[#00B0C8]/30'
                                                        : 'border-gray-200 hover:border-gray-300'}`}
                                                >
                                                    <Image
                                                        src={img}
                                                        alt={`Thumbnail ${index + 1}`}
                                                        fill
                                                        style={{ objectFit: 'contain' }}
                                                        className="rounded"
                                                    />
                                                    {index === 0 && (
                                                        <div className="absolute top-0 left-0 bg-[#00B0C8] text-white text-[8px] px-1">
                                                            Principal
                                                        </div>
                                                    )}
                                                    {index === 1 && product.imageHover && (
                                                        <div className="absolute top-0 left-0 bg-indigo-500 text-white text-[8px] px-1">
                                                            Hover
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {/* Status indicators */}
                                <div className="flex flex-wrap gap-2 justify-center mt-4">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${product.status === 'active' ? 'bg-green-100 text-green-800' :
                                        product.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                        {product.status === 'active' ? 'Activo' :
                                            product.status === 'inactive' ? 'Inactivo' :
                                                'Descontinuado'}
                                    </span>
                                    {product.featured && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            Destacado
                                        </span>
                                    )}
                                </div>
                            </div>
                            {/* Right column - Product Details */}
                            <div className="md:col-span-2 space-y-6">
                                {/* Basic Information */}
                                <section className="border-b border-gray-200 pb-4">
                                    <h3 className="text-sm font-semibold text-gray-800 uppercase mb-3 flex items-center">
                                        <FiTag className="mr-2 text-[#00B0C8]" /> Información Básica
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Referencia:</span>
                                                <p className="text-sm text-gray-700">{product.reference || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Categoría:</span>
                                                <p className="text-sm text-gray-700">{product.category || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Marca:</span>
                                                <p className="text-sm text-gray-700">{product.brand || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">ID:</span>
                                                <p className="text-sm text-gray-700">{product._id || product.id || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                                {/* Pricing Information */}
                                <section className="border-b border-gray-200 pb-4">
                                    <h3 className="text-sm font-semibold text-gray-800 uppercase mb-3 flex items-center">
                                        <FiDollarSign className="mr-2 text-[#00B0C8]" /> Precios
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-3 rounded">
                                            <span className="text-sm font-medium text-gray-500">Precio (sin IVA):</span>
                                            <p className="text-base font-medium text-gray-800">
                                                {product.price_excl_tax ? formatPrice(product.price_excl_tax) : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded">
                                            <span className="text-sm font-medium text-gray-500">Precio (con IVA):</span>
                                            <p className="text-base font-medium text-gray-800">
                                                {product.price_incl_tax ? formatPrice(product.price_incl_tax) : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </section>
                                {/* Inventory Information */}
                                <section className="border-b border-gray-200 pb-4">
                                    <h3 className="text-sm font-semibold text-gray-800 uppercase mb-3 flex items-center">
                                        <FiBox className="mr-2 text-[#00B0C8]" /> Inventario
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-gray-50 p-3 rounded">
                                            <span className="text-sm font-medium text-gray-500">Stock Disponible:</span>
                                            <p className={`text-base font-medium ${availableStock >= (product.stock?.minStock || 5) ? 'text-green-600' : 'text-red-600'}`}>
                                                {availableStock}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded">
                                            <span className="text-sm font-medium text-gray-500">Stock Mínimo:</span>
                                            <p className="text-base font-medium text-gray-800">
                                                {product.stock?.minStock !== undefined ? product.stock.minStock : '0'}
                                            </p>
                                        </div>
                                    </div>
                                </section>
                                {/* Description if available */}
                                {product.description && (
                                    <section>
                                        <h3 className="text-sm font-semibold text-gray-800 uppercase mb-3">Descripción</h3>
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <p className="text-sm text-gray-600 whitespace-pre-line">
                                                {product.description}
                                            </p>
                                        </div>
                                    </section>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-t border-gray-300 bg-gray-50 flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            Cerrar
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
} 