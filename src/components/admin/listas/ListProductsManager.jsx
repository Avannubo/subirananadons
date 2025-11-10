'use client';
import { useState, useEffect } from 'react';
// Translation object for Catalan and Spanish
const translations = {
    ca: {
        errorLoad: 'Error en carregar els productes de la llista',
        errorRemove: 'Error en eliminar el producte de la llista',
        errorRemoveInfo: 'Error: Informació del producte incompleta',
        removed: 'Producte eliminat de la llista',
        added: 'Productes afegits a la llista',
        errorAdd: 'Error en afegir productes a la llista',
        noPending: 'No hi ha productes pendents a la llista actual.',
        product: 'Producte',
        price: 'Preu',
        actions: 'Accions',
    },
    es: {
        errorLoad: 'Error al cargar los productos de la lista',
        errorRemove: 'Error al eliminar el producto de la lista',
        errorRemoveInfo: 'Error: Información del producto incompleta',
        removed: 'Producto eliminado de la lista',
        added: 'Productos añadidos a la lista',
        errorAdd: 'Error al añadir productos a la lista',
        noPending: 'No hay productos pendientes en la lista actual.',
        product: 'Producto',
        price: 'Precio',
        actions: 'Acciones',
        productRemoved: 'El producto ha sido eliminado o descatalogado de la tienda',
        productUnavailable: 'Producto no disponible',
    }
};

function getLocale() {
    if (typeof window !== 'undefined') {
        const lang = window.navigator.language || 'es';
        return lang.startsWith('ca') ? 'ca' : 'es';
    }
    return 'es';
}
import { toast } from 'react-hot-toast';
import { FiTrash2, FiPlus } from 'react-icons/fi';
import Image from 'next/image';
import { fetchBirthListItems, updateBirthListItems, removeProductFromBirthList } from '@/services/BirthListService';
import ProductSelection from './ProductSelection';
import { Info, InfoIcon } from 'lucide-react';
export default function ListProductsManager({ listId, onUpdate }) {
    const locale = getLocale();
    const t = translations[locale];
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [showAddProducts, setShowAddProducts] = useState(false);
    const [updatingProductId, setUpdatingProductId] = useState(null);
    useEffect(() => {
        loadItems();
    }, [listId]);
    const loadItems = async () => {
        try {
            setLoading(true);
            const result = await fetchBirthListItems(listId);
            if (result.success) {
                // //console.log('Birth list items loaded:', result.data);

                setItems(result.data || []);
            } else {
                toast.error(t.errorLoad);
            }
        } catch (error) {
            console.error('Error loading birth list items:', error);
            toast.error(t.errorLoad);
        } finally {
            setLoading(false);
        }
    };
    const handleRemoveProduct = async (productId) => {
        if (!productId || !listId) {
            toast.error(t.errorRemoveInfo);
            return;
        }

        // Set updating state for this product
        setUpdatingProductId(productId);

        try {
            // Call API to remove the product
            const result = await removeProductFromBirthList(listId, productId);

            if (result.success) {
                // Only update UI after successful API call
                setItems(prevItems => prevItems.filter(item => item._id !== productId));
                toast.success(t.removed);
                // Notify parent component if callback exists
                if (onUpdate) onUpdate();
            } else {
                toast.error(result.message || t.errorRemove);
            }
        } catch (error) {
            console.error('Error removing product from list:', error);
            toast.error(t.errorRemove);
        } finally {
            setUpdatingProductId(null);
        }
    };

    // Handle adding new products to the birth list
    const handleAddProducts = (selectedProducts) => {
        // Get only the newly added products (not already in items)
        const existingProductIds = items.map(item => item.product._id);
        const newProductsOnly = selectedProducts.filter(
            item => !existingProductIds.includes(item.product._id)
        );

        if (newProductsOnly.length === 0) {
            return;
        }

        // Format items for API
        const updatedItems = [
            ...items,
            ...newProductsOnly.map(item => ({
                product: item.product._id,
                quantity: parseInt(item.quantity),
                reserved: parseInt(item.reserved || 0),

                productSnapshot: {
                    name: item.product.name,
                    reference: item.product.reference,
                    price: item.product.price_incl_tax,
                    image: item.product.image,
                    brand: item.product.brand,
                    category: item.product.category
                }
            }))
        ];

        // Update the birth list with all items
        updateBirthListItems(listId, updatedItems)
            .then(result => {
                if (result.success) {
                    toast.success('Productos añadidos a la lista');
                    setItems(result.data || []);
                    if (onUpdate) onUpdate();
                } else {
                    toast.error('Error al añadir productos a la lista');
                }
            })
            .catch(error => {
                console.error('Error updating birth list items:', error);
                toast.error('Error al añadir productos a la lista');
            });
    };
    return (
        <div className="w-full ">
            {/* Product selection toggle and component */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h4 className="text-gray-700 text-base sm:text-lg">
                    {showAddProducts ? (locale === 'ca' ? 'Seleccionar Productes' : 'Seleccionar Productos') : `${t.product} (${items.length})`}
                </h4>
                {/* Toggle button can be added here if needed */}
            </div>
            {loading && !showAddProducts && (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#36A9E1]" />
                </div>
            )}
            {showAddProducts && (
                <ProductSelection
                    selectedProducts={items}
                    onProductSelect={handleAddProducts}
                    locale={locale}
                    t={t}
                />
            )}
            {!showAddProducts && !loading && (
                <>
                    {items.filter(item => item.state === 0).length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-lg">
                            <InfoIcon className="mx-auto mb-4 h-10 w-10 text-gray-400" />
                            <p className="text-gray-500 mb-4">{t.noPending}</p>
                        </div>
                    ) : (
                        <div className="flex-1 bg-white border border-gray-200 rounded-lg  w-full max-h-[400px] overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 hidden md:table-header-group">
                                    <tr>
                                        <th scope="col" className="px-2 sm:px-6 py-3 text-start min-w-[120px] sm:min-w-[300px] w-[120px] sm:w-[300px] truncate text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t.product}
                                        </th>
                                        <th scope="col" className="px-2 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t.price}
                                        </th>
                                        <th scope="col" className="px-2 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t.actions}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 ">
                                    {items
                                        .filter(item => item.state === 0)
                                        .map((item) => (
                                            <tr key={item._id} className="flex flex-row md:flex-col md:table-row w-full md:w-auto">
                                                <td className="md:px-6 md:py-4 p-2 whitespace-nowrap w-full md:w-[80px] truncate flex flex-row md:table-cell items-center">
                                                    <div className="flex items-center w-full">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md overflow-hidden">
                                                            {item.product ? (
                                                                item.product.image ? (
                                                                    <img
                                                                        src={item.product.image}
                                                                        alt={item.product.name && (item.product.name[locale] || item.product.name.ca || item.product.name.es) ? (item.product.name[locale] || item.product.name.ca || item.product.name.es) : ''}
                                                                        width={40}
                                                                        height={40}
                                                                        className="object-cover w-full h-full"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                                        <InfoIcon className="h-6 w-6 text-gray-400" />
                                                                    </div>
                                                                )
                                                            ) : (
                                                                <div className="w-full h-full bg-red-50 flex items-center justify-center">
                                                                    <InfoIcon className="h-6 w-6 text-red-300" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-2 sm:ml-4 flex-1">
                                                            <div className="text-sm text-start min-w-[120px] sm:min-w-[300px] w-[120px] sm:w-[300px] truncate font-medium text-gray-900">
                                                                {item.product ? (
                                                                    item.product.name && (item.product.name[locale] || item.product.name.ca || item.product.name.es) ?
                                                                        (item.product.name[locale] || item.product.name.ca || item.product.name.es)
                                                                        : item.productSnapshot?.name || t.productUnavailable
                                                                ) : (
                                                                    <span className="text-red-500">{t.productRemoved}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-2 sm:px-6 py-2 md:py-4 whitespace-nowrap text-center text-sm text-gray-500 md:table-cell">
                                                    {item.product ? (
                                                        item.product.discount?.active ? (
                                                            <div className="flex flex-col items-center">
                                                                <span className="text-sm text-gray-400 line-through">
                                                                    {item.product.price_incl_tax.toFixed(2)}€
                                                                </span>
                                                                <span className="text-sm font-medium text-red-600">
                                                                    {item.product.discount.finalPrice?.toFixed(2)} € {item.product.discount.type === 'percentage' ? `(-${item.product.discount.value}%)` : ''}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-gray-500">
                                                                {item.product.price_incl_tax?.toFixed(2) || (item.productSnapshot?.price?.toFixed(2) || '0.00')} €
                                                            </span>
                                                        )
                                                    ) : (
                                                        <span className="text-sm text-red-500">
                                                            {item.productSnapshot?.price?.toFixed(2) || '0.00'} €
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-2 sm:px-6 py-2 md:py-4 whitespace-nowrap text-center text-sm font-medium md:table-cell">
                                                    <button
                                                        onClick={() => handleRemoveProduct(item._id)}
                                                        className="text-red-600 hover:text-red-900"
                                                        disabled={updatingProductId === item._id}
                                                    >
                                                        {updatingProductId === item._id ? (
                                                            <span className="inline-block w-5 h-5 border-2 border-t-transparent border-red-600 rounded-full animate-spin"></span>
                                                        ) : (
                                                            <FiTrash2 className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}