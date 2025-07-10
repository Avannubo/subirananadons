"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { OrderService } from '@/services/OrderService';
import { toast } from 'react-hot-toast';
import ShopLayout from '@/components/Layouts/shop-layout';
export default function CartSuccessPage() {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [invoiceBlob, setInvoiceBlob] = useState(null);

    // Create order from localStorage 'orderpending' (for payment return or recovery)
    const createOrderFromPending = async () => {
        if (typeof window === 'undefined') return;
        const pending = window.localStorage.getItem('orderpending');
        // setOrder(pending || null);
        console.log('Pending order:', pending);
        if (!pending) return;
        try {
            const orderPending = JSON.parse(pending);
            const data = await OrderService.createOrder(orderPending);

            // add the click on the btns here adter 2000ms
            setTimeout(() => {
                if (typeof window !== 'undefined') {
                    // Simulate button clicks
                    // window.dispatchEvent(new Event('download-invoice'));
                    window.dispatchEvent(new Event('send-email'));
                }
            }, 2000);
            // onClick={handleDownloadInvoice}
            // onClick={handleSendEmail}

            window.localStorage.removeItem('orderpending');
            window.localStorage.removeItem('cart');
            return data;
        } catch (err) {
            toast.error('Error al procesar el pedido pendiente');
            return null;
        }
    };

    useEffect(() => {
        createOrderFromPending()
            .then(async (data) => {
                if (data?.id) {
                    // Fetch the full order from the DB
                    try {
                        const res = await fetch(`/api/orders/${data.id}`);
                        const json = await res.json();
                        if (json.success && json.order) {
                            setOrder(json.order);
                            // Send confirmation email ONCE after order creation
                            try {
                                const resEmailer = await fetch(`/api/orders/${data.id}/send-email`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                });
                                if (!resEmailer.ok) {
                                    toast.error('No se pudo enviar el email de confirmación');
                                }
                            } catch (err) {
                                toast.error('No se pudo enviar el email de confirmación');
                            }
                            // Generate and auto-download invoice ONCE after order creation
                            try {
                                const resInvoice = await fetch(`/api/orders/${data.id}/invoice`, {
                                    method: 'GET',
                                    headers: { 'Accept': 'application/pdf' }
                                });
                                if (!resInvoice.ok) throw new Error('No se pudo generar la Ticket');
                                const blob = await resInvoice.blob();
                                setInvoiceBlob(blob);
                                // Auto-download
                                const url = window.URL.createObjectURL(blob);
                                const invoiceNumber = json.order.orderNumber || json.order._id || json.order.id;
                                const filename = `Ticket-${invoiceNumber}.pdf`;
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = filename;
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                                window.URL.revokeObjectURL(url);
                                toast.success('Ticket descargada correctamente');
                            } catch (err) {
                                toast.error('Error al generar la Ticket');
                            }
                        } else {
                            setOrder(null);
                        }
                    } catch (err) {
                        setOrder(null);
                        toast.error('No se pudo obtener el pedido completo');
                    }
                } else {
                    setOrder(data?.order || null);
                }
                setLoading(false);
            });
    }, []);

    // Generate and save invoice PDF blob when order is loaded (for button re-download)
    useEffect(() => {
        if (!order) return;
        // Only generate if not already set (avoid duplicate download)
        if (invoiceBlob) return;
        const generateInvoice = async () => {
            try {
                const orderId = order._id || order.id;
                const res = await fetch(`/api/orders/${orderId}/invoice`, {
                    method: 'GET',
                    headers: { 'Accept': 'application/pdf' }
                });
                if (!res.ok) throw new Error('No se pudo generar la Ticket');
                const blob = await res.blob();
                setInvoiceBlob(blob);
            } catch (err) {
                toast.error('Error al generar la Ticket');
            }
        };
        generateInvoice();
    }, [order]);

    // Download the invoice PDF
    const handleDownloadInvoice = () => {
        if (!invoiceBlob || !order) return;
        const url = window.URL.createObjectURL(invoiceBlob);
        const invoiceNumber = order.orderNumber || order._id || order.id;
        const filename = `Ticket-${invoiceNumber}.pdf`;
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success('Ticket descargada correctamente');
    }

    // Handle sending email with receipt using API route
    const handleSendEmail = async () => {
        if (!order?._id && !order?.id) return;
        const orderId = order._id || order.id;
        toast.loading('Enviando email...');
        try {
            const response = await fetch(`/api/orders/${orderId}/send-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            toast.dismiss();
            if (!response.ok) {
                throw new Error('Error al enviar el email');
            }
            toast.success('Email enviado correctamente');
        } catch (error) {
            toast.dismiss();
            toast.error('Error al enviar el email');
        }
    };

    // Listen for simulated events and call the handlers
    useEffect(() => {
        const downloadListener = () => handleDownloadInvoice();
        const emailListener = () => handleSendEmail();
        window.addEventListener('download-invoice', downloadListener);
        window.addEventListener('send-email', emailListener);
        return () => {
            window.removeEventListener('download-invoice', downloadListener);
            window.removeEventListener('send-email', emailListener);
        };
    }, [invoiceBlob, order]);

    if (loading) return <div className="min-h-[60vh] flex items-center justify-center">Cargando...</div>;

    return (
        <ShopLayout>    <div className="min-h-[60vh] flex flex-col items-center justify-center py-16">
            <h1 className="text-3xl font-bold text-green-700 mb-4">¡Pago realizado con éxito!</h1>
            {order ? (
                <>
                    <p className="mb-2">Pedido #{order.orderNumber || order._id}</p>
                    <p className="mb-2">Gracias por tu compra. Te hemos enviado un email con los detalles.</p>
                    {/* <p className="mb-2 font-semibold">Total: {order.totalAmount} €</p> */}
                    <div className="flex gap-4 mt-6">
                        <button onClick={handleDownloadInvoice} className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors">Descargar Ticket</button>
                        <button onClick={handleSendEmail} className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors">Enviar Email</button>
                    </div>
                </>
            ) : (
                <p>No se pudo encontrar el pedido.</p>
            )}
            <div className="flex gap-4 mt-6">
                <Link href="/products" className="bg-[#00B0C8] text-white px-6 py-2 rounded-md">Seguir comprando</Link>
                <Link href="/" className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md">Inicio</Link>
            </div>
        </div>
        </ShopLayout>

    );
}
