'use client';
import { useState, useEffect } from 'react';
import { FiX, FiPackage, FiMapPin, FiUser, FiCreditCard, FiTruck, FiCalendar, FiDollarSign, FiFileText, FiMessageSquare } from 'react-icons/fi';
export default function OrderViewModal({ isOpen, onClose, orderId, isLoading }) {
    // Locale detection (default to 'ca')
    let locale = 'ca';
    if (typeof window !== 'undefined' && window.navigator) {
        const lang = window.navigator.language || window.navigator.userLanguage;
        if (lang && lang.toLowerCase().startsWith('es')) locale = 'es';
    }
    // Translations
    const translations = {
        ca: {
            orderDetails: 'Detalls de la Comanda',
            date: 'Data',
            total: 'Total',
            paymentMethod: 'Mètode de pagament',
            status: 'Estat',
            customerInfo: 'Informació del client',
            name: 'Nom',
            email: 'Correu electrònic',
            phone: 'Telèfon',
            shippingAddress: 'Adreça d\'enviament',
            street: 'Carrer',
            postalCode: 'Codi Postal',
            city: 'Ciutat',
            province: 'Província',
            country: 'País',
            pickup: 'Per recollir a la botiga',
            notes: 'Notes',
            noNotes: 'No hi ha notes per a aquesta comanda.',
            tracking: 'Seguiment',
            noTracking: 'No hi ha número de seguiment disponible.',
            products: 'Productes',
            product: 'Producte',
            quantity: 'Quantitat',
            type: 'Tipus',
            price: 'Preu',
            subtotal: 'Subtotal',
            orderSummary: 'Resum de la comanda',
            shipping: 'Enviament',
            taxes: 'Impostos',
            pending: 'Pendent',
            subtotalLabel: 'Subtotal',
            totalLabel: 'Total',
            notFound: 'No s\'ha trobat informació de la comanda.',
            close: 'Tancar',
            gift: 'Regal',
            personal: 'Personal',
            statusMap: {
                pending: 'Pendent de pagament',
                processing: 'Pagament acceptat',
                shipped: 'Enviat',
                delivered: 'Entregat',
                cancelled: 'Cancel·lat',
            },
        },
        es: {
            orderDetails: 'Detalles del Pedido',
            date: 'Fecha',
            total: 'Total',
            paymentMethod: 'Método de pago',
            status: 'Estado',
            customerInfo: 'Información del cliente',
            name: 'Nombre',
            email: 'Correo electrónico',
            phone: 'Teléfono',
            shippingAddress: 'Dirección de envío',
            street: 'Calle',
            postalCode: 'Código Postal',
            city: 'Ciudad',
            province: 'Provincia',
            country: 'País',
            pickup: 'Para recoger en tienda',
            notes: 'Notas',
            noNotes: 'No hay notas para este pedido.',
            tracking: 'Seguimiento',
            noTracking: 'No hay número de seguimiento disponible.',
            products: 'Productos',
            product: 'Producto',
            quantity: 'Cantidad',
            type: 'Tipo',
            price: 'Precio',
            subtotal: 'Subtotal',
            orderSummary: 'Resumen del pedido',
            shipping: 'Envío',
            taxes: 'Impuestos',
            pending: 'Pendiente',
            subtotalLabel: 'Subtotal',
            totalLabel: 'Total',
            notFound: 'No se encontró información del pedido.',
            close: 'Cerrar',
            gift: 'Regalo',
            personal: 'Personal',
            statusMap: {
                pending: 'Pendiente de pago',
                processing: 'Pago aceptado',
                shipped: 'Enviado',
                delivered: 'Entregado',
                cancelled: 'Cancelado',
            },
        }
    };
    const t = translations[locale];
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
                        //console.log('Product API response:', data);
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
            //console.log('Final products map:', productsMap);
            setProducts(productsMap);
        } catch (error) {
            console.error("Error fetching product details:", error);
        }
    };
    if (!isOpen) return null;
    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString(locale === 'ca' ? 'ca-ES' : 'es-ES', {
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
            return locale === 'ca' ? 'Gratuït' : 'Gratis';
        }
        return `${parseFloat(price).toFixed(2)} €`;
    };
    const mapStatus = (status) => {
        return t.statusMap[status] || status;
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
            <div className="bg-white rounded-lg shadow-lg w-full max-h-[90vh] flex flex-col mb-14">
                {/* Header */}
                <div className='rounded-lg overflow-y-scroll '>
                    <div className="flex justify-between items-center border-b border-gray-300 p-4 sticky top-0 bg-white z-10">
                        <h3 className="text-xl font-semibold flex items-center">
                            <FiPackage className="mr-2 text-[#36A9E1]" />
                            {t.orderDetails}
                            {order && <span className="ml-2 text-[#36A9E1]">#{order.orderNumber}</span>}
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
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#36A9E1]"></div>
                            </div>
                        ) : error ? (
                            <div className="p-6">
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                    <p>{error}</p>
                                </div>
                            </div>
                        ) : order ? (
                            <div className="p-2 md:p-6">
                                {/* Order Summary Card */}
                                <div className="rounded-lg mb-6">
                                    <div className="flex flex-col md:flex-row gap-2">
                                        <div className="flex-1 bg-gray-50 rounded-lg p-2 border border-gray-200 flex items-center">
                                            <div className="bg-blue-100 bg-opacity-10 p-2 rounded-full mr-3">
                                                <FiCalendar className="text-[#36A9E1]" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">{t.date}</p>
                                                <p className="font-medium text-sm">{formatDate(order.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div className="flex-1 bg-gray-50 rounded-lg p-2 border border-gray-200 flex items-center">
                                            <div className="bg-blue-100 p-2 rounded-full mr-3">
                                                <FiTruck className="text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">{t.shipping}</p>
                                                <p className="font-medium text-sm">{order.shippingCost === 0 ? 'Gratis' : formatPrice(order.shippingCost)}</p>
                                            </div>
                                        </div>
                                        <div className="flex-1 bg-gray-50 rounded-lg p-2 border border-gray-200 flex items-center">
                                            <div className="bg-green-100 p-2 rounded-full mr-3">
                                                <FiDollarSign className="text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">{t.total}</p>
                                                <p className="font-medium text-sm">{formatPrice(order.totalAmount)}</p>
                                            </div>
                                        </div>
                                        <div className="flex-1 bg-gray-50 rounded-lg p-2 border border-gray-200 flex items-center">
                                            <div className="bg-purple-100 p-2 rounded-full mr-3">
                                                <FiCreditCard className="text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">{t.paymentMethod}</p>
                                                <p className="font-medium text-sm">{order.paymentMethod || 'Pendiente'}</p>
                                            </div>
                                        </div>
                                        <div className="flex-1 bg-gray-50 rounded-lg p-2 border border-gray-200 flex items-center">
                                            <div className="bg-blue-100 p-2 rounded-full mr-3">
                                                <FiTruck className="text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">{t.status}</p>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClass(order.status)}`}>
                                                    {mapStatus(order.status)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Main content with 2 columns layout */}
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Left Column - Customer Info and Shipping */}
                                    <div className="flex flex-col gap-2 w-full md:w-[40%]">
                                        <div className="flex flex-col md:flex-row justify-between gap-4" >
                                            {/* Customer Information */}
                                            <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
                                                <h4 className="text-md bg-gray-50 p-2 font-medium flex items-center border-b border-gray-300">
                                                    <FiUser className="mr-2 text-[#36A9E1]" /> {t.customerInfo}
                                                </h4>
                                                <div className="space-y-3 p-4">
                                                    <div className="space-y-1 p-2">
                                                        <p className="text-xs text-gray-500">{t.name}</p>
                                                        <p className="font-medium">{`${order.shippingAddress.name} ${order.shippingAddress.lastName}`}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">{t.email}</p>
                                                        <p className="font-medium">{order.shippingAddress.email}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">{t.phone}</p>
                                                        <p className="font-medium">{order.shippingAddress.phone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Shipping Information */}
                                            <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
                                                <h4 className="text-md bg-gray-50 p-2 font-medium flex items-center border-b border-gray-300">
                                                    <FiMapPin className="mr-2 text-[#36A9E1]" /> {t.shippingAddress}
                                                </h4>
                                                {order.deliveryMethod === 'pickup' ? (
                                                    <div className="p-2 flex flex-col h-full md:flex-row items-center justify-center text-center   rounded-lg  w-full gap-1 md:gap-4">
                                                        <svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-1 md:mb-0 md:mr-2"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M22 22H2" stroke="#36A9E1" strokeWidth="1.5" strokeLinecap="round"></path> <path opacity="0.5" d="M20 22V11" stroke="#36A9E1" strokeWidth="1.5" strokeLinecap="round"></path> <path opacity="0.5" d="M4 22V11" stroke="#36A9E1" strokeWidth="1.5" strokeLinecap="round"></path> <path d="M16.5278 2H7.47214C6.26932 2 5.66791 2 5.18461 2.2987C4.7013 2.5974 4.43234 3.13531 3.89443 4.21114L2.49081 7.75929C2.16652 8.57905 1.88279 9.54525 2.42867 10.2375C2.79489 10.7019 3.36257 11 3.99991 11C5.10448 11 5.99991 10.1046 5.99991 9C5.99991 10.1046 6.89534 11 7.99991 11C9.10448 11 9.99991 10.1046 9.99991 9C9.99991 10.1046 10.8953 11 11.9999 11C13.1045 11 13.9999 10.1046 13.9999 9C13.9999 10.1046 14.8953 11 15.9999 11C17.1045 11 17.9999 10.1046 17.9999 9C17.9999 10.1046 18.8953 11 19.9999 11C20.6373 11 21.205 10.7019 21.5712 10.2375C22.1171 9.54525 21.8334 8.57905 21.5091 7.75929L20.1055 4.21114C19.5676 3.13531 19.2986 2.5974 18.8153 2.2987C18.332 2 17.7306 2 16.5278 2Z" stroke="#36A9E1" strokeWidth="1.5" strokeLinejoin="round"></path> <path opacity="0.5" d="M9.5 21.5V18.5C9.5 17.5654 9.5 17.0981 9.70096 16.75C9.83261 16.522 10.022 16.3326 10.25 16.201C10.5981 16 11.0654 16 12 16C12.9346 16 13.4019 16 13.75 16.201C13.978 16.3326 14.1674 16.522 14.299 16.75C14.5 17.0981 14.5 17.5654 14.5 18.5V21.5" stroke="#36A9E1" strokeWidth="1.5" strokeLinecap="round"></path> </g></svg>
                                                        <span className="text-base font-semibold text-[#36A9E1] tracking-wide">{t.pickup}</span>
                                                    </div>
                                                ) : (
                                                    <div className=" p-4 space-y-3">
                                                        <div className="space-y-1 p-2">
                                                            <p className="text-xs text-gray-500">{t.street}:</p>
                                                            <p className="font-medium ">{order.shippingAddress.address}</p>
                                                        </div>
                                                        <div className="flex flex-row justify-between gap-2">
                                                            <div className='flex-1'>
                                                                <p className="text-xs text-gray-500">{t.postalCode}:</p>
                                                                <p className="font-medium ">{order.shippingAddress.postalCode}</p>
                                                            </div>
                                                            <div className='flex-1'>
                                                                <p className="text-xs text-gray-500">{t.city}:</p>
                                                                <p className="font-medium ">{order.shippingAddress.city}</p>
                                                            </div>
                                                        </div>
                                                        <div className='flex flex-row justify-between gap-2'>
                                                            <div className='flex-1'>
                                                                <p className="text-xs text-gray-500">{t.province}:</p>
                                                                <p className="font-medium ">{order.shippingAddress.province}</p>
                                                            </div>
                                                            <div className='flex-1'>
                                                                <p className="text-xs text-gray-500">{t.country}:</p>
                                                                <p className="font-medium ">{order.shippingAddress.country}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* Notes */}
                                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                            <h4 className="text-md bg-gray-50 p-2 font-medium flex items-center border-b border-gray-300">
                                                <FiMessageSquare className="mr-2 text-[#36A9E1]" /> {t.notes}
                                            </h4>
                                            <p className="text-gray-700 p-4">
                                                {order.notes || t.noNotes}
                                            </p>
                                        </div>
                                        {/* Tracking */}
                                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                            <h4 className="text-md bg-gray-50 p-2 font-medium flex items-center border-b border-gray-300">
                                                <FiTruck className="mr-2 text-[#36A9E1]" /> {t.tracking}
                                            </h4>
                                            <p className="text-gray-700 p-4">
                                                {order.trackingNumber
                                                    ? <span className="font-medium">{order.trackingNumber}</span>
                                                    : t.noTracking}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Right Column - Products and Order Summary */}
                                    <div className="space-y-6 w-full md:w-[60%]">
                                        {/* Products */}
                                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                            <h4 className="text-md bg-gray-50 p-2 font-medium flex items-center border-b border-gray-300">
                                                <FiPackage className="mr-2 text-[#36A9E1]" /> {t.products}
                                            </h4>
                                            <div className="overflow-x-auto">
                                                <div className="md:overflow-x-auto md:max-h-[300px] min-h[200px] md:h-[200px] h-full">
                                                    {/* style={{ maxHeight: '300px', minHeight: '200px', height: '200px', overflowY: 'auto' }} */}
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    {t.product}
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    {t.quantity}
                                                                </th>
                                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    {t.type}
                                                                </th>
                                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Original
                                                                </th>
                                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Descuento
                                                                </th>
                                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Final
                                                                </th>
                                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    {t.subtotal}
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
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
                                                                                    <div className="text-sm font-medium text-gray-900 flex flex-col">
                                                                                        <span>{product?.name.ca || product?.name || `Producto ${index + 1}`}</span>
                                                                                        {(item.listName || item.list || item.listTitle) && (
                                                                                            <span className="italic text-xs text-pink-600 mt-1">
                                                                                                (Lista: {item.listName || item.list || item.listTitle})
                                                                                            </span>
                                                                                        )}
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
                                                                        <td className={`item-type px-6 py-4 whitespace-nowrap text-center text-sm font-semibold ${item.type === 'gift' ? 'gift-type text-pink-600' : 'personal-type text-blue-600'}`}>
                                                                            {item.type === 'gift' ? t.gift : t.personal}
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                                                            {formatPrice(item.priceDetails?.originalPrice || item.price)}
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-pink-600">
                                                                            {item.priceDetails?.discountPercentage ? `-${item.priceDetails.discountPercentage}%` : '-'}
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                                                            {formatPrice(item.priceDetails?.finalPrice || item.price)}
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                                                            {formatPrice((item.priceDetails?.finalPrice || item.price) * item.quantity)}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Order Summary */}
                                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                            <h4 className="text-md bg-gray-50 p-2 font-medium flex items-center border-b border-gray-300">
                                                <FiCreditCard className="mr-2 text-[#36A9E1]" /> {t.orderSummary}
                                            </h4>
                                            <div className="flex p-4 flex-row space-x-4 justify-between">
                                                <div className="grid grid-cols-2 md:flex md:flex-row gap-2 w-full">
                                                    <div className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg flex flex-col justify-center">
                                                        <div className="flex items-center mb-1">
                                                            <div className="mr-2 bg-purple-100 p-2 rounded-full">
                                                                <FiCreditCard className="text-purple-600" />
                                                            </div>
                                                            <p className="text-sm font-medium">{t.taxes}</p>
                                                        </div>
                                                        <p className="text-gray-600 text-sm ml-10">{formatPrice(order.tax) || t.pending}</p>
                                                    </div>
                                                    <div className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg flex flex-col justify-center">
                                                        <div className="flex items-center mb-1">
                                                            <div className="mr-2 bg-pink-100 p-2 rounded-full">
                                                                <FiDollarSign className="text-pink-600" />
                                                            </div>
                                                            <p className="text-sm font-medium">Descuento Total</p>
                                                        </div>
                                                        <p className="text-pink-600 font-medium text-sm ml-10">
                                                            {order.discounts?.total ? `-${formatPrice(order.discounts.total)}` : '-'}
                                                        </p>
                                                    </div>
                                                    <div className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg flex flex-col justify-center">
                                                        <div className="flex items-center mb-1">
                                                            <div className="mr-2 bg-green-100 p-2 rounded-full">
                                                                <FiDollarSign className="text-green-600" />
                                                            </div>
                                                            <p className="text-sm font-medium">{t.subtotalLabel}</p>
                                                        </div>
                                                        <p className="text-gray-600 text-sm ml-10">{formatPrice(order.subtotal) || t.pending}</p>
                                                    </div>
                                                    <div className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg flex flex-col justify-center">
                                                        <div className="flex items-center mb-1">
                                                            <div className="mr-2 bg-green-100 p-2 rounded-full">
                                                                <FiDollarSign className="text-green-600" />
                                                            </div>
                                                            <p className="text-sm font-medium">{t.totalLabel}</p>
                                                        </div>
                                                        <p className="text-gray-600 text-sm ml-10">{formatPrice(order.totalAmount) || t.pending}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-12 text-center text-gray-500">
                                {t.notFound}
                            </div>
                        )}
                    </div>
                    {/* Footer */}
                    <div className="border-t border-gray-200 p-4 flex justify-end bg-gray-50">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                        >
                            {t.close}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}