'use client';

import Link from 'next/link';
import {
    ShoppingBag,
    ClipboardList,
    Users,
    CreditCard,
    GiftIcon,
    Settings,
    CircleUserRound
} from 'lucide-react';
import { useSession } from 'next-auth/react';

// Navigation items configuration with role-based access
const getNavigationItems = (userRole) => [
    {
        href: "/dashboard/account",
        icon: CircleUserRound,
        label: "My Account",
        roles: ['user', 'admin']
    },
    {
        href: "/dashboard/productos",
        icon: ShoppingBag,
        label: "Productos",
        roles: ['admin']
    },
    {
        href: "/dashboard/pedidos",
        icon: ClipboardList,
        label: "Pedidos",
        roles: ['user', 'admin']
    },
    {
        href: "/dashboard/clientes",
        icon: Users,
        label: "Clientes",
        roles: ['admin']
    },
    {
        href: "/dashboard/facturas",
        icon: CreditCard,
        label: "Facturas",
        roles: ['admin']
    },
    {
        href: "/dashboard/listas",
        icon: GiftIcon,
        label: userRole === 'admin' ? "Listas" : "Mi Listas",
        roles: ['user', 'admin']
    },
    {
        href: "/dashboard/configuracion",
        icon: Settings,
        label: "Configuraciones",
        roles: ['admin']
    }
];

export default function Sidebar() {
    const { data: session } = useSession();
    const userRole = session?.user?.role || 'user';
    const navigationItems = getNavigationItems(userRole);

    return (
        <div className="w-64 h-screen bg-white shadow-md sticky">
            <div className="px-4 py-2">
                <nav className="space-y-1">
                    <div className='flex items-center justify-center font-bold text-2xl border-b pb-2 border-gray-200'>
                        <span className="font-medium">Hi! {session?.user.name}</span>
                    </div>

                    {navigationItems.map((item, index) => {
                        // Only show items that the user has permission to see
                        if (!item.roles.includes(userRole)) {
                            return null;
                        }

                        const Icon = item.icon;
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className="flex items-center p-3 text-gray-700 hover:bg-[#00B0C810] hover:text-[#00B0C8] rounded-lg transition-colors"
                            >
                                <Icon className="mr-3 hover:text-[#00B0C8]" size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}