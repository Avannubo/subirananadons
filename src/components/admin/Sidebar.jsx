'use client';
import Link from 'next/link';
import {
    ShoppingBag,
    ClipboardList,
    Users,
    CreditCard,
    GiftIcon,
    Settings,
    CircleUserRound,
    TagIcon,
    Star,
    ChartArea
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { InstagramIcon, YoutubeIcon, LinkedinIcon } from "lucide-react"; 
const getNavigationItems = (userRole) => [
    {
        href: "/dashboard",
        icon: ChartArea,
        label: "Estadísticas",
        roles: ['admin']//'user',
    },
    {
        href: "/dashboard/account",
        icon: CircleUserRound,
        label: "Mi Cuenta",
        roles: ['user', 'admin']
    },
    {
        href: "/dashboard/productos",
        icon: ShoppingBag,
        label: "Productos",
        roles: ['admin']
    },
    {
        href: "/dashboard/featured-products",
        icon: Star,
        label: "Destacados",
        roles: ['admin']
    },
    {
        href: "/dashboard/brands",
        icon: TagIcon,
        label: "Marcas",
        roles: ['admin']
    },
    {
        href: "/dashboard/orders",
        icon: ClipboardList,
        label: userRole === 'admin' ? "Pedidos" : "Mis Pedidos",
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
        label: userRole === 'admin' ? "Listas" : "Mis Listas",
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
        <div className="w-64 h-[80vh] bg-white top-[100px] sticky">
            <div className="px-4 py-2 min-h-[88vh] flex flex-col justify-between">
                <nav className="space-y-1">
                    <div className='flex items-center justify-center font-bold text-2xl border-b pb-2 border-gray-200'>
                        <span className="font-medium">Hola! {session?.user.name}</span>
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
                                className="flex items-center p-3 text-gray-700 hover:bg-[#00B0C810] hover:text-[#00B0C8] rounded-lg transition-colors"
                            >
                                <Icon className="mr-3 hover:text-[#00B0C8]" size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="mt-auto pt-6 border-t border-gray-200">
                    <div className="flex space-x-5 justify-center my-4">
                        <Link href="https://instagram.com" aria-label="Instagram" className="text-[#333] hover:text-[#00B0C8] transition-colors">
                            <InstagramIcon size={28} />
                        </Link>
                        <Link href="https://youtube.com" aria-label="YouTube" className="text-[#333] hover:text-[#00B0C8] transition-colors">
                            <YoutubeIcon size={28} />
                        </Link>
                        <Link href="https://linkedin.com" aria-label="LinkedIn" className="text-[#333] hover:text-[#00B0C8] transition-colors">
                            <LinkedinIcon size={28} />
                        </Link>
                    </div>
                    <p className="text-sm text-center text-gray-500 mt-2">© 2025 Subirana</p>
                </div>
            </div>
        </div>
    );
}