"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { OrderService } from '@/services/OrderService';
import { toast } from 'react-hot-toast';
import ShopLayout from '@/components/Layouts/shop-layout';
import { useTranslations } from 'next-intl';
export default function CartSuccessPage() {
    // Clear localStorage for orderpending and cart
    const clearLocalOrderStorage = () => {
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem('orderpending');
            window.localStorage.removeItem('cart');
            window.localStorage.removeItem('orderId');
            window.localStorage.removeItem('pendingOrderId');
        }
    };
    const t = useTranslations('CartOrderSuccessPage');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [invoiceBlob, setInvoiceBlob] = useState(null);

    // On mount, get merchantOrder from URL and fetch the order
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const merchantOrder = params.get('merchantOrder') || window.localStorage.getItem('orderId');
        if (!merchantOrder) {
            setLoading(false);
            return;
        }
        // Fetch the order by merchantOrder
        fetch(`/api/orders/by-merchant/${merchantOrder}`)
            .then(res => res.json())
            .then(json => {
                if (json.success && json.order) {
                    setOrder(json.order);
                } else {
                    setOrder(null);
                }
                setLoading(false);
            })
            .catch(() => {
                setOrder(null);
                setLoading(false);
            });
    }, []);

    // When order is loaded, send email and generate invoice
    useEffect(() => {
        if (!order) return;
        // Send email automatically
        (async () => {
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
            // Clear local storage after email is sent
            clearLocalOrderStorage();
        })();
        // Generate invoice PDF blob
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

    if (loading) return (
        <ShopLayout>
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#36A9E1] border-t-transparent mb-4"></div>
                    <div className="text-lg text-[#36A9E1] font-semibold">{t('loading')}</div>
                </div>
            </div>
        </ShopLayout>
    );
    return (
        <ShopLayout>
            <div className="min-h-[60vh] flex flex-col items-center justify-center py-16">
                <h1 className="text-3xl font-bold text-green-700 mb-4">{t('title')}</h1>
                {order ? (
                    <>
                        <p className="mb-2">{t('orderNumber', { orderNumber: order.orderNumber || order._id })}</p>
                        <p className="mb-2">{t('thanks')}</p>
                        <div className="flex gap-4 mt-6">
                            <button onClick={handleDownloadInvoice} className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">{t('downloadInvoice')}</button>
                            <button onClick={handleSendEmail} className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">{t('sendEmail')}</button>
                        </div>
                    </>
                ) : (
                    <p>{t('notFound')}</p>
                )}
                <div className="flex gap-4 mt-6">
                    <Link href="/products" className="bg-[#36A9E1] text-white px-6 py-2 rounded-md cursor-pointer">{t('continueShopping')}</Link>
                    <Link href="/" className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md cursor-pointer">{t('home')}</Link>
                </div>
            </div>
        </ShopLayout>
    );
}
