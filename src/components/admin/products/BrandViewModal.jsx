'use client';
import { FiX, FiExternalLink } from 'react-icons/fi';
export default function BrandViewModal({ isOpen, onClose, brand }) {
    if (!isOpen || !brand) return null;
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-start pt-10 p-4 overflow-y-auto">
            <div className="bg-white rounded-md shadow w-full max-w-lg">
                <div className="flex justify-between items-center p-4 border-b border-gray-300">
                    <h2 className="text-xl font-medium">
                        Detalles de la marca
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Logo Section */}
                        <div className="md:w-1/3 flex flex-col items-center">
                            {brand.logo ? (
                                <img
                                    src={brand.logo}
                                    alt={brand.name}
                                    className="w-32 h-32 object-cover border border-gray-300 rounded p-2"
                                    onError={(e) => { e.target.src = '/placeholder.png'; }}
                                />
                            ) : (
                                <div className="w-32 h-32 flex items-center justify-center bg-gray-100 border border-gray-300 rounded p-2">
                                    <span className="text-gray-400 text-sm">No hay logotipo</span>
                                </div>
                            )}
                            <div className="mt-3 text-center">
                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${brand.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {brand.enabled ? 'Activado' : 'Desactivado'}
                                </span>
                            </div>
                        </div>
                        {/* Details Section */}
                        <div className="md:w-2/3">
                            <div className="space-y-3">
                                <div>
                                    <h4 className="text-sm text-gray-500">ID</h4>
                                    <p className="font-medium">{brand.id || brand._id || 'N/A'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm text-gray-500">Nombre</h4>
                                    <p className="font-medium">{brand.name || 'N/A'}</p>
                                </div>
                                {brand.slug && (
                                    <div>
                                        <h4 className="text-sm text-gray-500">Slug</h4>
                                        <p>{brand.slug}</p>
                                    </div>
                                )}
                                {brand.description && (
                                    <div>
                                        <h4 className="text-sm text-gray-500">Descripción</h4>
                                        <p>{brand.description}</p>
                                    </div>
                                )}
                                {brand.website && (
                                    <div>
                                        <h4 className="text-sm text-gray-500">Sitio web</h4>
                                        <a
                                            href={brand.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline flex items-center"
                                        >
                                            {brand.website}
                                            <FiExternalLink className="ml-1" />
                                        </a>
                                    </div>
                                )}
                                <div>
                                    <h4 className="text-sm text-gray-500">Productos</h4>
                                    <p>{brand.products || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end p-4 border-t border-gray-300">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
} 