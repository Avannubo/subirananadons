"use client";
import Link from "next/link";
import ShopLayout from "@/components/Layouts/shop-layout";
import { useTranslations } from 'next-intl';

export default function CartFailedPage() {
    const t = useTranslations('CartOrderFailedPage');
    return (
        <ShopLayout>
            <div className="min-h-[60vh] flex flex-col items-center justify-center py-16">
                <h1 className="text-3xl font-bold text-red-600 mb-4">{t('title')}</h1>
                <p className="mb-2">{t('description')}</p>
                <div className="flex gap-4 mt-6">
                    <Link href="/cart" className="bg-[#00B0C8] text-white px-6 py-2 rounded-md cursor-pointer">{t('backToCart')}</Link>
                    <Link href="/products" className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md cursor-pointer">{t('continueShopping')}</Link>
                </div>
            </div>
        </ShopLayout>
    );
}
