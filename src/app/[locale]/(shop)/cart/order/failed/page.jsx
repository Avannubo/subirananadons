"use client";
import Link from "next/link";
import { useEffect } from "react";
import ShopLayout from "@/components/Layouts/shop-layout";
import { useTranslations } from 'next-intl';
export default function CartFailedPage() {
    // const clearLocalOrderStorage = () => {
    //     if (typeof window !== 'undefined') {
    //         window.localStorage.removeItem('orderpending'); 
    //         window.localStorage.removeItem('orderId');
    //         window.localStorage.removeItem('pendingOrderId');
    //         window.localStorage.removeItem('merchantOrder');
    //     }
    // };
    const t = useTranslations('CartOrderFailedPage');
    useEffect(() => {
        // clearLocalOrderStorage();
        // Clean up the orderpending from localStorage
        if (typeof window !== 'undefined') {
            try {
                localStorage.removeItem('orderpending');
                //console.log('Cleaned up orderpending from localStorage');
            } catch (error) {
                console.error('Error cleaning up localStorage:', error);
            }
        }
    }, []);
    return (
        <ShopLayout>
            <div className="min-h-[60vh] flex flex-col items-center justify-center py-16">
                <h1 className="text-3xl font-bold text-red-600 mb-4">{t('title')}</h1>
                <p className="mb-2">{t('description')}</p>
                <div className="flex gap-4 mt-6">
                    <Link href="/cart" className="bg-[#36A9E1] text-white px-6 py-2 rounded-md cursor-pointer">{t('backToCart')}</Link>
                    <Link href="/products" className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md cursor-pointer">{t('continueShopping')}</Link>
                </div>
            </div>
        </ShopLayout>
    );
}