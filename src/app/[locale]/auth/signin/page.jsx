"use client";
import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import ShopLayout from '@/components/Layouts/shop-layout';
import { toast } from 'react-hot-toast';
export default function SignIn() {
    const t = useTranslations('UserAuthModal');
    const searchParams = useSearchParams();
    const router = useRouter();
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
    // Redirect to home with modal if accessed directly
    useEffect(() => {
        router.replace(`/?showLogin=true&callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }, [callbackUrl, router]);
    // This page will immediately redirect, but we'll render a form that matches our modal styling
    // in case there's a delay in the redirect
    return (
        <ShopLayout>
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-[100px] h-[100px] border-4 border-[#36A9E1] border-t-transparent rounded-full animate-spin"></div>
            </div>
        </ShopLayout>
    );
}