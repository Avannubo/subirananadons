'use client';
import Image from "next/image";
import MenuVertical from "@/components/ui/MenuHeader";
import UserAuth from "@/components/ui/UserAuthModal";
import Link from "next/link";
import { useSession } from 'next-auth/react';
import { ShoppingCart, Search } from 'lucide-react';
import { useCart } from '@/contexts/CartContext.jsx';
export default function Page() {
    const { cartItems } = useCart();
    // Calculate total quantity of items in cart
    const cartItemsCount = cartItems ? cartItems.reduce((total, item) => total + item.quantity, 0) : 0;
    return (
        <div className="fixed top-0 z-50 w-full bg-white shadow-md px-2 md:px-5 py-3 md:py-5">
            <div className="flex flex-col justify-center w-full">
                <div className="w-full flex flex-row justify-between items-center">
                    {/* Hamburger menu */}
                    <div className="flex justify-between items-center px-0 md:px-4 py-2 md:py-3 w-[90px] md:w-[300px]">
                        <MenuVertical />
                    </div>
                    {/* Logo */}
                    <Link href="/" className="flex justify-center items-center w-[120px] md:w-[300px]">
                        <Image
                            src="/assets/logo-header.svg"
                            alt="logo"
                            width={120}
                            height={60}
                            className="md:w-[250px] md:h-[70px] w-[120px] h-[40px] object-contain"
                        />
                    </Link>
                    {/* Icon stack for search, account, and cart icons */}
                    <div className="w-[90px] md:w-[300px] flex justify-end space-x-2 md:space-x-4 text-gray-700">
                        {/* Search Icon */}
                        <Link href="/search" className="p-2 flex justify-center items-center">
                            <Search className="w-5 h-5 md:w-6 md:h-6" />
                        </Link>
                        {/* Cart Icon with Counter */}
                        <Link href="/cart" className="p-2 text-sm text-gray-700 relative">
                            <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                            {cartItemsCount > 0 && (
                                <span className="absolute top-1 -right-1 bg-[#00B0C8] text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center">
                                    {cartItemsCount}
                                </span>
                            )}
                        </Link>
                        {/* Account Icon */}
                        <UserAuth />
                    </div>
                </div>
            </div>
        </div>
    );
}