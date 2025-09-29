import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/landing/header';
import Link from 'next/link';
import {
    CircleUserRound,
    ClipboardList,
    GiftIcon
} from 'lucide-react';
export default function AdminLayout({ children }) {
    // Define mobile tabs statically for reliability
    const mobileTabs = [
        {
            href: '/dashboard/account',
            icon: CircleUserRound,
            label: 'Cuenta',
        },
        {
            href: '/dashboard/orders',
            icon: ClipboardList,
            label: 'Pedidos',
        },
        {
            href: '/dashboard/listas',
            icon: GiftIcon,
            label: 'Listas',
        },
    ];

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1 bg-gray-100">
                {/* Sidebar: hidden on mobile, sticky on desktop */}
                <div className="hidden md:block sticky top-0 shadow-md pt-[100px] bg-white">
                    <Sidebar />
                </div>
                {/* Sidebar overlay for mobile is handled inside Sidebar component */}
                <div className="flex-1 w-full pt-24 px-2 pb-4 md:pt-28 md:px-8 md:pb-8">
                    <div className="max-w-[1400px] mx-auto">
                        {children}
                        {/* Floating horizontal tabs for mobile (bottom) */}
                        <div className="md:hidden m-2">
                            <div className="fixed bottom-2 left-0  w-full rounded-2xl shadow-2xl shadow-cyan-900 bg-white z-[99] flex justify-around md:hidden">
                                {mobileTabs.map((tab, idx) => {
                                    const Icon = tab.icon;
                                    return (
                                        <Link
                                            key={tab.href}
                                            href={tab.href}
                                            className="flex flex-col items-center justify-center py-2 px-4 text-xs text-gray-700 hover:text-[#36A9E1]"
                                        >
                                            <Icon size={22} className="mb-1" />
                                            <span>{tab.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}