"use client"
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/landing/header';
import Link from 'next/link';
import {
    CircleUserRound,
    ClipboardList,
    GiftIcon,
    LogOut
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import esMessages from '../../../messages/es.json';
import caMessages from '../../../messages/ca.json';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
export default function AdminLayout({ children }) {
    const pathname = usePathname();
    // Translate mobile tabs based on browser locale when running client-side
    const getBrowserLang = () => {
        if (typeof window === 'undefined') return 'es';
        const nav = window.navigator.language || window.navigator.userLanguage || 'es';
        return nav.split('-')[0];
    };
    const lang = getBrowserLang() === 'ca' ? 'ca' : 'es';
    const T = {
        ca: {
            account: 'Compte',
            orders: 'Comandes',
            listas: 'Llistes',
            logout: 'Tancar'
        },
        es: {
            account: 'Cuenta',
            orders: 'Pedidos',
            listas: 'Listas',
            logout: 'Cerrar'
        }
    };
    const mobileTabs = [
        {
            href: '/dashboard/account',
            icon: CircleUserRound,
            label: T[lang].account,
        },
        {
            href: '/dashboard/orders',
            icon: ClipboardList,
            label: T[lang].orders,
        },
        {
            href: '/dashboard/listas',
            icon: GiftIcon,
            label: T[lang].listas,
        },
        {
            href: '#logout',
            icon: LogOut,
            label: T[lang].logout,
            action: 'logout'
        }
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
                        <div className="md:hidden   ">
                            <div className="fixed bottom-2 left-0 z-[99] w-full  md:hidden">
                                <div className='flex flex-row space-x-1 justify-center mb-1'>
                                    <div className=' mx-2 rounded-xl p-1 shadow-2xl shadow-black bg-white flex flex-row justify-around'>
                                        {/* Render only the last tab in the array */}
                                        {(() => {
                                            const tab = mobileTabs[mobileTabs.length - 1];
                                            if (!tab) return null;
                                            const Icon = tab.icon;
                                            const isActive = typeof pathname === 'string' && pathname.includes(tab.href);
                                            if (tab.action === 'logout') {
                                                return (
                                                    <div key={`tab-last`} className="relative px-1">
                                                        {isActive && (
                                                            <motion.span
                                                                layoutId="mobile-active-tab"
                                                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                                className="absolute inset-0 bg-[#36A9E1] rounded-lg"
                                                            />
                                                        )}
                                                        <button
                                                            onClick={() => signOut({ callbackUrl: '/' })}
                                                            className={`relative z-10 flex flex-col items-center justify-center py-2 px-4 text-xs ${isActive ? 'text-white' : 'text-gray-700 hover:text-[#36A9E1]'}`}
                                                        >
                                                            <Icon size={22} className={`mb-1 ${isActive ? 'text-white' : ''}`} />
                                                            <span>{tab.label}</span>
                                                        </button>
                                                    </div>
                                                );
                                            }
                                            return (
                                                <div key={`tab-last`} className="relative px-1">
                                                    {isActive && (
                                                        <motion.span
                                                            layoutId="mobile-active-tab"
                                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                            className="absolute inset-0 bg-[#36A9E1] rounded-lg"
                                                        />
                                                    )}
                                                    <Link
                                                        href={tab.href}
                                                        aria-current={isActive ? 'page' : undefined}
                                                        className={`relative z-10 flex flex-col items-center justify-center py-2 px-4 text-xs ${isActive ? 'text-white' : 'text-gray-700 hover:text-[#36A9E1]'}`}
                                                    >
                                                        <Icon size={22} className={`mb-1 ${isActive ? 'text-white' : ''}`} />
                                                        <span>{tab.label}</span>
                                                    </Link>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                    <div>
                                        <div className=' mx-2 rounded-xl p-1 shadow-2xl shadow-black bg-white grid grid-cols-3 justify-around'>
                                            {mobileTabs.slice(0, -1).map((tab, idx) => {
                                                const Icon = tab.icon;
                                                const isActive = typeof pathname === 'string' && pathname.includes(tab.href);
                                                if (tab.action === 'logout') {
                                                    return (
                                                        <div key={`tab-${idx}`} className="relative px-1">
                                                            {isActive && (
                                                                <motion.span
                                                                    layoutId="mobile-active-tab"
                                                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                                    className="absolute inset-0 bg-[#36A9E1] rounded-lg"
                                                                />
                                                            )}
                                                            <button
                                                                onClick={() => signOut({ callbackUrl: '/' })}
                                                                className={`relative z-10 flex flex-col items-center justify-center py-2 px-4 text-xs ${isActive ? 'text-white' : 'text-gray-700 hover:text-[#36A9E1]'}`}
                                                            >
                                                                <Icon size={22} className={`mb-1 ${isActive ? 'text-white' : ''}`} />
                                                                <span>{tab.label}</span>
                                                            </button>
                                                        </div>
                                                    );
                                                }
                                                return (
                                                    <div key={tab.href} className="relative px-1">
                                                        {isActive && (
                                                            <motion.span
                                                                layoutId="mobile-active-tab"
                                                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                                className="absolute inset-0 bg-[#36A9E1] rounded-lg"
                                                            />
                                                        )}
                                                        <Link
                                                            href={tab.href}
                                                            aria-current={isActive ? 'page' : undefined}
                                                            className={`relative z-10 flex flex-col items-center justify-center py-2 px-4 text-xs ${isActive ? 'text-white' : 'text-gray-700 hover:text-[#36A9E1]'}`}
                                                        >
                                                            <Icon size={22} className={`mb-1 ${isActive ? 'text-white' : ''}`} />
                                                            <span>{tab.label}</span>
                                                        </Link>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}