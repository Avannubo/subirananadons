'use client';
import Image from "next/image";
import MenuVertical from "@/components/ui/MenuHeader";
import UserAuth from "@/components/ui/UserAuthModal";
import Link from "next/link";
import { Search, ShoppingCart } from 'lucide-react';

export default function Page() {
    return (
        <div className="fixed top-0 z-50 w-full bg-white shadow-md p-5">
            <div className="flex flex-col justify-center ">
                <div className="w-full self-center flex flex-row justify-between items-center ">
                    {/* add a hamburger menu */}
                    <div className=" flex justify-between items-center px-4 py-3 w-[300px]">
                        <MenuVertical />
                    </div>
                    {/* Logo */}
                    <div className="flex-1 text-center">
                        <Link href="/" className="inline-block">
                            <Image
                                src="/assets/logo-header.svg"
                                alt="Subirana Nadons"
                                width={200}
                                height={50}
                                className="max-h-12 w-auto"
                                priority
                            />
                        </Link>
                    </div>
                    {/* User menu */}
                    <div className="flex items-center justify-end space-x-4 px-4 w-[300px]">
                        <Link href="/search" className="hover:text-gray-600">
                            <Search className="h-6 w-6" />
                        </Link>
                        <Link href="/cart" className="hover:text-gray-600">
                            <ShoppingCart className="h-6 w-6" />
                        </Link>
                        <UserAuth />
                    </div>
                </div>
            </div>
        </div>
    );
}