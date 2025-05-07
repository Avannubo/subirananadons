'use client';
import Image from "next/image";
import MenuVertical from "@/components/ui/MenuHeader";
import UserAuth from "@/components/ui/UserAuthModal";
import Link from "next/link";
import { useSession } from 'next-auth/react';
import { ShoppingCart, Search } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
export default function Page() { 
    const { cartItems } = useCart();
    // Calculate total quantity of items in cart
    const cartItemsCount = cartItems ? cartItems.reduce((total, item) => total + item.quantity, 0) : 0;
    return (
        <div className="fixed top-0 z-50 w-full bg-white shadow-md p-5">
            <div className="flex flex-col justify-center ">
                <div className="w-full self-center flex flex-row justify-between items-center ">
                    {/* add a hamburger menu */}
                    <div className=" flex justify-between items-center px-4 py-3 w-[300px]">
                        <MenuVertical />
                    </div>
                    {/* Logo */}
                    <Link href="/" className="flex justify-center items-center w-[300px]">
                        <Image
                            src="/assets/logo-header.svg"
                            alt="logo"
                            width={250}
                            height={350}
                        />
                    </Link>
                    {/* Icon stack for search, account, and cart icons */}
                    <div className=" w-[300px] flex justify-end space-x-4 text-gray-700">
                        {/* Search Icon */}
                        <Link href="/search" className="p-2 flex justify-center items-center">
                            <Search />
                        </Link>
                        {/* Cart Icon with Counter */}
                        <Link href="/cart" className="p-2 text-sm text-gray-700 relative">
                            <ShoppingCart />
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