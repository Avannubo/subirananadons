'use client';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiTrash2, FiPlus } from 'react-icons/fi';
import Image from 'next/image';
import { fetchBirthListItems, updateBirthListItems, removeProductFromBirthList } from '@/services/BirthListService';
import ProductSelection from './ProductSelection';
import { Info, InfoIcon } from 'lucide-react';
export default function ListProductsManager({ listId, onUpdate }) {
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
                setItems(result.data || []);
            } else {
                toast.error('Error al cargar los productos de la lista');
            }
        } catch (error) {
            console.error('Error loading birth list items:', error);
            toast.error('Error al cargar los productos de la lista');
        } finally {
            setLoading(false);
        }
    }; const handleRemoveProduct = async (productId) => {
        if (!productId || !listId) {
            toast.error('Error: Información del producto incompleta');
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
                toast.success('Producto eliminado de la lista');
                // Notify parent component if callback exists
                if (onUpdate) onUpdate();
            } else {
                toast.error(result.message || 'Error al eliminar el producto de la lista');
            }
        } catch (error) {
            console.error('Error removing product from list:', error);
            toast.error('Error al eliminar el producto de la lista');
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
                priority: parseInt(item.priority || 2),
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
        <div className=" ">
            {/* <h3 className="text-lg font-medium text-gray-900 mb-4">Productos en la Lista</h3> */}
            {/* Toggle between product list and add products */}
            {/* <div className="flex justify-between items-center mb-4">
                <h4 className="text-gray-700">
                    {showAddProducts ? 'Seleccionar Productos' : `Productos (${items.length})`}
                </h4>
                {/* <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowAddProducts(!showAddProducts);
                    }}
                    className="flex items-center px-3 py-1 text-sm bg-[#00B0C8] text-white rounded-md hover:bg-[#008da0]"
                >
                    {showAddProducts ? (
                        'Volver a la lista'
                    ) : (
                        <>
                            <FiPlus className="mr-1" /> Añadir Productos
                        </>
                    )}
                </button>  
            </div> */}
            {/* Loading state */}

            {loading && !showAddProducts && (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00B0C8]"></div>
                </div>
            )}
            {/* Product selection component */}
            {/* {showAddProducts && (
                <ProductSelection
                    selectedProducts={items}
                    onProductSelect={handleAddProducts}
                />
            )} */}
            {/* Product list */}
            {!showAddProducts && !loading && (
                <>
                    {items.filter(item => item.state === 0).length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-lg">
                            <InfoIcon className="mx-auto mb-4 h-10 w-10 text-gray-400" />
                            <p className="text-gray-500 mb-4">No hay productos pendientes en la lista actual.</p>
                            {/* <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowAddProducts(true);
                            }}
                            className="px-4 py-2 bg-[#00B0C8] text-white rounded-md hover:bg-[#008da0]"
                        >
                            Añadir Productos
                        </button> */}
                        </div>
                    ) : (
                        <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden w-full max-h-[400px] overflow-y-auto">
                            <table className="flex-1 min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Producto
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Precio
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {items
                                        .filter(item => item.state === 0)
                                        .map((item) => (
                                            <tr key={item._id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md overflow-hidden">
                                                            {item.product.image && (
                                                                <Image
                                                                    src={item.product.image}
                                                                    alt={item.product.name}
                                                                    width={40}
                                                                    height={40}
                                                                    className="object-cover w-full h-full"
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {item.product.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {item.product.brand}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {item.product.price_incl_tax?.toFixed(2).replace('.', ',')} €
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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