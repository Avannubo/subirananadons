'use client'
import { useEffect, useState, useMemo } from 'react';
import ShopLayout from "@/components/Layouts/shop-layout"; 
import Link from "next/link";
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext.jsx';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'react-hot-toast';
import { ShoppingCart } from 'lucide-react';
import dynamic from 'next/dynamic'; 
import { useTranslations } from 'next-intl'; 
const ModalTPV = dynamic(() => import('@/components/cart/ModalTPV'), { ssr: false });
export default function CartPage() {
    const t = useTranslations('CartPage');
    const { items: cartItems, updateQuantity, removeFromCart, updateItemNote, clearCart, loading: cartLoading } = useCart();
    console.log('Cart items:', cartItems);
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
        notes: '',
        giftNote: '' // Add new field for gift-specific notes
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(null);
    const [orderError, setOrderError] = useState(null);
    // Remove userType state since we're not using login options anymore
    const [invoiceBlob, setInvoiceBlob] = useState(null);
    const [showTPVModal, setShowTPVModal] = useState(false);
    const [tpvOrderData, setTpvOrderData] = useState(null);
    const [tpvTotal, setTpvTotal] = useState(0);
    // Separate regular and gift items once cartItems is available
    const regularItems = useMemo(() => cartItems?.filter(item => item.type !== 'gift') ?? [], [cartItems]);
    const giftItems = useMemo(() => cartItems?.filter(item => item.type === 'gift') ?? [], [cartItems]);
    // Check if cart has any gift items
    const hasGiftItems = useMemo(() => {
        return cartItems?.some(item => item.type === 'gift') ?? false;
    }, [cartItems]);
    // Check if cart has only gift items
    const hasOnlyGiftItems = useMemo(() => {
        return cartItems?.length > 0 && cartItems?.every(item => item.type === 'gift');
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
                province: prev.province,
                notes: prev.notes || '', // Add notes field here
                giftNote: prev.giftNote || '' // Add notes field here
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
        // console.log(`Delivery method: ${deliveryMethod}, Subtotal: ${calculateSubtotal()}, Shipping: ${shipping}`);
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
    // Subtotal for only regular (personal) items
    const calculateRegularSubtotal = () => {
        return regularItems.reduce((sum, item) => {
            const price = typeof item.priceValue === 'number'
                ? item.priceValue
                : (typeof item.price === 'number'
                    ? item.price
                    : parseFloat(String(item.price || "0").replace(/[^\d.,]/g, '').replace(',', '.')));
            return sum + (price * (item.quantity || 1));
        }, 0);
    };
    const calculateShipping = () => {
        const regularSubtotal = calculateRegularSubtotal();
        if (deliveryMethod === 'pickup') return 0;
        return regularSubtotal >= 60 ? 0 : (regularItems.length === 0 ? 0 : 5.99);
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
            console.log('Saving user address preferences:', {
                name: formData.name,
                lastName: formData.lastName,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                postalCode: formData.postalCode,
                province: formData.province,
            });
        } catch (error) {
            console.error('Error saving address preferences:', error);
        }
    };
    // Handle order submission
    const handleSubmitOrder = async () => {
        setOrderError(null);
        if (cartItems.length === 0) {
            setOrderError('No hay productos en el carrito');
            return;
        }
        // Validate required fields (basic)
        const requiredFields = ['name', 'lastName', 'email', 'phone'];
        const needsShippingAddress = deliveryMethod === 'delivery' && regularItems.length > 0;
        if (needsShippingAddress) {
            requiredFields.push('address', 'city', 'postalCode', 'province');
        }
        const missingFields = requiredFields.filter(field => !formData[field]);
        if (missingFields.length > 0) {
            setOrderError('Por favor, completa todos los campos obligatorios');
            return;
        }
        // Build orderData as requested
        const buyerInfo = {
            name: `${formData.name} ${formData.lastName}`.trim(),
            email: formData.email,
            phone: formData.phone
        };
        const orderData = {
            items: cartItems.map(item => ({
                ...item,
                buyerInfo: item.type === 'gift' ? {
                    ...buyerInfo,
                    ...(item.listInfo || {}),
                    note: formData.giftNote
                } : undefined,
                quantity: item.type === 'gift' ? 1 : item.quantity,
                notes: formData.notes
            })),
            shippingDetails: {
                ...formData,
                // Only include address if there are regular items and delivery is selected
                ...(needsShippingAddress ? {} : {
                    address: undefined,
                    city: undefined,
                    postalCode: undefined,
                    province: undefined
                })
            },
            deliveryMethod,
            hasGiftItems,
            isGiftOnly: hasOnlyGiftItems,
            notes: formData.notes,
            giftNote: hasGiftItems ? formData.giftNote : undefined,
            totals: {
                subtotal: calculateSubtotal(),
                shipping: calculateShipping(),
                tax: calculateTax(),
                total: calculateTotal()
            }
        };
        // Save orderData as 'orderpending' in localStorage
        if (typeof window !== 'undefined') {
            try {
                window.localStorage.setItem('orderpending', JSON.stringify(orderData));
            } catch (e) {
                // Ignore localStorage errors
            }
        }
        setTpvOrderData(prepareTPVOrderData());
        setTpvTotal(calculateTotal());
        setShowTPVModal(true);
    };
    // Helper to prepare TPV order data
    const prepareTPVOrderData = () => {
        return {
            orderId: (Date.now() % 100000000).toString().padStart(8, '0'),
            cartProducts: cartItems,
        };
    };
    // In the return JSX, after the main ShopLayout content:
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
                                        <div className="flex items-start justify-between">
                                            {/* <h2 className="text-xl font-bold mb-6">{t('userData')}</h2> */}
                                            {/* {!user && (
                                                <button
                                                    onClick={() => setIsAuthModalOpen(true)}
                                                    className="text-[#00B0C8] text-sm hover:underline"
                                                >
                                                    {t('login')}
                                                </button>
                                            )} */}
                                        </div>
                                        {!user ? (
                                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                                <p className="text-sm text-blue-600 mb-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {t('loginInfo')}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    {t('loginPanelInfo')}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                                <p className="text-sm flex items-center text-blue-600">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    {t('buyingAs')} {user.email}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className='bg-white rounded-lg shadow-sm p-6 '>
                                        <h2 className="text-xl font-bold mb-6">{deliveryMethod === 'pickup' ? t('contactData') : t('shippingData')}</h2>
                                        {userLoading ? (
                                            <div className="flex items-center justify-center py-4">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00B0C8]"></div>
                                                <span className="ml-2 text-gray-600">{t('loadingUserData')}</span>
                                            </div>
                                        ) : (
                                            <>
                                                {hasGiftItems && (
                                                    <div className="mb-4 p-3 bg-pink-50 text-pink-700 rounded-md border border-pink-200">
                                                        <p className="text-sm flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            {t('giftPickupOnly')}
                                                        </p>
                                                    </div>
                                                )}
                                                {user && (
                                                    <div className="mb-4 p-3 bg-blue-50 text-blue-600 rounded-md border border-blue-100">
                                                        <p className="text-sm flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            {t('autofillInfo')}
                                                        </p>
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="col-span-1">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            {t('nameLabel')}
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
                                                            {t('lastNameLabel')}
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
                                                            {t('emailLabel')}
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
                                                    <div className="col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            {t('phoneLabel')}
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
                                                    {showAddressFields && (
                                                        <>
                                                            <div className="col-span-2">
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    {t('addressLabel')}
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
                                                                    {t('cityLabel')}
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
                                                                    {t('postalCodeLabel')}
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
                                                                    {t('provinceLabel')}
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
                                                    <div className="col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            {t('notesLabel')}
                                                        </label>
                                                        <textarea
                                                            name="notes"
                                                            value={formData.notes}
                                                            onChange={handleInputChange}
                                                            placeholder={t('notesPlaceholder')}
                                                            rows={3}
                                                            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B0C8] text-sm"
                                                        />
                                                    </div>
                                                    {hasGiftItems && (
                                                        <div className="col-span-2">
                                                            <label className="block text-sm font-medium text-pink-600 mb-1">
                                                                {t('giftNoteLabel')}
                                                            </label>
                                                            <textarea
                                                                name="giftNote"
                                                                value={formData.giftNote}
                                                                onChange={handleInputChange}
                                                                placeholder={t('giftNotePlaceholder')}
                                                                rows={3}
                                                                className="w-full px-3 py-2 border border-pink-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm bg-pink-50/30"
                                                            />
                                                            <p className="mt-1 text-xs text-pink-600">
                                                                {t('giftNoteHelp')}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* Right Column - Products */}
                            <div className="lg:w-1/2 flex flex-col">
                                {/* Regular Items Section */}
                                {regularItems.length > 0 && (
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                        <h2 className="text-xl font-bold p-6 border-b border-gray-200">{t('yourOrder')}</h2>
                                        {regularItems.map((item, index) => (
                                            <div key={index} className="flex items-center gap-4 p-4 border-b border-gray-200 last:border-b-0">
                                                <div className="relative w-20 h-20 overflow-hidden">
                                                    <img
                                                        src={item.image || item.imageUrl || '/assets/images/Screenshot_4.png'}
                                                        alt={item.name || 'Producto'}
                                                        fill="true"
                                                        className="object-contain rounded-md z-0 overflow-hidden"
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
                                                    <h3 className="font-medium">{typeof item.name === 'object' ?  item.name.es || item.name.ca : item.name}</h3>
                                                    {/* <p className="text-gray-500 text-sm">{item.brand.name} - {typeof item.category === 'object' ? item.category.name.es || item.category.name.ca : item.category.name}</p> */}
                                                    <p className="text-[#00B0C8] font-medium">{item.price}€</p>
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
                                                        className="cursor-pointer w-8 h-8 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-100"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, Math.min(99, item.quantity + 1))}
                                                        className="cursor-pointer w-8 h-8 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-100"
                                                        disabled={item.quantity >= 99}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-red-500 hover:text-red-700 cursor-pointer"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                        {regularItems.length === 0 && (
                                            <p className="text-gray-500 text-center py-4">{t('noProducts')}</p>
                                        )}
                                    </div>
                                )}
                                {/* Gift Items Section - Only show if there are gift items */}
                                {giftItems.length > 0 && (
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-4">
                                        <h2 className="text-xl font-bold p-6 border-b border-gray-200">{t('giftOrder')}</h2>
                                        {giftItems.map((item, index) => (
                                            <div key={index} className="flex items-center gap-4 p-4 border-b border-gray-200 last:border-b-0">
                                                <div className="relative w-20 h-20">
                                                    <img
                                                        src={item.image || item.imageUrl || '/assets/images/Screenshot_4.png'}
                                                        alt={item.name || 'Producto'}
                                                        fill="true"
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
                                                <div className="flex-1">
                                                    <h3 className="font-medium">{typeof item.name === 'object' ? item.name[t('locale')] || item.name['es'] || item.name['ca'] : item.name}</h3>
                                                    <p className="text-gray-500 text-sm">{item.brand} - {typeof item.category === 'object' ? item.category[t('locale')] || item.category['es'] || item.category['ca'] : item.category}</p>
                                                    <p className="text-[#00B0C8] font-medium">{item.price}€</p>
                                                    {item.isGift && item.listOwner && (
                                                        <p className="text-xs text-pink-600 mt-1">
                                                            Lista de regalo: {item.listOwner}
                                                            <span className="ml-2 bg-green-100 text-green-700 px-1 rounded text-xs">Será marcado como comprado</span>
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex-1 flex-col space-y-3 w-full mt-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2 justify-between">                                            <p className="text-sm text-gray-500">Cantidad: 1</p>
                                                            <button
                                                                onClick={() => removeFromCart(item.id)}
                                                                className="cursor-pointer text-sm text-red-600 hover:text-red-900"
                                                            >
                                                                {t('remove')}
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
                                    <h2 className="text-xl font-bold mb-4">{t('deliveryMethod')}</h2>
                                    {/* Gift Items Notice */}
                                    {hasGiftItems && (
                                        <div className="mb-4 p-3 bg-pink-50 border border-pink-200 rounded-lg">
                                            <p className="text-sm text-pink-700 flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-15 w-15 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                                </svg>
                                                {hasOnlyGiftItems
                                                    ? t('onlyGiftItemsInfo')
                                                    : t('giftItemsInfo')
                                                }
                                            </p>
                                        </div>
                                    )}
                                    {/* Free Shipping Progress */}
                                    {calculateRegularSubtotal() < 60 && deliveryMethod === 'delivery' && !hasGiftItems && (
                                        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                            <p className="text-sm text-gray-700 mb-2">
                                                {t('addForFreeShipping', { amount: (60 - calculateRegularSubtotal()).toFixed(2) })}
                                            </p>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className="bg-[#00B0C8] h-2.5 rounded-full transition-all duration-500 ease-in-out"
                                                    style={{ width: `${Math.min(100, (calculateRegularSubtotal() / 60) * 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="space-y-4">
                                        <div
                                            className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${hasOnlyGiftItems
                                                ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60'
                                                : deliveryMethod === 'delivery'
                                                    ? 'border-[#00B0C8] bg-[#00B0C8]/5 cursor-pointer'
                                                    : 'border-gray-200 hover:border-[#00B0C8] cursor-pointer'
                                                }`}
                                            onClick={() => !hasOnlyGiftItems && handleDeliveryMethodChange('delivery')}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${hasOnlyGiftItems
                                                    ? 'border-gray-400'
                                                    : deliveryMethod === 'delivery' ? 'border-[#00B0C8]' : 'border-gray-400'
                                                    }`}>
                                                    {deliveryMethod === 'delivery' && !hasOnlyGiftItems && (
                                                        <div className="w-2.5 h-2.5 rounded-full bg-[#00B0C8]" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{t('deliveryOption')}</p>
                                                    {/* <p className="text-sm text-gray-500">Entrega en 24-48 horas laborables</p> */}
                                                    {calculateRegularSubtotal() >= 60 && !hasOnlyGiftItems && (
                                                        <p className="text-xs text-green-600 font-medium mt-1">{t('freeShippingInfo')}</p>
                                                    )}
                                                    {hasGiftItems && !hasOnlyGiftItems && (
                                                        <p className="text-xs text-orange-600 font-medium mt-1">{t('giftPickupInfo')}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-[#00B0C8] font-medium">
                                                {calculateRegularSubtotal() >= 60 || regularItems.length === 0 ? t('free') : t('shippingPrice')}
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
                                                    <p className="font-medium">{t('pickupOption')}</p>
                                                    {/* <p className="text-sm text-gray-500">Disponible in 2-4 horas</p> */}
                                                    {hasGiftItems && (
                                                        <p className="text-xs text-pink-600 font-medium mt-1">
                                                            {hasOnlyGiftItems
                                                                ? t('onlyGiftPickup')
                                                                : t('mandatoryGiftPickup')
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-[#00B0C8] font-medium">{t('free')}</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Order Summary */}
                                <div className="bg-white rounded-lg shadow-sm p-6 mt-4 border border-gray-200">
                                    <h2 className="text-xl font-bold mb-4">{t('orderSummary')}</h2>
                                    <div className="flex flex-col justify-between items-end gap-4">
                                        <div className="w-full space-y-3">
                                            <div className="flex justify-between">
                                                <span>{t('subtotal')}</span>
                                                <span>{calculateSubtotal().toFixed(2)} €</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span>{t('shipping')}</span>
                                                {calculateRegularSubtotal() >= 60 && deliveryMethod === 'delivery' ? (
                                                    <span className="flex items-center text-green-600">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        {t('free')}
                                                    </span>
                                                ) : (
                                                    <span>{calculateShipping().toFixed(2)} €</span>
                                                )}
                                            </div>
                                            <div className="border-t border-gray-200 pt-3 mt-3">
                                                <div className="flex justify-between font-bold">
                                                    <span>{t('total')}</span>
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
                                                className={`w-full ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#00B0C8] hover:bg-[#0090a8] cursor-pointer'} text-white py-3 px-6 rounded-md transition-colors duration-300`}
                                            >
                                                {isSubmitting ? t('processing') : t('checkout')}
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
                        className="text-center py-16 min-h-[60vh] flex flex-col items-center justify-center space-y-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <ShoppingCart className='text-gray-600 w-40 h-40' />
                        <h2 className="text-2xl text-gray-800 font-bold mb-4">{t('emptyTitle')}</h2>
                        <p className="text-gray-500 mb-8">{t('emptyDescription')}</p>
                        <Link
                            href="/products"
                            className="inline-block bg-[#00B0C8] text-white py-3 px-6 rounded-md hover:bg-[#0090a8] transition-colors duration-300"
                        >
                            {t('continueShopping')}
                        </Link>
                    </motion.div>
                )}
            </div>
            <ModalTPV
                isOpen={showTPVModal}
                onClose={() => setShowTPVModal(false)}
                orderData={tpvOrderData}
                precioTotal={tpvTotal}
            />
        </ShopLayout>
    );
}