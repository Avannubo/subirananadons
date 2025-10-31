"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CryptoJS from 'crypto-js';
export default function ModalTPV({ isOpen, onClose, orderData }) {
    // Save merchantOrderId from localStorage in a variable and use everywhere
    const merchantOrderId = typeof window !== 'undefined' ? window.localStorage.getItem('orderId') : '';
    const localStorageOrder = typeof window !== 'undefined' ? window.localStorage.getItem('orderpending') : null;
    const [payWith, setPayWith] = useState("C");
    const [cartItems, setCartItems] = useState(() => {
        // Always prefer orderData.orderData, fallback to localStorage
        if (orderData && Array.isArray(orderData.orderData) && orderData.orderData.length > 0) {
            return orderData.orderData;
        }
        if (localStorageOrder) {
            try {
                const parsed = JSON.parse(localStorageOrder);
                if (Array.isArray(parsed.items) && parsed.items.length > 0) {
                    return parsed.items;
                }
            } catch (e) {
                // ignore parse error
            }
        }
        return []; 
    });
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);
    // Get locale from URL or default to 'ca'
    let locale = 'ca';
    if (typeof window !== 'undefined') {
        const pathLocale = window.location.pathname.split('/')[1];
        if (['ca', 'es'].includes(pathLocale)) locale = pathLocale;
    }
    const translations = {
        ca: {
            processingPayment: "Pagament en procés...",
            pleaseWait: "Si us plau, espera mentre processem el teu pagament.",
            paymentSuccess: "Pagament realitzat!",
            paymentCompleted: "El teu pagament s'ha completat amb èxit!",
            orderSummaryEmail: "El resum de la comanda arribarà al teu correu electrònic.",
            home: "Inici",
            shop: "Botiga",
            contact: "Contacte",
            paymentError: "Error en el pagament",
            paymentProblem: "Hi ha hagut un problema en processar el teu pagament. Torna-ho a intentar.",
            close: "Tancar",
            orderSummary: "Resum de la Comanda",
            product: "Producte",
            quantity: "Quantitat",
            price: "Preu",
            total: "Total",
            totalOrderPrice: "Preu total de la comanda:",
            totalDiscount: "Total descomptes",
            confirmPayment: "Procedir al Pagament",
            confirmPaymentBizum: "Pagar amb Bizum",
            confirmPaymentTarjeta: "Pagar amb Targeta",
            cancel: "Cancel·lar"
            ,
            paymentDisclaimerTitle: "Important",
            paymentDisclaimerPart1: "Seràs redirigit a la plataforma de pagament de Redsys.",
            paymentDisclaimerHighlight: " Recorda prémer el botó CONTINUAR en finalitzar",
            paymentDisclaimerPart2: ", encara que completis o cancells el pagament, perquè puguem registrar la resposta."
        },
        es: {
            processingPayment: "Pago en proceso...",
            pleaseWait: "Por favor, espera mientras procesamos tu pago.",
            paymentSuccess: "¡Pago realizado!",
            paymentCompleted: "¡Tu pago ha sido completado con éxito!",
            orderSummaryEmail: "El resumen del pedido llegará a tu correo electrónico.",
            home: "Inicio",
            shop: "Tienda",
            contact: "Contacto",
            paymentError: "Error en el pago",
            paymentProblem: "Hubo un problema al procesar tu pago. Inténtalo de nuevo.",
            close: "Cerrar",
            orderSummary: "Resumen del Pedido",
            product: "Producto",
            quantity: "Cantidad",
            price: "Precio",
            total: "Total",
            totalOrderPrice: "Precio total del pedido:",
            totalDiscount: "Total descuentos",
            confirmPayment: "Proceder al Pago",
            confirmPaymentBizum: "Pagar com Bizum",
            confirmPaymentTarjeta: "Pagar con Targeta",
            cancel: "Cancelar"
            ,
            paymentDisclaimerTitle: "Importante",
            paymentDisclaimerPart1: "Serás redirigido a la plataforma de pago de Redsys.",
            paymentDisclaimerHighlight: " Recuerda pulsar el botón CONTINUAR al finalizar",
            paymentDisclaimerPart2: ", aunque completes o canceles el pago, para que podamos registrar la respuesta."
        }
    };
    useEffect(() => {
        // Always update cartItems if orderData changes, fallback to localStorage if missing
        if (orderData && Array.isArray(orderData.orderData) && orderData.orderData.length > 0) {
            setCartItems(orderData.orderData);
        } else if (localStorageOrder) {
            try {
                const parsed = JSON.parse(localStorageOrder);
                if (Array.isArray(parsed.items) && parsed.items.length > 0) {
                    setCartItems(parsed.items);
                }
            } catch (e) {
                // ignore parse error
            }
        } else {
            setCartItems([]);
        }
    }, [orderData, localStorageOrder]);
    // Use a ref to track the current payment method immediately
    const payWithRef = React.useRef("C");
    // Update both state and ref when payment method changes
    const updatePaymentMethod = (method) => {
        setPayWith(method);
        payWithRef.current = method;
    };
    const handleCardPayment = () => {
        updatePaymentMethod("C");
        handlePaymentProcess();
    };
    const handleBizumPayment = () => {
        updatePaymentMethod("z"); // Changed from "z" to "Z" for consistency
        handlePaymentProcess();
    };
    // Helper to render localized fields safely (handles {ca, es} objects)
    const renderField = (field) => {
        try {
            if (field == null) return '';
            if (typeof field === 'string' || typeof field === 'number') return String(field);
            if (typeof field === 'object') {
                // If it's an object with a nested name, prefer that
                if (field.name) return renderField(field.name);
                // prefer current locale, then es, then ca, then first string value
                if (field[locale]) return String(field[locale]);
                if (field.es) return String(field.es);
                if (field.ca) return String(field.ca);
                // pick first string value
                for (const k in field) {
                    if (typeof field[k] === 'string') return field[k];
                }
                // fallback to JSON string for debugging
                console.warn('renderField: object field has no string values', field);
                return JSON.stringify(field);
            }
            return String(field);
        } catch (err) {
            console.error('renderField error:', err, field);
            return '';
        }
    };
    // Detect id-like strings (mongodb ObjectId or long hex strings) to avoid showing them as names
    const isIdLike = (s) => {
        try {
            if (!s || typeof s !== 'string') return false;
            // remove common separators
            const tokens = s.split(/[-\s,;|]+/).filter(Boolean);
            // if any token is a long hex string (>=8 hex chars), treat as id-like
            return tokens.every(t => /^[a-f0-9]{6,24}$/i.test(t));
        } catch (e) {
            return false;
        }
    };
    // Get a display name for brand/category: resolve nested objects and filter out id-like values
    const getName = (field) => {
        const val = renderField(field);
        if (!val) return '';
        if (isIdLike(val)) return '';
        return val;
    };
    const getItemPrice = (item) => {
        // Robust numeric parsing helper
        const parseNumeric = (v) => {
            try {
                if (typeof v === 'number' && Number.isFinite(v)) return v;
                if (typeof v === 'string') {
                    const clean = v.replace(/[^0-9,.-]/g, '').replace(',', '.');
                    const n = parseFloat(clean);
                    return Number.isFinite(n) ? n : 0;
                }
                // fallback: try to stringify and parse
                const s = String(v || '0');
                const clean = s.replace(/[^0-9,.-]/g, '').replace(',', '.');
                const n = parseFloat(clean);
                return Number.isFinite(n) ? n : 0;
            } catch (e) {
                return 0;
            }
        };
        // Get base price
        let basePrice = 0;
        if (typeof item.priceValue === 'number' && Number.isFinite(item.priceValue)) basePrice = item.priceValue;
        else if (typeof item.price === 'number' && Number.isFinite(item.price)) basePrice = item.price;
        else basePrice = parseNumeric(item.priceValue ?? item.price ?? 0);
        // Check if there's an active discount
        if (item.discount && item.discount.active) {
            const now = new Date();
            const startDate = item.discount.startDate ? new Date(item.discount.startDate) : null;
            const endDate = item.discount.endDate ? new Date(item.discount.endDate) : null;
            // Verify if discount is currently valid
            if ((!startDate || now >= startDate) && (!endDate || now <= endDate)) {
                if (item.discount.type === 'percentage') {
                    return basePrice * (1 - (item.discount.value / 100));
                } else if (item.discount.type === 'fixed') {
                    return Math.max(0, basePrice - item.discount.value);
                }
            }
        }
        return Number.isFinite(basePrice) ? basePrice : 0;
    };
    const calculateTotal = () => {
        return cartItems.reduce((sum, item) => {
            const price = getItemPrice(item);
            const qty = Number.isFinite(Number(item.quantity)) ? Number(item.quantity) : (item.quantity ? Number(item.quantity) : 0);
            return sum + (price * (qty || 0));
        }, 0);
    };
    const stringBase64Encode = (input) => {
        let utf8Input = CryptoJS.enc.Utf8.parse(input);
        return CryptoJS.enc.Base64.stringify(utf8Input);
    };
    const base64Decode = (input) => {
        return CryptoJS.enc.Base64.parse(input);
    };
    const des_encrypt = (message, key) => {
        let ivArray = [0, 0, 0, 0, 0, 0, 0, 0];
        let IV = ivArray.map(item => String.fromCharCode(item)).join("");
        let encode_str = CryptoJS.TripleDES.encrypt(message, key, {
            iv: CryptoJS.enc.Utf8.parse(IV),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.ZeroPadding
        });
        return encode_str.toString();
    };
    const calcularFirma = () => {
        try {
            const total = calculateTotal();
            const cents = Math.round(Number(total) * 100);
            const cleanPrecioTotal = Number.isFinite(cents) ? String(cents) : '0'; // Convert to cents and string
            // Use merchantOrderId variable everywhere
            let data = {
                "DS_MERCHANT_AMOUNT": cleanPrecioTotal,
                "DS_MERCHANT_CURRENCY": "978",
                "DS_MERCHANT_MERCHANTCODE": "352203061",
                "DS_MERCHANT_ORDER": merchantOrderId,
                "DS_MERCHANT_TERMINAL": "2",
                "DS_MERCHANT_TRANSACTIONTYPE": "0",
                "Ds_Merchant_Paymethods": payWithRef.current, // Use ref instead of state
                "DS_MERCHANT_MERCHANTURL": `${window.location.origin}/api/redsys/notification`,
                "DS_MERCHANT_URLOK": `${window.location.origin}/cart/order/success?merchantOrder=${merchantOrderId}`,
                "DS_MERCHANT_URLKO": `${window.location.origin}/cart/order/failed`
            };
            console.log('Payment method being sent:', payWithRef.current); // Debug log
            let encodedParameters = stringBase64Encode(JSON.stringify(data));
            try {
                let encodedSignature = "R3zJ3xZGifR1ZHVOEwNpuUn1c+l1jI7S";
                let encodedSignatureDES = des_encrypt(merchantOrderId, base64Decode(encodedSignature));
                let encodedDsSignature = CryptoJS.HmacSHA256(encodedParameters, base64Decode(encodedSignatureDES));
                let dsSignature = CryptoJS.enc.Base64.stringify(encodedDsSignature);
                if (typeof document !== 'undefined') {
                    const form = document.forms["pago"];
                    if (form) {
                        if (form.Ds_MerchantParameters) form.Ds_MerchantParameters.value = encodedParameters;
                        if (form.Ds_Signature) form.Ds_Signature.value = dsSignature;
                    }
                }
            } catch (sigErr) {
                console.error('calcularFirma signature error:', sigErr, { data, encodedParameters });
                if (typeof document !== 'undefined') {
                    const form = document.forms["pago"];
                    if (form) {
                        if (form.Ds_MerchantParameters) form.Ds_MerchantParameters.value = '';
                        if (form.Ds_Signature) form.Ds_Signature.value = '';
                    }
                }
            }
        } catch (err) {
            console.error('calcularFirma error:', err);
            if (typeof document !== 'undefined') {
                const form = document.forms["pago"];
                if (form) {
                    if (form.Ds_MerchantParameters) form.Ds_MerchantParameters.value = '';
                    if (form.Ds_Signature) form.Ds_Signature.value = '';
                }
            }
        }
    };
    const handlePaymentProcess = async () => {
        setIsProcessingPayment(true);
        console.log('Starting payment process with payment method:', payWithRef.current);
        console.log('Starting payment process with orderData:', orderData);
        try {
            // Always use the same merchantOrderId for pending order and payment
            const response = await fetch('/api/orders/pending', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderData: {
                        ...orderData.fullOrderData || localStorageOrder ? JSON.parse(localStorageOrder) : {},
                    },
                    merchantOrder: merchantOrderId,
                    sessionId: window.sessionStorage.getItem('sessionId') || Date.now().toString()
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error('Failed to save pending order: ' + errorText);
            }
            const { pendingOrderId } = await response.json();
            if (typeof window !== 'undefined') {
                window.localStorage.setItem('pendingOrderId', pendingOrderId);
            }
            // Process payment
            calcularFirma();
            if (typeof document !== 'undefined' && document.forms["pago"]) {
                document.forms["pago"].submit();
            }
        } catch (error) {
            setPaymentStatus('KO');
            console.error("Payment processing error:", error);
        } finally {
            setIsProcessingPayment(false);
        }
    }
    const handleCloseModal = () => {
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState(null, '', cleanUrl);
        window.location.reload();
    };
    return isOpen || paymentStatus ? (
        <div className="fixed inset-0 flex flex-wrap justify-center items-center w-full h-full z-[999] bg-[rgba(0,0,0,0.45)] overflow-auto font-[sans-serif]">
            <div className="z-[1000] max-w-4xl w-full mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 px-0 md:px-0">
                {isProcessingPayment ? (
                    <div className="p-8 rounded-2xl shadow-xl text-center bg-white">
                        <h2 className="text-2xl font-bold text-[#3f93ba]">{translations[locale].processingPayment}</h2>
                        <p className="text-base mt-2 text-gray-700">{translations[locale].pleaseWait}</p>
                        <div className="mt-6 flex justify-center">
                            <span className="inline-block w-8 h-8 border-4 border-[#3f93ba] border-t-transparent rounded-full animate-spin"></span>
                        </div>
                    </div>
                ) : paymentStatus === 'OK' ? (
                    <div className="p-8 rounded-2xl shadow-xl text-center bg-white">
                        <h2 className="text-2xl font-bold text-green-600">{translations[locale].paymentSuccess}</h2>
                        <p className="text-base mt-2 text-gray-700">{translations[locale].paymentCompleted}</p>
                        <h2 className="text-xl mt-4 font-semibold text-[#3f93ba]">{translations[locale].orderSummaryEmail}</h2>
                        <div className='flex flex-row justify-center gap-3 mt-6'>
                            <Link href="/" className="bg-[#3f93ba] hover:bg-[#008fa8d5] text-white px-5 py-2 rounded-lg font-semibold transition-colors duration-150">
                                {translations[locale].home}
                            </Link>
                            <Link href="/products" className="bg-[#3f93ba] hover:bg-[#008fa8d5] text-white px-5 py-2 rounded-lg font-semibold transition-colors duration-150">
                                {translations[locale].shop}
                            </Link>
                            <Link href="/about/contacto" className="bg-[#3f93ba] hover:bg-[#008fa8d5] text-white px-5 py-2 rounded-lg font-semibold transition-colors duration-150">
                                {translations[locale].contact}
                            </Link>
                        </div>
                    </div>
                ) : paymentStatus === 'KO' ? (
                    <div className="p-8 rounded-2xl shadow-xl text-center bg-white">
                        <h2 className="text-2xl font-bold text-red-500">{translations[locale].paymentError}</h2>
                        <p className="text-base mt-2 text-gray-700">{translations[locale].paymentProblem}</p>
                        <div className="flex flex-row justify-center gap-3 mt-6">
                            <button onClick={handleCloseModal} className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-lg font-semibold transition-colors duration-150">
                                {translations[locale].close}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="px-6 md:px-12 py-8 rounded-2xl shadow-xl bg-white">
                        <h2 className="text-2xl font-bold text-[#3f93ba] mb-4">{translations[locale].orderSummary}</h2>
                        {/* Mobile: stacked cards to avoid overlaps */}
                        <div className="md:hidden space-y-3">
                            {cartItems.map((product, idx) => (
                                <div key={product._id || product.id || idx} className="bg-white rounded-lg border border-gray-100 p-3">
                                    <div className="flex items-start gap-3">
                                        {product.image && (
                                            <img src={renderField(product.image)} alt={renderField(product.name)} className="w-16 h-16 object-cover rounded-md border border-gray-200 bg-gray-50 flex-shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-base text-gray-900 truncate">{renderField(product.name)}</div>
                                            <div className="text-xs text-gray-500 truncate">{getName(product.brand)}{getName(product.brand) && getName(product.category) ? ' - ' : ''}{getName(product.category)}</div>
                                            <div className="mt-2 text-sm text-gray-700 space-y-1">
                                                <div className="flex justify-between"><span className="text-xs text-gray-500">{translations[locale].quantity}</span><span className="font-medium">{product.quantity}</span></div>
                                                <div className="flex justify-between"><span className="text-xs text-gray-500">{translations[locale].price}</span><span className="font-medium">{getItemPrice(product).toFixed(2)}€</span></div>
                                                <div className="flex justify-between"><span className="text-xs text-gray-500">{translations[locale].total}</span><span className="font-medium">{(getItemPrice(product) * (product.quantity || 1)).toFixed(2)}€</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Desktop/tablet: keep table layout */}
                        <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-100">
                            <table className="w-full table-fixed md:table-auto border-collapse text-sm">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-700">
                                        {/* Product column: flexible so it can expand and use remaining space */}
                                        <th className="px-4 py-2 font-semibold text-left">{translations[locale].product}</th>
                                        {/* Numeric columns fixed so product column won't collapse */}
                                        <th className="px-4 py-2 font-semibold text-center w-20 md:w-24">{translations[locale].quantity}</th>
                                        <th className="px-4 py-2 font-semibold text-center w-24 md:w-28">{translations[locale].price}</th>
                                        <th className="px-4 py-2 font-semibold text-center w-24 md:w-28">{translations[locale].total}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cartItems.map((product, idx) => (
                                        <tr key={product._id || product.id || idx} className="border-b border-b-gray-100 last:border-b-0">
                                            <td className="px-4 py-2 flex items-center gap-3 min-w-0">
                                                {product.image && (
                                                    <img src={renderField(product.image)} alt={renderField(product.name)} className="w-20 h-20 md:w-32 md:h-32 flex-shrink-0 object-cover rounded-lg border border-gray-200 bg-gray-50" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-lg md:text-xl text-gray-900 max-w-auto  truncate">{renderField(product.name)}</div>
                                                    <div className="text-xs text-gray-500">{getName(product.brand)}{getName(product.brand) && getName(product.category) ? ' - ' : ''}{getName(product.category)}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-base md:text-lg text-center whitespace-nowrap">{product.quantity}</td>
                                            <td className="px-4 py-2 text-base md:text-lg text-center md:text-right whitespace-nowrap">
                                                {product.discount && product.discount.active ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-400 line-through text-sm">
                                                            {typeof product.priceValue === 'number' ? product.priceValue.toFixed(2) : product.price}€
                                                        </span>
                                                        <span className="text-red-600">
                                                            {getItemPrice(product).toFixed(2)}€
                                                            <span className="ml-1 text-xs bg-red-100 text-red-600 px-1 py-0.5 rounded">
                                                                -{product.discount.value}%
                                                            </span>
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span>
                                                        {typeof product.priceValue === 'number' ? product.priceValue.toFixed(2) : product.price}{typeof product.priceValue === 'number' ? '€' : ''}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 font-medium text-base md:text-lg text-center md:text-right whitespace-nowrap">
                                                {(getItemPrice(product) * (product.quantity || 1)).toFixed(2)}€
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-6 text-right">
                            {cartItems.some(item => item.discount?.active) && (
                                <p className="text-base text-red-600 mb-1">
                                    {translations[locale].totalDiscount}: -{cartItems.reduce((total, item) => {
                                        if (item.discount && item.discount.active) {
                                            const originalPrice = typeof item.priceValue === 'number' ? item.priceValue :
                                                parseFloat(String(item.price || "0").replace(/[^\d.,]/g, '').replace(',', '.'));
                                            const discountedPrice = getItemPrice(item);
                                            return total + ((originalPrice - discountedPrice) * (item.quantity || 1));
                                        }
                                        return total;
                                    }, 0).toFixed(2)}€
                                </p>
                            )}
                            <p className="text-lg font-bold text-gray-900">
                                {translations[locale].totalOrderPrice} {calculateTotal().toFixed(2)}€
                            </p>
                        </div>
                        <div>
                            <p className="text-lg mt-2">
                                <strong>*{translations[locale].paymentDisclaimerTitle}: </strong>
                                <span className="text-gray-700">{translations[locale].paymentDisclaimerPart1}</span>
                                <span className="text-red-600 font-semibold">{translations[locale].paymentDisclaimerHighlight}</span>
                                <span className="text-gray-700">{translations[locale].paymentDisclaimerPart2}</span>
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
                            <button
                                onClick={handleCardPayment}
                                className="flex items-center justify-center bg-[#36A9E1] hover:bg-[#3f93ba] text-white px-4 sm:px-6 py-3 sm:py-2 rounded-lg font-normal transition-colors duration-150 h-[50px] sm:h-[42px] w-full sm:w-auto text-sm sm:text-base"
                            >
                                <img src="/assets/debit-card-icon.svg" alt="Credit Card" className="w-7 h-7 mr-2 filter text-white " />
                                {translations[locale].confirmPaymentTarjeta}
                            </button>
                            <button
                                onClick={handleBizumPayment}
                                className="flex items-center justify-center bg-[#36A9E1] hover:bg-[#3f93ba] text-white px-4 sm:px-6 py-3 sm:py-2 rounded-lg font-normal transition-colors duration-150 h-[50px] sm:h-[42px] w-full sm:w-auto text-sm sm:text-base"
                            >
                                <img src="/assets/bizum.svg" alt="Bizum" className="w-5 h-5 mr-2 filter text-white" />
                                {translations[locale].confirmPaymentBizum}
                            </button>
                            <button
                                onClick={onClose}
                                className="flex items-center justify-center bg-gray-500 hover:bg-gray-600 text-white px-4 sm:px-6 py-3 sm:py-2 rounded-lg font-normal transition-colors duration-150 h-[50px] sm:h-[42px] w-full sm:w-auto text-sm sm:text-base"
                            >
                                {translations[locale].cancel}
                            </button>
                        </div>
                    </div>
                )}
                {/* Hidden payment form for Redsys           https://sis.redsys.es/sis/realizarPago */}
                <form className="hidden" name="pago" action="https://sis.redsys.es/sis/realizarPago" method="POST" >
                    <textarea name="Ds_MerchantParameters" cols="80" rows="5" readOnly></textarea>
                    <input type="text" name="Ds_Signature" defaultValue="" size="100" readOnly />
                    <input type="text" name="Ds_SignatureVersion" defaultValue="HMAC_SHA256_V1" readOnly />
                    <input type="submit" value="Probar contra test" />
                </form>
            </div>
        </div>
    ) : null;
}