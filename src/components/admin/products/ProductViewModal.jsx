'use client';
import { Dialog } from '@headlessui/react';
import { FiX } from 'react-icons/fi';
import Image from 'next/image';

export default function ProductViewModal({ isOpen, onClose, product }) {
    if (!product) return null;

    // Format price with 2 decimal places and € symbol
    const formatPrice = (price) => {
        return `${parseFloat(price).toFixed(2)} €`;
    };

    // Calculate available stock
    const availableStock = (product.stock?.physical || 0) - (product.stock?.reserved || 0);

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b">
                        <Dialog.Title className="text-lg font-medium">
                            Detalles del Producto
                        </Dialog.Title>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="p-6 max-h-[80vh] overflow-y-auto">
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Product Image */}
                            <div className="md:w-1/3 flex justify-center">
                                {product.image ? (
                                    <div className="relative h-48 w-48">
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            style={{ objectFit: 'contain' }}
                                            className="rounded-md"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-48 w-48 bg-gray-100 flex items-center justify-center rounded-md">
                                        <span className="text-gray-400">Sin imagen</span>
                                    </div>
                                )}
                            </div>

                            {/* Product Details */}
                            <div className="md:w-2/3">
                                <h2 className="text-xl font-semibold text-gray-800">{product.name}</h2>

                                <div className="mt-2 space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-500">Referencia:</span>
                                        <span className="text-sm text-gray-700">{product.reference}</span>
                                    </div>

                                    <div className="flex flex-wrap gap-4">
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Categoría:</span>
                                            <span className="ml-2 text-sm text-gray-700">{product.category || 'N/A'}</span>
                                        </div>

                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Marca:</span>
                                            <span className="ml-2 text-sm text-gray-700">{product.brand || 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Precio (sin IVA):</span>
                                            <span className="ml-2 text-sm text-gray-700">
                                                {product.price_excl_tax ? formatPrice(product.price_excl_tax) : 'N/A'}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Precio (con IVA):</span>
                                            <span className="ml-2 text-sm text-gray-700">
                                                {product.price_incl_tax ? formatPrice(product.price_incl_tax) : 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Stock Físico:</span>
                                            <span className="ml-2 text-sm text-gray-700">
                                                {product.stock?.physical !== undefined ? product.stock.physical : 'N/A'}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Stock Reservado:</span>
                                            <span className="ml-2 text-sm text-gray-700">
                                                {product.stock?.reserved !== undefined ? product.stock.reserved : 'N/A'}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Stock Disponible:</span>
                                            <span className={`ml-2 text-sm ${availableStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {availableStock}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-500">Estado:</span>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.status === 'active' ? 'bg-green-100 text-green-800' :
                                            product.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                            {product.status === 'active' ? 'Activo' :
                                                product.status === 'inactive' ? 'Inactivo' :
                                                    'Descontinuado'}
                                        </span>
                                    </div>

                                    {product.featured && (
                                        <div className="flex items-center space-x-2">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                Producto Destacado
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {product.description && (
                                    <div className="mt-6">
                                        <h3 className="text-sm font-medium text-gray-700">Descripción</h3>
                                        <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">
                                            {product.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t flex justify-end">
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