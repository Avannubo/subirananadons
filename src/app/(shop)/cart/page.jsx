'use client';
import { useEffect, useState, useMemo } from 'react';
import ShopLayout from "@/components/Layouts/shop-layout";
import Image from "next/image";
import Link from "next/link";
import { motion } from 'framer-motion';
import UserAuth from "@/components/ui/UserAuthModal";
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'react-hot-toast';
export default function CartPage() {
    const { cartItems, updateQuantity, removeFromCart, updateGiftNote } = useCart();
    const { user, loading: userLoading } = useUser();
    const [deliveryMethod, setDeliveryMethod] = useState('delivery');
    const [formData, setFormData] = useState({
        name: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        province: '',
        country: 'España',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(null);
    const [orderError, setOrderError] = useState(null);
    const [userType, setUserType] = useState('guest'); // 'guest' or 'register'
    const [giftNotes, setGiftNotes] = useState({});

    const regularItems = cartItems.filter(item => !item.isGift);
    const giftItems = cartItems.filter(item => item.isGift);
    // Check if cart has any gift items
    const hasGiftItems = useMemo(() => {
        return cartItems.some(item => item.isGift);
    }, [cartItems]);
    // Check if cart has only gift items
    const hasOnlyGiftItems = useMemo(() => {
        return cartItems.length > 0 && cartItems.every(item => item.isGift);
    }, [cartItems]);

    // Determine if we should show address fields
    const showAddressFields = useMemo(() => {
        return deliveryMethod === 'delivery' && !hasOnlyGiftItems;
    }, [deliveryMethod, hasOnlyGiftItems]);

    // Force pickup method if cart has gift items
    useEffect(() => {
        if (hasGiftItems) {
            setDeliveryMethod('pickup');
        }
    }, [hasGiftItems]);
    // Auto-fill user data when available
    useEffect(() => {
        if (user && !userLoading) {
            // Split name into first name and last name
            const nameParts = user.name ? user.name.split(' ') : ['', ''];
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            // Auto-fill the form with user data
            setFormData(prev => ({
                ...prev,
                name: firstName,
                lastName: lastName,
                email: user.email || '',
                // Use previous values for fields not in user profile
                phone: prev.phone,
                address: prev.address,
                city: prev.city,
                postalCode: prev.postalCode,
                province: prev.province
            }));
            // Only fetch address data if not gift-only order
            if (!hasOnlyGiftItems) {
                fetchUserAddressData();
            }
        }
    }, [user, userLoading, hasOnlyGiftItems]);
    // Fetch the user's last used shipping address
    const fetchUserAddressData = async () => {
        if (!user?.id) return;
        try {
            const response = await fetch('/api/orders?limit=1');
            if (!response.ok) return;
            const data = await response.json();
            if (data.success && data.orders && data.orders.length > 0) {
                const lastOrder = data.orders[0];
                if (lastOrder.shippingAddress) {
                    // Use the last order's shipping address to fill the form
                    setFormData(prev => ({
                        ...prev,
                        phone: lastOrder.shippingAddress.phone || prev.phone,
                        address: lastOrder.shippingAddress.address || prev.address,
                        city: lastOrder.shippingAddress.city || prev.city,
                        postalCode: lastOrder.shippingAddress.postalCode || prev.postalCode,
                        province: lastOrder.shippingAddress.province || prev.province,
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching user address data:', error);
        }
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    // Auto-recalculate shipping when cart items or delivery method changes
    useEffect(() => {
        // This will trigger a re-render with the correct shipping cost
        const shipping = calculateShipping();
        console.log(`Delivery method: ${deliveryMethod}, Subtotal: ${calculateSubtotal()}, Shipping: ${shipping}`);
    }, [cartItems, deliveryMethod]);
    const handleDeliveryMethodChange = (method) => {
        // Only allow changing to 'delivery' if there are regular items
        if (method === 'delivery' && regularItems.length === 0) {
            toast.error('Necesitas productos normales en el carrito para envío a domicilio');
            return;
        }
        setDeliveryMethod(method);
    };
    const calculateSubtotal = () => {
        return cartItems.reduce((sum, item) => {
            // Get the numerical price value, handling different formats
            const price = typeof item.priceValue === 'number'
                ? item.priceValue
                : (typeof item.price === 'number'
                    ? item.price
                    : parseFloat(String(item.price || "0").replace(/[^\d.,]/g, '').replace(',', '.')));
            return sum + (price * (item.quantity || 1));
        }, 0);
    };
    const calculateShipping = () => {
        const subtotal = calculateSubtotal();
        if (deliveryMethod === 'pickup') return 0;
        return subtotal >= 60 ? 0 : 5.99;
    };
    const calculateTax = () => {
        return calculateSubtotal() * 0.21;
    };
    const calculateTotal = () => {
        return calculateSubtotal() + calculateShipping();// + calculateTax();
    };
    // Save user's address for future orders
    const saveUserAddressPreferences = async () => {
        if (!user?.id) return;
        try {
            // This could be a separate API endpoint to save user address preferences
            // For now, we'll just log it
            console.log('Saving user address preferences:', {
                name: formData.name,
                lastName: formData.lastName,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                postalCode: formData.postalCode,
                province: formData.province,
            });
            // In a real implementation, you would save this data to the user profile
            // await fetch('/api/user/address', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         address: formData.address,
            //         city: formData.city,
            //         postalCode: formData.postalCode,
            //         province: formData.province,
            //         phone: formData.phone,
            //     }),
            // });
        } catch (error) {
            console.error('Error saving address preferences:', error);
        }
    };
    // Handle order submission
    const handleSubmitOrder = async () => {
        // Determine which fields are required based on delivery method and cart contents
        let requiredFields = ['name', 'lastName', 'email', 'phone'];
        // Add address fields only if delivery method is 'delivery' or not all items are gifts
        if (deliveryMethod === 'delivery' && !hasOnlyGiftItems) {
            requiredFields = [...requiredFields, 'address', 'city', 'postalCode', 'province'];
        }
        const missingFields = requiredFields.filter(field => !formData[field]);
        if (missingFields.length > 0) {
            setOrderError('Por favor, completa todos los campos obligatorios');
            return;
        }
        if (cartItems.length === 0) {
            setOrderError('No hay productos en el carrito');
            return;
        }
        try {
            setIsSubmitting(true);
            setOrderError(null);
            // Handle user registration if selected
            if (userType === 'register' && !user) {
                // Validate passwords match
                if (formData.password !== formData.confirmPassword) {
                    setOrderError('Las contraseñas no coinciden');
                    return;
                }
                try {
                    // Call your registration API
                    const registerResponse = await fetch('/api/auth/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: `${formData.name} ${formData.lastName}`,
                            email: formData.email,
                            password: formData.password
                        })
                    });
                    if (!registerResponse.ok) {
                        throw new Error('Error al crear la cuenta');
                    }
                    // Optionally sign in the user automatically
                    // This depends on your auth implementation
                } catch (error) {
                    setOrderError('Error al crear la cuenta: ' + error.message);
                    return;
                }
            }
            // Prepare the buyer information for gift items
            const buyerInfo = {
                name: `${formData.name} ${formData.lastName}`.trim(),
                email: formData.email,
                phone: formData.phone
            };
            const orderData = {
                items: cartItems.map(item => ({
                    ...item,
                    // Add buyer information and notes to gift items
                    buyerInfo: item.isGift ? {
                        ...buyerInfo,
                        note: giftNotes[item.id] || ''
                    } : undefined,
                    // Ensure quantity is 1 for gift items
                    quantity: item.isGift ? 1 : item.quantity
                })),
                shippingDetails: formData,
                deliveryMethod: deliveryMethod,
                hasGiftItems: hasGiftItems,
                isGiftOnly: hasOnlyGiftItems,
                totals: {
                    subtotal: calculateSubtotal(),
                    shipping: calculateShipping(),
                    tax: calculateTax(),
                    total: calculateTotal()
                }
            };
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Error al procesar el pedido');
            }
            // Save user address preferences for future orders
            if (user?.id) {
                await saveUserAddressPreferences();
            }
            // Order created successfully - include more detailed information
            setOrderSuccess({
                orderNumber: data.order.orderNumber,
                orderId: data.order.id,
                totalAmount: calculateTotal().toFixed(2),
                items: cartItems,
                giftItems: cartItems.filter(item => item.isGift),
                hasGiftItems: hasGiftItems,
                buyerDetails: {
                    name: `${formData.name} ${formData.lastName}`.trim(),
                    email: formData.email
                }
            });
            // Clear the cart
            cartItems.forEach(item => removeFromCart(item.id));
            // Reset form data
            setFormData({
                name: '',
                lastName: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                postalCode: '',
                province: '',
                country: 'España',
                notes: ''
            });
            // After 5 seconds, scroll to top
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 1000);
        } catch (error) {
            console.error('Error creating order:', error);
            setOrderError(error.message || 'Error al procesar el pedido');
        } finally {
            setIsSubmitting(false);
        }
    };
    // Handle invoice download
    const handleDownloadInvoice = async () => {
        if (!orderSuccess) return;
        toast.success('Generando factura...');
        try {
            // Call API to generate/download invoice PDF
            const res = await fetch(`/api/orders/${orderSuccess.orderId}/invoice`, {
                method: 'GET',
                headers: { 'Accept': 'application/pdf' }
            });
            if (!res.ok) throw new Error('No se pudo generar la factura');
            const blob = await res.blob();
            // Create a link to download the PDF
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Factura-${orderSuccess.orderNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Factura descargada correctamente');
        } catch (err) {
            toast.error('Error al descargar la factura');
        }
    };
    // Handle sending email with receipt
    const handleSendEmail = () => {
        if (!orderSuccess) return;
        toast.success(`Enviando email a ${orderSuccess.buyerDetails.email}...`);
        // Simulating email sending
        setTimeout(() => {
            toast.success('Email enviado correctamente');
        }, 1500);
    }; const handleGiftNoteChange = async (itemId, note) => {
        // Update local state immediately for UI responsiveness
        setGiftNotes(prev => ({
            ...prev,
            [itemId]: note
        }));

        // Persist to cart state
        await updateGiftNote(itemId, note);
    };
    return (
        <ShopLayout>
            <div className="container mx-auto px-4 py-8 mt-24 ">
                {/*<h1 className="text-3xl font-bold mb-8 text-zinc-900">Carrito de compra</h1>*/}
                {/* Start Content */}
                {cartItems && cartItems.length > 0 ? (
                    <>
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Left Column - User Information */}
                            <div className="lg:w-1/2  ">
                                <div className="sticky top-[120px] space-y-4">
                                    {/* User Type Selection - Only for guests */}
                                    <div className='bg-white rounded-lg shadow-sm p-6'>
                                        <div className="flex items-start space-x-4 justify-start ">
                                            <h2 className="text-xl font-bold mb-6">Datos del usuario</h2>
                                            {/* <UserAuth /> */}
                                        </div>
                                        {!user ? (
                                            <>
                                                <div className="space-y-4">
                                                    <div className="flex flex-col   gap-4">
                                                        <div className='flex flex-row gap-4 space-x-2'>
                                                            <div
                                                                className={`flex-1 w-full p-4 border rounded-lg cursor-pointer transition-all ${userType === 'login'
                                                                    ? 'border-[#00B0C8] bg-[#00B0C8]/5'
                                                                    : 'border-gray-200 hover:border-[#00B0C8]'
                                                                    }`}
                                                                onClick={() => setUserType('login')}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${userType === 'login' ? 'border-[#00B0C8]' : 'border-gray-400'}`}>
                                                                        {userType === 'login' && (
                                                                            <div className="w-2.5 h-2.5 rounded-full bg-[#00B0C8]" />
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium">Login</p>
                                                                        <p className="text-sm text-gray-500"> Gestiona tus pedidos fácilmente</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div
                                                                className={`flex-1 w-full p-4 border rounded-lg cursor-pointer transition-all ${userType === 'register'
                                                                    ? 'border-[#00B0C8] bg-[#00B0C8]/5'
                                                                    : 'border-gray-200 hover:border-[#00B0C8]'
                                                                    }`}
                                                                onClick={() => setUserType('register')}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${userType === 'register' ? 'border-[#00B0C8]' : 'border-gray-400'}`}>
                                                                        {userType === 'register' && (
                                                                            <div className="w-2.5 h-2.5 rounded-full bg-[#00B0C8]" />
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium">Registrar</p>
                                                                        <p className="text-sm text-gray-500">Crear una nueva cuenta</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className='flex-1 flex-row gap-4 space-x-2'>
                                                            <div
                                                                className={`flex-1 w-full p-4 border rounded-lg cursor-pointer transition-all ${userType === 'guest'
                                                                    ? 'border-[#00B0C8] bg-[#00B0C8]/5'
                                                                    : 'border-gray-200 hover:border-[#00B0C8]'
                                                                    }`}
                                                                onClick={() => setUserType('guest')}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${userType === 'guest' ? 'border-[#00B0C8]' : 'border-gray-400'}`}>
                                                                        {userType === 'guest' && (
                                                                            <div className="w-2.5 h-2.5 rounded-full bg-[#00B0C8]" />
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium">Comprar como invitado</p>
                                                                        <p className="text-sm text-gray-500">Continuar sin crear una cuenta</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                                <p className="text-sm flex items-center text-blue-600">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Comprando como {user.email}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className='bg-white rounded-lg shadow-sm p-6 '>
                                        <h2 className="text-xl font-bold mb-6">Datos de {deliveryMethod === 'pickup' ? 'Contacto' : 'Envío'}</h2>
                                        {userLoading ? (
                                            <div className="flex items-center justify-center py-4">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00B0C8]"></div>
                                                <span className="ml-2 text-gray-600">Cargando tus datos...</span>
                                            </div>
                                        ) : (
                                            <>
                                                {hasGiftItems && (
                                                    <div className="mb-4 p-3 bg-pink-50 text-pink-700 rounded-md border border-pink-200">
                                                        <p className="text-sm flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Los productos de regalo solo pueden recogerse en tienda por el dueño de la lista. Por favor, proporciona tus datos de contacto.
                                                        </p>
                                                    </div>
                                                )}
                                                {user && (
                                                    <div className="mb-4 p-3 bg-blue-50 text-blue-600 rounded-md border border-blue-100">
                                                        <p className="text-sm flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Hemos rellenado automáticamente algunos campos con tus datos. Por favor, verifica y completa la información.
                                                        </p>
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="col-span-1">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Nombre
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            value={formData.name}
                                                            onChange={handleInputChange}
                                                            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B0C8]"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-span-1">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Apellidos
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="lastName"
                                                            value={formData.lastName}
                                                            onChange={handleInputChange}
                                                            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B0C8]"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Email
                                                        </label>
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={formData.email}
                                                            onChange={handleInputChange}
                                                            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B0C8]"
                                                            required
                                                        />
                                                    </div>
                                                    {userType === 'register' && (
                                                        <div className="col-span-2">
                                                            <h3 className="font-medium mb-4">Contraseña para la cuenta</h3>
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                        Contraseña
                                                                    </label>
                                                                    <input
                                                                        type="password"
                                                                        name="password"
                                                                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B0C8]"
                                                                        required={userType === 'register'}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                        Confirmar contraseña
                                                                    </label>
                                                                    <input
                                                                        type="password"
                                                                        name="confirmPassword"
                                                                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B0C8]"
                                                                        required={userType === 'register'}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Teléfono
                                                        </label>
                                                        <input
                                                            type="tel"
                                                            name="phone"
                                                            value={formData.phone}
                                                            onChange={handleInputChange}
                                                            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B0C8]"
                                                            required
                                                        />
                                                    </div>
                                                    {/* Only show address fields if not gift-only or delivery method is not pickup */}                                    {showAddressFields && (
                                                        <>
                                                            <div className="col-span-2">
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Dirección
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    name="address"
                                                                    value={formData.address}
                                                                    onChange={handleInputChange}
                                                                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B0C8]"
                                                                    required={deliveryMethod === 'delivery'}
                                                                />
                                                            </div>
                                                            <div className="col-span-1">
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Ciudad
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    name="city"
                                                                    value={formData.city}
                                                                    onChange={handleInputChange}
                                                                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B0C8]"
                                                                    required={deliveryMethod === 'delivery'}
                                                                />
                                                            </div>
                                                            <div className="col-span-1">
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Código Postal
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    name="postalCode"
                                                                    value={formData.postalCode}
                                                                    onChange={handleInputChange}
                                                                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B0C8]"
                                                                    required={deliveryMethod === 'delivery'}
                                                                />
                                                            </div>
                                                            <div className="col-span-2">
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Provincia
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    name="province"
                                                                    value={formData.province}
                                                                    onChange={handleInputChange}
                                                                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B0C8]"
                                                                    required={deliveryMethod === 'delivery'}
                                                                />
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* Right Column - Products */}
                            <div className="lg:w-1/2 flex flex-col">
                                {/* First, separate the cart items */}
                                {/* Regular Items Section */}
                                {regularItems.length > 0 && (
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                        <h2 className="text-xl font-bold p-6 border-b border-gray-200">Tu pedido</h2>
                                        {regularItems.map((item, index) => (
                                            <div key={index} className="flex items-center gap-4 p-4 border-b border-gray-200 last:border-b-0">
                                                <div className="relative w-20 h-20">
                                                    <Image
                                                        src={item.image || item.imageUrl || '/assets/images/Screenshot_4.png'}
                                                        alt={item.name || 'Producto'}
                                                        fill
                                                        className="object-contain rounded-md z-0"
                                                        onError={(e) => {
                                                            e.target.src = '/assets/images/Screenshot_4.png';
                                                        }}
                                                    />
                                                    {item.isGift && (
                                                        <div className="absolute top-0 right-0 bg-pink-500 text-white text-xs px-1 rounded-bl rounded-tr">
                                                            Regalo
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-grow">
                                                    <h3 className="font-medium">{item.name}</h3>
                                                    <p className="text-gray-500 text-sm">{item.brand} - {item.category}</p>
                                                    <p className="text-[#00B0C8] font-medium">{item.price}</p>
                                                    {item.isGift && item.listOwner && (
                                                        <p className="text-xs text-pink-600 mt-1">
                                                            Lista de regalo: {item.listOwner}
                                                            <span className="ml-2 bg-green-100 text-green-700 px-1 rounded text-xs">Será marcado como comprado</span>
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                        className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-100"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, Math.min(99, item.quantity + 1))}
                                                        className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-100"
                                                        disabled={item.quantity >= 99}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                        {regularItems.length === 0 && (
                                            <p className="text-gray-500 text-center py-4">No hay productos en tu pedido</p>
                                        )}
                                    </div>
                                )}
                                {/* Gift Items Section - Only show if there are gift items */}
                                {giftItems.length > 0 && (
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-4">
                                        <h2 className="text-xl font-bold p-6 border-b border-gray-200">Regalos de Compra</h2>
                                        {giftItems.map((item, index) => (
                                            <div key={index} className="flex items-center gap-4 p-4 border-b border-gray-200 last:border-b-0">
                                                <div className="relative w-20 h-20">
                                                    <Image
                                                        src={item.image || item.imageUrl || '/assets/images/Screenshot_4.png'}
                                                        alt={item.name || 'Producto'}
                                                        fill
                                                        className="object-contain rounded-md"
                                                        onError={(e) => {
                                                            e.target.src = '/assets/images/Screenshot_4.png';
                                                        }}
                                                    />
                                                    {item.isGift && (
                                                        <div className="absolute top-0 right-0 bg-pink-500 text-white text-xs px-1 rounded-bl rounded-tr">
                                                            Regalo
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-grow">
                                                    <h3 className="font-medium">{item.name}</h3>
                                                    <p className="text-gray-500 text-sm">{item.brand} - {item.category}</p>
                                                    <p className="text-[#00B0C8] font-medium">{item.price}€</p>
                                                    {item.isGift && item.listOwner && (
                                                        <p className="text-xs text-pink-600 mt-1">
                                                            Lista de regalo: {item.listOwner}
                                                            <span className="ml-2 bg-green-100 text-green-700 px-1 rounded text-xs">Será marcado como comprado</span>
                                                        </p>
                                                    )}
                                                </div>                                        <div className="flex flex-col space-y-3 w-full mt-2">
                                                    <div className="flex items-center justify-between">
                                                        
                                                        <div className="flex items-center space-x-2 justify-between">                                            <p className="text-sm text-gray-500">Cantidad: 1</p>
                                                            <button
                                                                onClick={() => removeFromCart(item.id)}
                                                                className="text-sm text-red-600 hover:text-red-900"
                                                            >
                                                                Eliminar
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {/* Delivery Method Selection */}
                                <div className="bg-white rounded-lg shadow-sm p-6 mt-4 border border-gray-200">
                                    <h2 className="text-xl font-bold mb-4">Método de entrega</h2>
                                    {/* Gift Items Notice */}
                                    {hasGiftItems && (
                                        <div className="mb-4 p-3 bg-pink-50 border border-pink-200 rounded-lg">
                                            <p className="text-sm text-pink-700 flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-15 w-15 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                                </svg>
                                                {hasOnlyGiftItems
                                                    ? 'Tu carrito contiene solo productos de regalo que deben ser recogidos en tienda por el propietario de la lista. Al comprar estos artículos, serán marcados como comprados en la lista de regalo.'
                                                    : 'Este pedido incluye artículos de regalo (recogida en tienda obligatoria por el propietario de la lista). Por ello, todo el pedido se configurará para recoger en tienda. Si deseas envío a domicilio para los otros artículos, por favor sepáralos en un pedido diferente. Los artículos de regalo serán marcados como comprados en la lista.'
                                                }
                                            </p>
                                        </div>
                                    )}
                                    {/* Free Shipping Progress */}
                                    {calculateSubtotal() < 60 && deliveryMethod === 'delivery' && !hasGiftItems && (
                                        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                            <p className="text-sm text-gray-700 mb-2">
                                                ¡Añade <span className="font-bold text-[#00B0C8]">{(60 - calculateSubtotal()).toFixed(2)}€</span> más a tu pedido para conseguir envío gratis!
                                            </p>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className="bg-[#00B0C8] h-2.5 rounded-full transition-all duration-500 ease-in-out"
                                                    style={{ width: `${Math.min(100, (calculateSubtotal() / 60) * 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="space-y-4">
                                        <div
                                            className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${hasGiftItems
                                                ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60'
                                                : deliveryMethod === 'delivery'
                                                    ? 'border-[#00B0C8] bg-[#00B0C8]/5 cursor-pointer'
                                                    : 'border-gray-200 hover:border-[#00B0C8] cursor-pointer'
                                                }`}
                                            onClick={() => !hasGiftItems && handleDeliveryMethodChange('delivery')}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${hasGiftItems
                                                    ? 'border-gray-400'
                                                    : deliveryMethod === 'delivery' ? 'border-[#00B0C8]' : 'border-gray-400'
                                                    }`}>
                                                    {deliveryMethod === 'delivery' && !hasGiftItems && (
                                                        <div className="w-2.5 h-2.5 rounded-full bg-[#00B0C8]" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium">Envío a domicilio</p>
                                                    <p className="text-sm text-gray-500">Entrega en 24-48 horas laborables</p>
                                                    {calculateSubtotal() >= 60 && !hasGiftItems && (
                                                        <p className="text-xs text-green-600 font-medium mt-1">Envío gratis en pedidos superiores a 60€</p>
                                                    )}
                                                    {hasGiftItems && (
                                                        <p className="text-xs text-red-600 font-medium mt-1">No disponible para productos de regalo</p>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-[#00B0C8] font-medium">
                                                {calculateSubtotal() >= 60 || regularItems.length === 0 ? 'Gratis' : '5,99 €'}
                                            </span>
                                        </div>
                                        <div
                                            className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${deliveryMethod === 'pickup'
                                                ? 'border-[#00B0C8] bg-[#00B0C8]/5'
                                                : 'border-gray-200 hover:border-[#00B0C8]'
                                                }`}
                                            onClick={() => handleDeliveryMethodChange('pickup')}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${deliveryMethod === 'pickup' ? 'border-[#00B0C8]' : 'border-gray-400'
                                                    }`}>
                                                    {deliveryMethod === 'pickup' && (
                                                        <div className="w-2.5 h-2.5 rounded-full bg-[#00B0C8]" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium">Recoger en tienda</p>
                                                    <p className="text-sm text-gray-500">Disponible in 2-4 horas</p>
                                                    {hasGiftItems && (
                                                        <p className="text-xs text-pink-600 font-medium mt-1">Obligatorio para productos de regalo — Solo el propietario de la lista puede recogerlos</p>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-[#00B0C8] font-medium">Gratis</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Gift Notes Section */}
                                {giftItems.length > 0 && (
                                    <div className="bg-white rounded-lg shadow-sm p-6 mt-4 border border-gray-200">
                                        <h2 className="text-xl font-bold mb-4">Notas para los regalos</h2>
                                        <div className="space-y-6">
                                            {giftItems.map((item) => (
                                                <div key={`note-${item.id}`} className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative w-16 h-16 overflow-hidden rounded-md border border-gray-200">
                                                            <Image
                                                                src={item.image}
                                                                alt="img"
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                                                            <p className="text-sm text-gray-500">{item.priceValue}€</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label htmlFor={`gift-note-${item.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                                                            Nota para el regalo
                                                        </label>
                                                        <textarea
                                                            id={`gift-note-${item.id}`}
                                                            value={giftNotes[item.id] || item.giftInfo?.note || ''}
                                                            onChange={(e) => handleGiftNoteChange(item.id, e.target.value)}
                                                            placeholder="Añade un mensaje personal para este regalo..."
                                                            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B0C8] text-sm"
                                                            rows={3}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {/* Order Summary */}
                                <div className="bg-white rounded-lg shadow-sm p-6 mt-4 border border-gray-200">
                                    <h2 className="text-xl font-bold mb-4">Resumen del pedido</h2>
                                    <div className="flex flex-col justify-between items-end gap-4">
                                        <div className="w-full space-y-3">
                                            <div className="flex justify-between">
                                                <span>Subtotal</span>
                                                <span>{calculateSubtotal().toFixed(2)} €</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span>Envío</span>
                                                {calculateSubtotal() >= 60 && deliveryMethod === 'delivery' ? (
                                                    <span className="flex items-center text-green-600">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Gratis
                                                    </span>
                                                ) : (
                                                    <span>{calculateShipping().toFixed(2)} €</span>
                                                )}
                                            </div>
                                            {/* <div className="flex justify-between">
                                                <span>IVA (21%)</span>
                                                <span>{calculateTax().toFixed(2)} €</span>
                                            </div> */}
                                            <div className="border-t border-gray-200 pt-3 mt-3">
                                                <div className="flex justify-between font-bold">
                                                    <span>Total</span>
                                                    <span>{calculateTotal().toFixed(2)} €</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleSubmitOrder();
                                                }}
                                                type="button"
                                                disabled={isSubmitting}
                                                className={`w-full ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#00B0C8] hover:bg-[#0090a8]'} text-white py-3 px-6 rounded-md transition-colors duration-300`}
                                            >
                                                {isSubmitting ? 'Procesando...' : 'Finalizar compra'}
                                            </button>
                                            {orderError && (
                                                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
                                                    <p>{orderError}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <motion.div
                        className="text-center py-16"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <h2 className="text-2xl font-bold mb-4">Tu carrito está vacío</h2>
                        <p className="text-gray-500 mb-8">¿No sabes qué comprar? ¡Miles de productos te esperan!</p>
                        <Link
                            href="/products"
                            className="inline-block bg-[#00B0C8] text-white py-3 px-6 rounded-md hover:bg-[#0090a8] transition-colors duration-300"
                        >
                            Continuar comprando
                        </Link>
                    </motion.div>
                )}
            </div>
            {orderSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000050] bg-opacity-40">
                    <div className="relative bg-green-50 border border-green-200 text-green-700 rounded-md shadow-lg max-w-2xl w-full mx-4 p-10">
                        <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                            onClick={() => setOrderSuccess(null)}
                            aria-label="Cerrar"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">¡Pedido realizado con éxito!</h3>
                            <span className="text-sm bg-green-200 text-green-800 py-1 px-3 rounded-full">
                                #{orderSuccess.orderNumber}
                            </span>
                        </div>
                        <div className="mt-3 mb-4">
                            <p className="mb-1">
                                Hemos enviado un correo con los detalles de tu compra a <strong>{orderSuccess.buyerDetails.email}</strong>
                            </p>
                            <p className="text-lg font-semibold">Total: {orderSuccess.totalAmount} €</p>
                        </div>
                        {orderSuccess.hasGiftItems && (
                            <div className="mb-4 p-3 bg-pink-50 text-pink-700 rounded-md border border-pink-200">
                                <p className="text-sm flex items-center font-semibold mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                    </svg>
                                    Compra de regalo realizada
                                </p>
                                <ul className="text-sm ml-7 list-disc">
                                    <li>Los artículos de regalo han sido marcados como comprados</li>
                                    <li>El propietario de la lista será notificado</li>
                                    <li>Recuerda que estos artículos deben ser recogidos en tienda</li>
                                </ul>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <button
                                onClick={handleDownloadInvoice}
                                className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Descargar Factura
                            </button>
                            <button
                                onClick={handleSendEmail}
                                className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Enviar por Email
                            </button>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-200">
                            <Link
                                href="/products"
                                className="text-[#00B0C8] hover:underline flex items-center justify-center gap-2"
                                onClick={() => setOrderSuccess(null)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Continuar comprando
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </ShopLayout>
    );
}