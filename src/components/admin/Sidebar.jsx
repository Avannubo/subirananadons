'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
    ShoppingBag,
    ClipboardList,
    Users,
    GiftIcon,
    Settings,
    CircleUserRound,
    TagIcon,
    Star,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Menu
} from 'lucide-react';
import { useLocale } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
export default function Sidebar() {
    const { data: session } = useSession();
    const userRole = session?.user?.role || 'user';
    // Detect browser language (ca or es) for dashboard labels
    const getBrowserLang = () => {
        if (typeof window === 'undefined') return 'es';
        const nav = window.navigator.language || window.navigator.userLanguage || 'es';
        return nav.split('-')[0] === 'ca' ? 'ca' : 'es';
    };
    const lang = getBrowserLang();
    // Sidebar is collapsed by default on desktop
    // Persist sidebar state across page navigation
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = window.localStorage.getItem('sidebarCollapsed');
            return stored === null ? true : stored === 'true';
        }
        return true;
    });
    const isSidebarCollapsed = isCollapsed;
    // Build navigation items using browser language
    const navigationItems = [
        {
            href: "/dashboard/account",
            icon: CircleUserRound,
            label: lang === 'ca' ? 'El Meu Compte' : 'Mi Cuenta',
            roles: ['user', 'admin']
        },
        {
            href: "/dashboard/productos",
            icon: ShoppingBag,
            label: lang === 'ca' ? 'Productes' : 'Productos',
            roles: ['admin']
        },
        {
            href: "/dashboard/featured-products",
            icon: Star,
            label: lang === 'ca' ? 'Destacats' : 'Destacados',
            roles: ['admin']
        },
        {
            href: "/dashboard/brands",
            icon: TagIcon,
            label: lang === 'ca' ? 'Marques' : 'Marcas',
            roles: ['admin']
        },
        {
            href: "/dashboard/orders",
            icon: ClipboardList,
            label: userRole === 'admin'
                ? (lang === 'ca' ? 'Comandes' : 'Pedidos')
                : (lang === 'ca' ? 'Les Meves Comandes' : 'Mis Pedidos'),
            roles: ['user', 'admin']
        },
        {
            href: "/dashboard/clientes",
            icon: Users,
            label: lang === 'ca' ? 'Clients' : 'Clientes',
            roles: ['admin']
        },
        {
            href: "/dashboard/listas",
            icon: GiftIcon,
            label: userRole === 'admin'
                ? (lang === 'ca' ? 'Llistes' : 'Listas')
                : (lang === 'ca' ? 'Les Meves Llistes' : 'Mis Listas'),
            roles: ['user', 'admin']
        },
        {
            href: "/dashboard/configuracion",
            icon: Settings,
            label: lang === 'ca' ? 'Configuracions' : 'Configuraciones',
            roles: ['admin']
        }
    ];
    // Save collapse state to localStorage on change
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('sidebarCollapsed', isCollapsed ? 'true' : 'false');
        }
    }, [isCollapsed]);
    const sidebarClasses = `
        ${isSidebarCollapsed ? 'w-20' : 'w-64'}
        hidden md:block md:sticky
        top-[100px] h-[80vh]
        bg-white transition-all duration-300 ease-in-out z-50
    `;
    return (
        <>
            {/* Sidebar for desktop */}
            <div className={sidebarClasses}>
                <div className="px-4 py-2 min-h-[88vh] flex flex-col justify-between relative">
                    {/* Collapse Button only on desktop */}
                    <button
                        onClick={() => setIsCollapsed(prev => !prev)}
                        className="hidden md:flex absolute -right-4 top-4 p-1 bg-white rounded-full shadow-md"
                    >
                        {isSidebarCollapsed ? (
                            <ChevronRight size={20} className="text-gray-700" />
                        ) : (
                            <ChevronLeft size={20} className="text-gray-700" />
                        )}
                    </button>
                    <nav className="space-y-1">
                        <div className={`flex items-center justify-center font-bold text-2xl border-b pb-2 border-gray-200 ${isSidebarCollapsed ? 'text-sm' : ''}`}>
                            <span className="font-medium truncate">
                                {isSidebarCollapsed ? (
                                    <div className='p-6 bg-[#36A9E1] text-white rounded-full flex items-center uppercase font-bold text-lg justify-center h-10 w-10'>
                                        {session?.user.name?.charAt(0) || '!'}
                                    </div>
                                ) : (
                                    `${lang === 'ca' ? 'Hola' : 'Hola'}! ${session?.user.name?.split(' ')[0] || ''}`
                                )}
                            </span>
                        </div>
                        {navigationItems.map((item, index) => {
                            if (!item.roles.includes(userRole)) {
                                return null;
                            }
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className={`flex items-center p-3 text-gray-700 hover:bg-[#00B0C810] hover:text-[#36A9E1] rounded-lg transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`}
                                >
                                    <Icon className={`${isSidebarCollapsed ? 'mr-0' : 'mr-3'} hover:text-[#36A9E1]`} size={20} />
                                    {!isSidebarCollapsed && <span className="font-medium">{item.label}</span>}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="mt-auto pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-center gap-2'} py-2 mb-4 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-[#36A9E1] hover:text-white rounded-lg transition-colors`}
                        >
                            <LogOut size={20} />
                            {!isSidebarCollapsed && (lang === 'ca' ? 'Tancar sessió' : 'Cerrar sesión')}
                        </button>
                        {!isSidebarCollapsed && <p className="text-sm text-center text-gray-500 mt-2">© 2025 Subirana</p>}
                    </div>
                </div>
            </div>
        </>
    );
}