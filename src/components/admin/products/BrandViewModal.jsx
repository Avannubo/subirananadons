'use client';
import { FiX, FiExternalLink } from 'react-icons/fi';
export default function BrandViewModal({ isOpen, onClose, brand }) {
    if (!isOpen || !brand) return null;
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-start pt-10 p-4 overflow-y-auto">
            <div className="bg-white rounded-md shadow w-full max-w-lg">
                <div className="flex justify-between items-center p-4 border-b border-gray-300">
                    <h2 className="text-xl font-medium">
                        Detalls de la marca
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
                        <div className="  flex flex-col items-center">
                            {brand.logo ? (
                                <img
                                    src={brand.logo}
                                    alt={brand.name}
                                    className="w-64 h-64 object-contain border border-gray-300 rounded p-2"
                                    onError={(e) => { e.target.src = '/placeholder.png'; }}
                                />
                            ) : (
                                <div className="w-32 h-32 flex items-center justify-center bg-gray-100 border border-gray-300 rounded p-2">
                                    <span className="text-gray-400 text-sm">No hi ha logotip</span>
                                </div>
                            )}

                        </div>
                        {/* Details Section */}
                        <div className="md:w-1/2">
                            <div className="space-y-3">
                                <div>
                                    <h4 className="text-sm text-gray-500">ID</h4>
                                    <p className="font-medium">{brand.id || brand._id || 'N/D'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm text-gray-500">Nom</h4>
                                    <p className="font-medium">{brand.name || 'N/D'}</p>
                                </div>
                                {brand.slug && (
                                    <div>
                                        <h4 className="text-sm text-gray-500">Slug</h4>
                                        <p>{brand.slug}</p>
                                    </div>
                                )}
                                {brand.description && (
                                    <div>
                                        <h4 className="text-sm text-gray-500">Descripció</h4>
                                        <p>{brand.description}</p>
                                    </div>
                                )}
                                {brand.website && (
                                    <div>
                                        <h4 className="text-sm text-gray-500">Lloc web</h4>
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

                                <div className="mt-3 text-start">
                                    <span className='text-sm text-gray-500'>
                                    Estat: 
                                    </span> <span>  </span>
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${brand.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                                        }`}>
                                        {brand.enabled ? 'Actiu' : 'Inactiu'}
                                    </span>
                                </div>

                                
                                {/* Discount Section */}
                                {brand.discount && (
                                    <div className="border-t border-gray-200 pt-3 mt-3">
                                        <h4 className="text-sm text-gray-500 mb-2">Informació del descompte</h4>
                                        {brand.discount.active ? (
                                            <div className="space-y-2">
                                                <div>
                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        {brand.discount.type === 'percentage'
                                                            ? `${brand.discount.value}%`
                                                            : `${brand.discount.value}€`}
                                                    </span>
                                                    {/* <span className="ml-2 text-sm text-gray-500">
                                                        {new Date(brand.discount.endDate) > new Date() ? 'Actiu' : 'Caducat'}
                                                    </span> */}
                                                </div>
                                                {
                                                    brand.discount.startDate && brand.discount.endDate && (
                                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                                            <div>
                                                                <span className="text-gray-500">Data d'inici:</span>
                                                                <p>{brand.discount.startDate
                                                                    ? new Date(brand.discount.startDate).toLocaleDateString('ca-ES', {
                                                                        year: 'numeric',
                                                                        month: 'long',
                                                                        day: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })
                                                                    : 'No especificada'}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">Data de fi:</span>
                                                                <p>{brand.discount.endDate
                                                                    ? new Date(brand.discount.endDate).toLocaleDateString('ca-ES', {
                                                                        year: 'numeric',
                                                                        month: 'long',
                                                                        day: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })
                                                                    : 'No especificada'}
                                                                </p>
                                                            </div>

                                                            {brand.discount.minPurchaseAmount && (
                                                                <div>
                                                                    <span className="text-gray-500">Import mínim:</span>
                                                                    <p>{brand.discount.minPurchaseAmount}€</p>
                                                                </div>
                                                            )}

                                                            {brand.discount.minQuantity && (
                                                                <div>
                                                                    <span className="text-gray-500">Quantitat mínima:</span>
                                                                    <p>{brand.discount.minQuantity} unitats</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                }

                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic">Descompte no actiu</p>
                                        )}
                                    </div>
                                )}

                               
                                {/* <div>
                                    <h4 className="text-sm text-gray-500">Productes</h4>
                                    <p>{brand.products || 0}</p>
                                </div> */}
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
                        Tancar
                    </button>
                </div>
            </div>
        </div>
    );
} 