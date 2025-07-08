"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CryptoJS from 'crypto-js';

export default function ModalTPV({ isOpen, onClose, orderData }) {
    const [cartItems, setCartItems] = useState(orderData?.cartProducts || []);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);

    useEffect(() => {
        if (orderData && Array.isArray(orderData.cartProducts)) {
            setCartItems(orderData.cartProducts);
        }
    }, [orderData]);

    const calculateTotal = () => {
        return cartItems.reduce((sum, p) => {
            const price = typeof p.priceValue === 'number' ? p.priceValue :
                (typeof p.price === 'number' ? p.price :
                    parseFloat(String(p.price || "0").replace(/[^\d.,]/g, '').replace(',', '.')));
            return sum + (price * (p.quantity || 1));
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
        const total = calculateTotal();
        let cleanPrecioTotal = (total * 100).toString(); // Convert to cents and string
        let merchantOrder = orderData?.orderId || String(Date.now()).substring(0, 12).padStart(4, '0');

        // Create data object for the payment request
        let data = {
            "DS_MERCHANT_AMOUNT": cleanPrecioTotal,
            "DS_MERCHANT_CURRENCY": "978",
            "DS_MERCHANT_MERCHANTCODE": "352203061",
            "DS_MERCHANT_ORDER": merchantOrder,
            "DS_MERCHANT_TERMINAL": "2",
            "DS_MERCHANT_TRANSACTIONTYPE": "0",
            "DS_MERCHANT_URLOK": `${window.location.origin}/cart?success=true`,
            "DS_MERCHANT_URLKO": `${window.location.origin}/cart?cancelled=true`
        };

        console.log('Payment Data:', data);

        // Encode parameters and calculate signature
        let encodedParameters = stringBase64Encode(JSON.stringify(data));
        let encodedSignature = "sq7HjrUOBfKmC576ILgskD5srU870gJ7";
        let encodedSignatureDES = des_encrypt(merchantOrder, base64Decode(encodedSignature));
        let encodedDsSignature = CryptoJS.HmacSHA256(encodedParameters, base64Decode(encodedSignatureDES));
        let dsSignature = CryptoJS.enc.Base64.stringify(encodedDsSignature);

        // Populate form fields
        if (typeof document !== 'undefined' && document.forms["pago"]) {
            document.forms["pago"].datos.value = JSON.stringify(data);
            document.forms["pago"].Ds_MerchantParameters.value = encodedParameters;
            document.forms["pago"].Ds_Signature.value = dsSignature;
        }

        console.log('Encoded Parameters:', encodedParameters);
        console.log('DS Signature:', dsSignature);
    };

    const handlePaymentProcess = async () => {
        setIsProcessingPayment(true);
        try {
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
    };

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
                        <h2 className="text-2xl font-bold text-[#0090a8]">Pago en proceso...</h2>
                        <p className="text-base mt-2 text-gray-700">Por favor, espera mientras procesamos tu pago.</p>
                        <div className="mt-6 flex justify-center">
                            <span className="inline-block w-8 h-8 border-4 border-[#0090a8] border-t-transparent rounded-full animate-spin"></span>
                        </div>
                    </div>
                ) : paymentStatus === 'OK' ? (
                    <div className="p-8 rounded-2xl shadow-xl text-center bg-white">
                        <h2 className="text-2xl font-bold text-green-600">¡Pago realizado!</h2>
                        <p className="text-base mt-2 text-gray-700">¡Tu pago ha sido completado con éxito!</p>
                        <h2 className="text-xl mt-4 font-semibold text-[#0090a8]">El resumen del pedido llegará a tu correo electrónico.</h2>
                        <div className='flex flex-row justify-center gap-3 mt-6'>
                            <Link href="/" className="bg-[#0090a8] hover:bg-[#008fa8d5] text-white px-5 py-2 rounded-lg font-semibold transition-colors duration-150">
                                Inicio
                            </Link>
                            <Link href="/products" className="bg-[#0090a8] hover:bg-[#008fa8d5] text-white px-5 py-2 rounded-lg font-semibold transition-colors duration-150">
                                Tienda
                            </Link>
                            <Link href="/about/contacto" className="bg-[#0090a8] hover:bg-[#008fa8d5] text-white px-5 py-2 rounded-lg font-semibold transition-colors duration-150">
                                Contacto
                            </Link>
                        </div>
                    </div>
                ) : paymentStatus === 'KO' ? (
                    <div className="p-8 rounded-2xl shadow-xl text-center bg-white">
                        <h2 className="text-2xl font-bold text-red-500">Error en el pago</h2>
                        <p className="text-base mt-2 text-gray-700">Hubo un problema al procesar tu pago. Inténtalo de nuevo.</p>
                        <div className="flex flex-row justify-center gap-3 mt-6">
                            <button onClick={handleCloseModal} className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-lg font-semibold transition-colors duration-150">
                                Cerrar
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="px-6 md:px-12 py-8 rounded-2xl shadow-xl bg-white">
                        <h2 className="text-2xl font-bold text-[#0090a8] mb-4">Resumen del Pedido</h2>
                        <div className="overflow-x-auto rounded-lg border border-gray-100">
                            <table className="w-full table-auto border-collapse text-sm">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-700">
                                        <th className="px-4 py-2 font-semibold">Producto</th>
                                        <th className="px-4 py-2 font-semibold">Cantidad</th>
                                        <th className="px-4 py-2 font-semibold">Precio</th>
                                        <th className="px-4 py-2 font-semibold">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cartItems.map((product) => (
                                        <tr key={product.id} className="border-b last:border-b-0">
                                            <td className="px-4 py-2 flex items-center gap-3">
                                                {product.image && (
                                                    <img src={product.image} alt={product.name} className="w-32 h-32 object-cover rounded-lg border border-gray-200 bg-gray-50" />
                                                )}
                                                <div>
                                                    <div className="font-medium text-xl text-gray-900">{product.name}</div>
                                                    <div className="text-xs text-gray-500">{product.brand}{product.brand && product.category ? ' - ' : ''}{product.category}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-lg text-center">{product.quantity}</td>
                                            <td className="px-4 py-2 text-lg">{typeof product.priceValue === 'number' ? product.priceValue.toFixed(2) : product.price}{typeof product.priceValue === 'number' ? '€' : ''}</td>
                                            <td className="px-4 py-2 font-medium text-lg">{typeof product.priceValue === 'number' ? (product.priceValue * product.quantity).toFixed(2) + '€' : ''}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="mt-6 text-right text-lg font-bold text-gray-900">
                            Precio total del pedido: {cartItems.reduce((sum, p) => {
                                const price = typeof p.priceValue === 'number' ? p.priceValue : (typeof p.price === 'number' ? p.price : parseFloat(String(p.price || "0").replace(/[^\d.,]/g, '').replace(',', '.')));
                                return sum + (price * (p.quantity || 1));
                            }, 0).toFixed(2)} €
                        </p>
                        <div className="flex flex-row justify-center gap-3 mt-8">
                            <button onClick={handlePaymentProcess} className="bg-[#0090a8] hover:bg-[#008fa8d5] text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-150 h-[42px]">
                                Confirmar Pago
                            </button>
                            <button onClick={onClose} className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-150 h-[42px]">
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}
                {/* Hidden payment form for Redsys */}
                <form className="hidden" target="_blank" name="pago" action="https://sis-t.redsys.es:25443/sis/realizarPago" method="POST" >
                    <textarea name="Ds_MerchantParameters" cols="80" rows="5" readOnly></textarea>
                    <input type="text" name="Ds_Signature" defaultValue="" size="100" readOnly />
                    <input type="text" name="Ds_SignatureVersion" defaultValue="HMAC_SHA256_V1" readOnly />
                    <input type="submit" value="Probar contra test" />
                </form>
            </div>
        </div>
    ) : null;
}