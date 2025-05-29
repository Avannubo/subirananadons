'use client';
import { useState, useEffect } from 'react';
import { FiX, FiPackage, FiMapPin, FiUser, FiCreditCard, FiTruck, FiCalendar, FiDollarSign, FiFileText, FiMessageSquare } from 'react-icons/fi';

export default function OrderViewModal({ isOpen, onClose, orderId, isLoading }) {
    const [order, setOrder] = useState(null);
    const [error, setError] = useState(null);
    const [loadingOrder, setLoadingOrder] = useState(false);
    const [products, setProducts] = useState({});
    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRIES = 3;

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!orderId) return;

            setLoadingOrder(true);
            setError(null);

            try {
                const response = await fetch(`/api/orders/${orderId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                let data;
                try {
                    data = await response.json();
                } catch (parseError) {
                    console.error('Error parsing response:', parseError);
                    throw new Error('Failed to parse server response');
                }

                if (!response.ok) {
                    throw new Error(data?.message || `Failed to fetch order (Status: ${response.status})`);
                }

                if (data.success && data.order) {
                    setOrder(data.order);
                    setError(null);
                    setRetryCount(0);

                    if (data.order?.items?.length > 0) {
                        await fetchProductDetails(data.order.items);
                    }
                } else {
                    throw new Error(data?.message || 'Invalid order data received');
                }
            } catch (err) {
                console.error('Error fetching order details:', err);
                setError(err.message);

                if (retryCount < MAX_RETRIES) {
                    setRetryCount(prev => prev + 1);
                    setTimeout(() => {
                        fetchOrderDetails();
                    }, 1000 * (retryCount + 1));
                }
            } finally {
                setLoadingOrder(false);
            }
        };

        if (isOpen && orderId) {
            fetchOrderDetails();
        }

        return () => {
            setOrder(null);
            setError(null);
            setProducts({});
            setRetryCount(0);
        };
    }, [isOpen, orderId, retryCount]);

    const fetchProductDetails = async (items) => {
        try {
            const productsMap = {};

            for (const item of items) {
                if (item.product && !productsMap[item.product]) {
                    try {
                        const response = await fetch(`${window.location.origin}/api/products/${item.product}`);

                        if (!response.ok) {
                            console.error(`Failed to fetch product ${item.product}: ${response.status}`);
                            continue;
                        }

                        const data = await response.json();
                        console.log('Product API response:', data);

                        if (data.product) {
                            productsMap[item.product] = data.product;
                        } else if (data.success && data.data) {
                            productsMap[item.product] = data.data;
                        } else if (data) {
                            productsMap[item.product] = data;
                        }
                    } catch (err) {
                        console.error(`Error fetching product ${item.product}:`, err);
                    }
                }
            }

            console.log('Final products map:', productsMap);
            setProducts(productsMap);
        } catch (error) {
            console.error("Error fetching product details:", error);
        }
    };

    if (!isOpen) return null;

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    };

    const formatPrice = (price) => {
        if (!price || parseFloat(price) === 0) {
            return 'Gratis';
        }
        return `${parseFloat(price).toFixed(2)} €`;
    };

    const mapStatus = (status) => {
        const statusMap = {
            'pending': 'Pendiente de pago',
            'processing': 'Pago aceptado',
            'shipped': 'Enviado',
            'delivered': 'Entregado',
            'cancelled': 'Cancelado'
        };
        return statusMap[status] || status;
    };

    const getStatusColorClass = (status) => {
        const colorMap = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'processing': 'bg-green-100 text-green-800',
            'shipped': 'bg-blue-100 text-blue-800',
            'delivered': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        return colorMap[status] || 'bg-gray-100 text-gray-800';
    };

    const getProductDetails = (productId) => {
        return products[productId] || null;
    };

    return (
        <div className="fixed inset-0 bg-[#00000050] bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className='rounded-lg overflow-hidden'>
                    <div className="flex justify-between items-center border-b border-gray-300 p-4 sticky top-0 bg-white z-10">
                        <h3 className="text-xl font-semibold flex items-center">
                            <FiPackage className="mr-2 text-[#00B0C8]" />
                            Detalles del Pedido
                            {order && <span className="ml-2 text-[#00B0C8]">#{order.orderNumber}</span>}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <FiX size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-grow overflow-auto rounded-lg">
                        {loadingOrder ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B0C8]"></div>
                            </div>
                        ) : error ? (
                            <div className="p-6">
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                    <p>{error}</p>
                                </div>
                            </div>
                        ) : order ? (
                            <div className="p-6">
                                {/* Order Summary Card */}
                                <div className="rounded-lg mb-6">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center">
                                            <div className="bg-blue-100 bg-opacity-10 p-2 rounded-full mr-3">
                                                <FiCalendar className="text-[#00B0C8]" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Fecha</p>
                                                <p className="font-medium text-sm">{formatDate(order.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center">
                                            <div className="bg-green-100 p-2 rounded-full mr-3">
                                                <FiDollarSign className="text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Total</p>
                                                <p className="font-medium text-sm">{formatPrice(order.totalAmount)}</p>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center">
                                            <div className="bg-purple-100 p-2 rounded-full mr-3">
                                                <FiCreditCard className="text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Método de pago</p>
                                                <p className="font-medium text-sm">{order.paymentMethod || 'Pendiente'}</p>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center">
                                            <div className="bg-blue-100 p-2 rounded-full mr-3">
                                                <FiTruck className="text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Estado</p>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClass(order.status)}`}>
                                                    {mapStatus(order.status)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Main content with 2 columns layout */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left Column - Customer Info and Shipping */}
                                    <div className="space-y-6">
                                        <div className="flex flex-row justify-between gap-4" >
                                            {/* Customer Information */}
                                            <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
                                                <h4 className="text-md bg-gray-50 p-4 font-medium flex items-center border-b border-gray-300">
                                                    <FiUser className="mr-2 text-[#00B0C8]" /> Información del cliente
                                                </h4>
                                                <div className="space-y-3 p-4">
                                                    <div>
                                                        <p className="text-xs text-gray-500">Nombre</p>
                                                        <p className="font-medium">{`${order.shippingAddress.name} ${order.shippingAddress.lastName}`}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Correo electrónico</p>
                                                        <p className="font-medium">{order.shippingAddress.email}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Teléfono</p>
                                                        <p className="font-medium">{order.shippingAddress.phone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Shipping Information */}
                                            <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
                                                <h4 className="text-md bg-gray-50 p-4 font-medium flex items-center border-b border-gray-300">
                                                    <FiMapPin className="mr-2 text-[#00B0C8]" /> Dirección de envío
                                                </h4>
                                                <div className=" p-4 space-y-3">
                                                    <div>
                                                        <p className="text-xs text-gray-500">Calle:</p>
                                                        <p className="font-medium ">{order.shippingAddress.address}</p>
                                                    </div>
                                                    <div className="flex flex-row justify-between gap-2">
                                                        <div className='flex-1'>
                                                            <p className="text-xs text-gray-500">Código Postal:</p>
                                                            <p className="font-medium ">{order.shippingAddress.postalCode}</p>
                                                        </div>
                                                        <div className='flex-1'>
                                                            <p className="text-xs text-gray-500">Ciudad:</p>
                                                            <p className="font-medium ">{order.shippingAddress.city}</p>
                                                        </div>
                                                    </div>
                                                    <div className='flex flex-row justify-between gap-2'>
                                                        <div className='flex-1'>
                                                            <p className="text-xs text-gray-500">Provincia:</p>
                                                            <p className="font-medium ">{order.shippingAddress.province}</p>
                                                        </div>
                                                        <div className='flex-1'>
                                                            <p className="text-xs text-gray-500">País:</p>
                                                            <p className="font-medium ">{order.shippingAddress.country}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Notes */}
                                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                            <h4 className="text-md bg-gray-50 p-4 font-medium flex items-center border-b border-gray-300">
                                                <FiMessageSquare className="mr-2 text-[#00B0C8]" /> Notas
                                            </h4>
                                            <p className="text-gray-700 p-4">
                                                {order.notes || 'No hay notas para este pedido.'}
                                            </p>
                                        </div>
                                        {/* Tracking */}
                                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                            <h4 className="text-md bg-gray-50 p-4 font-medium flex items-center border-b border-gray-300">
                                                <FiTruck className="mr-2 text-[#00B0C8]" /> Seguimiento
                                            </h4>
                                            <p className="text-gray-700 p-4">
                                                {order.trackingNumber
                                                    ? <span className="font-medium">{order.trackingNumber}</span>
                                                    : 'No hay número de seguimiento disponible.'}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Right Column - Products and Order Summary */}
                                    <div className="space-y-6">
                                        {/* Products */}
                                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                            <h4 className="text-md bg-gray-50 p-4 font-medium flex items-center border-b border-gray-300">
                                                <FiPackage className="mr-2 text-[#00B0C8]" /> Productos
                                            </h4>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Producto
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Cantidad
                                                            </th>
                                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Precio
                                                            </th>
                                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Subtotal
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
                                                        {order.items.map((item, index) => {
                                                            const product = getProductDetails(item.product);
                                                            return (
                                                                <tr key={index} className="hover:bg-gray-50">
                                                                    <td className="px-6 py-4">
                                                                        <div className="flex items-center space-x-2">
                                                                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                                                                                {product?.image ? (
                                                                                    <img
                                                                                        src={product.image}
                                                                                        alt={product.name || `Producto ${index + 1}`}
                                                                                        className="h-full w-full object-cover"
                                                                                    />
                                                                                ) : (
                                                                                    <FiPackage className="text-gray-500" />
                                                                                )}
                                                                            </div>
                                                                            <div className="ml-4">
                                                                                <div className="text-sm font-medium text-gray-900">
                                                                                    {product?.name || `Producto ${index + 1}`}
                                                                                </div>
                                                                                <div className="text-xs text-gray-500 flex flex-col">
                                                                                    <span>Ref: {product?.reference || "N/A"}</span>
                                                                                    <span>ID: {item.product || "N/A"}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                        {item.quantity}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                                                        {formatPrice(item.price)}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                                                        {formatPrice(item.price * item.quantity)}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        {/* Order Summary */}
                                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                            <h4 className="text-md bg-gray-50 p-4 font-medium flex items-center border-b border-gray-300">
                                                <FiCreditCard className="mr-2 text-[#00B0C8]" /> Resumen del pedido
                                            </h4>
                                            <div className="flex p-4 flex-row space-x-4 justify-between">

                                                <div className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                                    <div className="flex items-center">
                                                        <div className="mr-4 bg-blue-100 p-3 rounded-full">
                                                            <FiTruck className="text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">Envío</p>
                                                            <p className="text-gray-600">{formatPrice(order.shippingCost) || 'Pendiente'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                                    <div className="flex items-center">
                                                        <div className="mr-4 bg-purple-100 p-3 rounded-full">
                                                            <FiCreditCard className="text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">Impuestos</p>
                                                            <p className="text-gray-600">{formatPrice(order.tax) || 'Pendiente'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                                    <div className="flex items-center">
                                                        <div className="mr-4 bg-green-100 p-3 rounded-full">
                                                            <FiDollarSign className="text-green-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">Subtotal</p>
                                                            <p className="text-gray-600">{formatPrice(order.subtotal) || 'Pendiente'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                                    <div className="flex items-center">
                                                        <div className="mr-4 bg-green-100 p-3 rounded-full">
                                                            <FiDollarSign className="text-green-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">Total</p>
                                                            <p className="text-gray-600">{formatPrice(order.totalAmount) || 'Pendiente'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-12 text-center text-gray-500">
                                No se encontró información del pedido.
                            </div>
                        )}
                    </div>
                    {/* Footer */}
                    <div className="border-t border-gray-200 p-4 flex justify-end bg-gray-50">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}