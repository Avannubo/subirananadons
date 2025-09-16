'use client';
import { Dialog } from '@headlessui/react';
import { FiX, FiPackage, FiDollarSign, FiTag, FiBox, FiImage } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import useShopParameter from '@/lib/useShopParameter';
export default function ProductViewModal({ isOpen, onClose, product, categories = [], brands = [] }) {
    // Get IVA value from shop parameters
    const { value: ivaValue, loading: ivaLoading } = useShopParameter('iva');
    // Language state for translation switcher
    const [lang, setLang] = useState('ca');
    // Do not reset lang on product change, only set default on first mount
    if (!product) return null;
    // Get all product images for the gallery
    const [galleryImages, setGalleryImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState('/assets/images/product-placeholder.jpg');
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
            // Make sure we never set an empty string
            if (images.length > 0 && images[0]) {
                setSelectedImage(images[0]);
            } else {
                setSelectedImage('/assets/images/product-placeholder.jpg');
            }
        }
    }, [product]);
    // Format price with 2 decimal places and € symbol
    const formatPrice = (price) => {
        if (price === '' || price === undefined || price === null || isNaN(price)) return 'N/D';
        return `${parseFloat(price).toFixed(2)} €`;
    };
    // Auto-calculate price without IVA from price_incl_tax and IVA value
    const autoPriceExclTax = (() => {
        const iva = parseFloat(ivaValue || '21');
        const incl = parseFloat(product.price_incl_tax || '');
        if (!incl || isNaN(incl) || !iva || isNaN(iva)) return '';
        return (incl / (1 + iva / 100)).toFixed(2);
    })();
    // Calculate available stock
    const availableStock = product.stock?.available || 0;
    // Helper to get display name from populated object or string
    const getDisplayName = (field) => {
        if (!field) return '';
        if (typeof field === 'string') return field;
        if (typeof field === 'object') {
            // If has a name property (populated), or translation object
            if (field.name) return typeof field.name === 'object' ? (field.name[lang] || field.name.es || field.name.ca || '') : field.name;
            // If translation object
            if (field[lang] || field.es || field.ca) return field[lang] || field.es || field.ca || '';
        }
        return '';
    };
    const categoryDisplay = getDisplayName(product.category);
    const brandDisplay = getDisplayName(product.brand);
    // Get translated name/description (only these two fields are translated)
    const getTranslated = (field) => {
        if (!field) return '';
        if (typeof field === 'string') return field;
        if (typeof field === 'object') return field[lang] || field.es || field.ca || '';
        return '';
    };
    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-7xl bg-white rounded-lg shadow-xl overflow-hidden">
                    {/* Header with product name */}
                    <div className="flex justify-between items-center p-4 border-b border-gray-300 bg-gray-50">
                        <Dialog.Title className="text-lg font-medium text-gray-800 flex items-center">
                            <FiPackage className="mr-2 text-[#36A9E1]" />
                            {getTranslated(product.name)}
                        </Dialog.Title>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setLang('es')}
                                className={`px-2 py-1 rounded text-xs font-medium border ${lang === 'es' ? 'bg-[#36A9E1] text-white border-[#36A9E1]' : 'bg-white text-gray-700 border-gray-300'}`}
                            >ES</button>
                            <button
                                onClick={() => setLang('ca')}
                                className={`px-2 py-1 rounded text-xs font-medium border ${lang === 'ca' ? 'bg-[#36A9E1] text-white border-[#36A9E1]' : 'bg-white text-gray-700 border-gray-300'}`}
                            >CA</button>
                            <button
                                onClick={onClose}
                                className="ml-2 text-gray-400 hover:text-gray-500"
                            >
                                <FiX className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                    <div className="p-6 max-h-[80vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Left column - Product Image */}
                            <div className="md:col-span-1 flex flex-col items-start">
                                <div className="bg-white p-1 rounded-lg border border-gray-200 w-full">
                                    <div className="relative h-56 w-full">
                                        <img
                                            src={selectedImage || '/assets/images/product-placeholder.jpg'}
                                            alt={product.name || 'Product image'}
                                            fill
                                            style={{ objectFit: 'contain' }}
                                            className="rounded-md h-56 w-full object-contain"
                                        />
                                    </div>
                                </div>
                                {/* Product Gallery */}
                                {galleryImages.length > 1 && (
                                    <div className="w-full mt-3">
                                        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2 flex items-center">
                                            <FiImage className="mr-1 text-[#36A9E1]" /> Galeria ({galleryImages.length} imatges)
                                        </h4>
                                        <div className="flex space-x-2 overflow-x-auto pb-2">
                                            {galleryImages.map((img, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setSelectedImage(img)}
                                                    className={`flex-shrink-0 w-14 h-14 relative rounded border ${selectedImage === img
                                                        ? 'border-[#36A9E1] ring-2 ring-[#36A9E1]/30'
                                                        : 'border-gray-200 hover:border-gray-300'}`}
                                                    style={{ minWidth: '3.5rem', minHeight: '3.5rem', maxWidth: '3.5rem', maxHeight: '3.5rem', overflow: 'hidden' }}
                                                >
                                                    <img
                                                        src={img || '/assets/images/product-placeholder.jpg'}
                                                        alt={`Thumbnail ${index + 1}`}
                                                        height={56}
                                                        width={56}
                                                        className="rounded object-contain"
                                                        style={{ maxWidth: '100%', maxHeight: '100%', minWidth: 0, minHeight: 0, display: 'block' }}
                                                    />
                                                    {index === 0 && (
                                                        <div className="absolute top-0 left-0 bg-[#36A9E1] text-white text-[8px] px-1">
                                                            Principal
                                                        </div>
                                                    )}
                                                    {index === 1 && product.imageHover && (
                                                        <div className="absolute top-0 left-0 bg-indigo-500 text-white text-[8px] px-1">
                                                            Secundària
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {/* Status indicators */}
                                <div className="flex flex-wrap gap-2 justify-start items-center mt-4">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${product.status === 'active' ? 'bg-green-100 text-green-800' :
                                        product.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                        {product.status === 'active' ? 'Actiu' :
                                            product.status === 'inactive' ? 'Inactiu' :
                                                'Descatalogat'}
                                    </span>
                                    {product.featured && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            Destacat
                                        </span>
                                    )}
                                </div>
                            </div>
                            {/* Right column - Product Details */}
                            <div className="md:col-span-2 space-y-6 space-x-0">
                                {/* Basic Information */}
                                <section className="border-b border-gray-200 pb-4 space-y-2">
                                    <h3 className="text-sm font-semibold text-gray-800 uppercase mb-3 flex items-center">
                                        <FiTag className="mr-2 text-[#36A9E1]" /> Informació bàsica
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <div className="space-y-2">
                                            <div className='bg-gray-50 p-2 rounded-lg border border-gray-200'>
                                                <span className="text-sm font-medium text-gray-500">ID:</span>
                                                <p className="text-sm text-gray-700">{product._id || product.id || 'N/D'}</p>
                                            </div><div className='bg-gray-50 p-2 rounded-lg border border-gray-200'>
                                                <span className="text-sm font-medium text-gray-500">Referència:</span>
                                                <p className="text-sm text-gray-700">{product.reference || 'N/D'}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2"> <div className='bg-gray-50 p-2 rounded-lg border border-gray-200'>
                                            <span className="text-sm font-medium text-gray-500">Categoria:</span>
                                            <p className="text-sm text-gray-700">{categoryDisplay || 'N/D'}</p>
                                        </div>
                                            <div className='bg-gray-50 p-2 rounded-lg border border-gray-200'>
                                                <span className="text-sm font-medium text-gray-500">Marca:</span>
                                                <p className="text-sm text-gray-700">{brandDisplay || 'N/D'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {product.description && (
                                        <section>
                                            <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                                                <h3 className="text-sm font-medium text-gray-500">Descripció:</h3>
                                                {(() => {
                                                    const desc = getTranslated(product.description);
                                                    if (!desc) return null;
                                                    // Split by new lines
                                                    const lines = desc.split(/\r?\n/);
                                                    // Find first bullet point (• or -)
                                                    let firstBulletIdx = lines.findIndex(line => /^\s*[•\-]/.test(line));
                                                    if (firstBulletIdx === -1) firstBulletIdx = lines.length;
                                                    const intro = lines.slice(0, firstBulletIdx).join(' ').trim();
                                                    const bullets = lines.slice(firstBulletIdx)
                                                        .map(line => line.replace(/^\s*[•\-]\s*/, '').trim())
                                                        .filter(line => line.length > 0);
                                                    return <>
                                                        {intro && <p className="text-sm text-gray-700 whitespace-pre-line">{intro}</p>}
                                                        {bullets.length > 0 && (
                                                            <ul className="list-disc list-inside space-y-1 text-gray-700 mt-2 text-sm">
                                                                {bullets.map((line, idx) => <li key={idx}>{line}</li>)}
                                                            </ul>
                                                        )}
                                                    </>;
                                                })()}
                                            </div>
                                        </section>
                                    )}
                                </section>
                                {/* Pricing Information */}
                                <section className="border-b border-gray-200 pb-4">
                                    <h3 className="text-sm font-semibold text-gray-800 uppercase mb-3 flex items-center">
                                        <FiDollarSign className="mr-2 text-[#36A9E1]" /> Preus
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                                            <span className="text-sm font-medium text-gray-500">Preu (sense IVA):</span>
                                            <p className="text-base font-medium text-gray-800">
                                                {/* Show auto-calculated price excl tax if possible, fallback to product.price_excl_tax */}
                                                {autoPriceExclTax ? formatPrice(autoPriceExclTax) : (product.price_excl_tax ? formatPrice(product.price_excl_tax) : 'N/D')}
                                                {/* {ivaLoading && <span className="ml-2 text-xs text-gray-400">(calculant IVA...)</span>} */}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                                            <span className="text-sm font-medium text-gray-500">Preu (amb IVA):</span>
                                            <p className="text-base font-medium text-gray-800">
                                                {product.price_incl_tax ? formatPrice(product.price_incl_tax) : 'N/D'}
                                            </p>
                                        </div>
                                        {product.discount?.active && (
                                            <>
                                                <div className="bg-gray-50 p-2 rounded-lg border border-gray-200 md:col-span-2">
                                                    <span className="text-sm font-medium text-gray-500">Descompte:</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-base font-medium text-green-600">
                                                            {product.discount.type === 'percentage'
                                                                ? `${product.discount.value}% de descompte`
                                                                : `${formatPrice(product.discount.value)} de descompte`}
                                                        </span>
                                                        {product.discount.active && (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                Actiu
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-2">
                                                        <span className="text-sm font-medium text-gray-500">Preu final amb descompte:</span>
                                                        <p className="text-base font-medium text-green-600">
                                                            {product.discount.type === 'percentage'
                                                                ? formatPrice(product.price_incl_tax * (1 - product.discount.value / 100))
                                                                : formatPrice(Math.max(0, product.price_incl_tax - product.discount.value))}
                                                        </p>
                                                    </div>
                                                    {(product.discount.startDate || product.discount.endDate) && (
                                                        <div className="mt-2 flex gap-4">
                                                            {product.discount.startDate && (
                                                                <div>
                                                                    <span className="text-sm font-medium text-gray-500">Data d'inici:</span>
                                                                    <p className="text-sm text-gray-700">
                                                                        {new Date(product.discount.startDate).toLocaleString('ca')}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {product.discount.endDate && (
                                                                <div>
                                                                    <span className="text-sm font-medium text-gray-500">Data de fi:</span>
                                                                    <p className="text-sm text-gray-700">
                                                                        {new Date(product.discount.endDate).toLocaleString('ca')}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    {(product.discount.minPurchaseAmount > 0 || product.discount.minQuantity > 1) && (
                                                        <div className="mt-2 flex gap-4">
                                                            {product.discount.minPurchaseAmount > 0 && (
                                                                <div>
                                                                    <span className="text-sm font-medium text-gray-500">Import mínim:</span>
                                                                    <p className="text-sm text-gray-700">
                                                                        {formatPrice(product.discount.minPurchaseAmount)}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {product.discount.minQuantity > 1 && (
                                                                <div>
                                                                    <span className="text-sm font-medium text-gray-500">Quantitat mínima:</span>
                                                                    <p className="text-sm text-gray-700">
                                                                        {product.discount.minQuantity} unitats
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </section>
                                {/* Inventory Information */}
                                <section className="  border-gray-200 pb-4">
                                    <h3 className="text-sm font-semibold text-gray-800 uppercase mb-3 flex items-center">
                                        <FiBox className="mr-2 text-[#36A9E1]" /> Inventari
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                                            <span className="text-sm font-medium text-gray-500">Estoc disponible:</span>
                                            <p className={`text-base font-medium ${availableStock >= (product.stock?.minStock || 5) ? 'text-green-600' : 'text-red-600'}`}>
                                                {availableStock}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                                            <span className="text-sm font-medium text-gray-500">Estoc mínim:</span>
                                            <p className="text-base font-medium text-gray-800">
                                                {product.stock?.minStock !== undefined ? product.stock.minStock : '0'}
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-t border-gray-300 bg-gray-50 flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            Tancar
                        </button>
                    </div>
                </Dialog.Panel>
            </div >
        </Dialog >
    );
}