'use client';
import React from 'react';
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
    LogOut
} from 'lucide-react';
import { useLocale } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
const getNavigationItems = (userRole, locale) => [
    {
        href: "/dashboard/account",
        icon: CircleUserRound,
        label: locale === 'ca' ? "El Meu Compte" : "Mi Cuenta",
        roles: ['user', 'admin']
    },
    {
        href: "/dashboard/productos",
        icon: ShoppingBag,
        label: locale === 'ca' ? "Productes" : "Productos",
        roles: ['admin']
    },
    {
        href: "/dashboard/featured-products",
        icon: Star,
        label: locale === 'ca' ? "Destacats" : "Destacados",
        roles: ['admin']
    },
    {
        href: "/dashboard/brands",
        icon: TagIcon,
        label: locale === 'ca' ? "Marques" : "Marcas",
        roles: ['admin']
    },
    {
        href: "/dashboard/orders",
        icon: ClipboardList,
        label: userRole === 'admin'
            ? (locale === 'ca' ? "Comandes" : "Pedidos")
            : (locale === 'ca' ? "Les Meves Comandes" : "Mis Pedidos"),
        roles: ['user', 'admin']
    },
    {
        href: "/dashboard/clientes",
        icon: Users,
        label: locale === 'ca' ? "Clients" : "Clientes",
        roles: ['admin']
    },
    {
        href: "/dashboard/listas",
        icon: GiftIcon,
        label: userRole === 'admin'
            ? (locale === 'ca' ? "Llistes" : "Listas")
            : (locale === 'ca' ? "Les Meves Llistes" : "Mis Listas"),
        roles: ['user', 'admin']
    },
    {
        href: "/dashboard/configuracion",
        icon: Settings,
        label: locale === 'ca' ? "Configuracions" : "Configuraciones",
        roles: ['admin']
    }
];
export default function Sidebar() {
    const { data: session } = useSession();
    const userRole = session?.user?.role || 'user';
    const defaultLocale = useLocale();
    // Detect browser language and set initial locale
    const [currentLocale, setCurrentLocale] = React.useState(defaultLocale);
    React.useEffect(() => {
        let detectedLocale = 'ca';
        if (typeof window !== 'undefined' && window.navigator) {
            const lang = window.navigator.language || window.navigator.userLanguage;
            if (lang && lang.toLowerCase().startsWith('es')) {
                detectedLocale = 'es';
            }
        }
        setCurrentLocale(detectedLocale);
    }, []);
    const navigationItems = getNavigationItems(userRole, currentLocale);
    return (
        <div className="w-64 h-[80vh] bg-white top-[100px] sticky">
            <div className="px-4 py-2 min-h-[88vh] flex flex-col justify-between">
                <nav className="space-y-1">
                    <div className='flex items-center justify-center font-bold text-2xl border-b pb-2 border-gray-200'>
                        <span className="font-medium">{currentLocale === 'ca' ? 'Hola' : 'Hola'}! {session?.user.name}</span>
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
                                className="flex items-center p-3 text-gray-700 hover:bg-[#00B0C810] hover:text-[#36A9E1] rounded-lg transition-colors"
                            >
                                <Icon className="mr-3 hover:text-[#36A9E1]" size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="mt-auto pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full flex items-center justify-center gap-2 py-2 mb-4 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-[#36A9E1] hover:text-white rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        {currentLocale === 'ca' ? 'Tancar sessió' : 'Cerrar sesión'}
                    </button>
                    <p className="text-sm text-center text-gray-500 mt-2">© 2025 Subirana</p>
                </div>
            </div>
        </div>
    );
}