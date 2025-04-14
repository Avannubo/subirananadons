import Link from 'next/link';
import {
    ShoppingBag,
    ClipboardList,
    Users,
    CreditCard,
    GiftIcon,
    Settings
} from 'lucide-react';
export default async function Sidebar() {
    return (
        <div className=" w-64 h-screen bg-white shadow-md  sticky ">
            <div className="px-4 py-2">
                <nav className="space-y-1 ">
                    <Link href="/dashboard/productos" className="flex items-center p-3 text-gray-700 hover:bg-[#00B0C810] hover:text-[#00B0C8] rounded-lg transition-colors">
                        <ShoppingBag className="mr-3 hover:text-[#00B0C8] " size={20} />
                        <span className="font-medium">Productos</span>
                    </Link>
                    <Link href="/dashboard/pedidos" className="flex items-center p-3 text-gray-700 hover:bg-[#00B0C810] hover:text-[#00B0C8] rounded-lg transition-colors">
                        <ClipboardList className="mr-3 hover:text-[#00B0C8]" size={20} />
                        <span className="font-medium">Pedidos</span>
                    </Link>
                    <Link href="/dashboard/clientes" className="flex items-center p-3 text-gray-700 hover:bg-[#00B0C810] hover:text-[#00B0C8] rounded-lg transition-colors">
                        <Users className="mr-3 hover:text-[#00B0C8]" size={20} />
                        <span className="font-medium">Clientes</span>
                    </Link>
                    <Link href="/dashboard/facturacion" className="flex items-center p-3 text-gray-700 hover:bg-[#00B0C810] hover:text-[#00B0C8] rounded-lg transition-colors">
                        <CreditCard className="mr-3 hover:text-[#00B0C8]" size={20} />
                        <span className="font-medium">Facturación</span>
                    </Link>
                    <Link href="/dashboard/listas" className="flex items-center p-3 text-gray-700 hover:bg-[#00B0C810] hover:text-[#00B0C8] rounded-lg transition-colors">
                        <GiftIcon className="mr-3 hover:text-[#00B0C8]" size={20} />
                        <span className="font-medium">Listas de nacimientos</span>
                    </Link>
                    <Link href="/dashboard/configuracion" className="flex items-center p-3 text-gray-700 hover:bg-[#00B0C810] hover:text-[#00B0C8] rounded-lg transition-colors">
                        <Settings className="mr-3 hover:text-[#00B0C8]" size={20} />
                        <span className="font-medium">Configuraciones</span>
                    </Link>
                </nav>
            </div>
            {/* Optional logout button at bottom */}
            {/* 
            <div className="absolute bottom-8 w-full px-4">
                <LogoutBtn />
            </div> 
            import Link from 'next/link';
            import { auth } from './auth';
            import {
                ShoppingBag,
                ClipboardList,
                Users,
                CreditCard,
                GiftIcon,
                Settings
            } from 'lucide-react';
            export default async function Sidebar() {
                const session = await auth();
                const isAdmin = session?.user?.isAdmin;
                // Admin navigation items
                const adminNavItems = [
                    {
                        href: "/dashboard/productos",
                        icon: <ShoppingBag className="mr-3" size={20} />,
                        label: "Productos"
                    },
                    {
                        href: "/dashboard/pedidos",
                        icon: <ClipboardList className="mr-3" size={20} />,
                        label: "Pedidos"
                    },
                    {
                        href: "/dashboard/clientes",
                        icon: <Users className="mr-3" size={20} />,
                        label: "Clientes"
                    },
                    {
                        href: "/dashboard/facturacion",
                        icon: <CreditCard className="mr-3" size={20} />,
                        label: "Facturación"
                    },
                    {
                        href: "/dashboard/listas",
                        icon: <GiftIcon className="mr-3" size={20} />,
                        label: "Listas de nacimientos"
                    },
                    {
                        href: "/dashboard/configuracion",
                        icon: <Settings className="mr-3" size={20} />,
                        label: "Configuraciones"
                    }
                ];
                // Regular user navigation items
                const userNavItems = [
                    {
                        href: "/dashboard/listas",
                        icon: <GiftIcon className="mr-3" size={20} />,
                        label: "Mis listas"
                    },
                    {
                        href: "/dashboard/pedidos",
                        icon: <ClipboardList className="mr-3" size={20} />,
                        label: "Mis pedidos"
                    },
                    {
                        href: "/dashboard/configuracion",
                        icon: <Settings className="mr-3" size={20} />,
                        label: "Mi cuenta"
                    }
                ];
                const navItems = isAdmin ? adminNavItems : userNavItems;
                return (
                    <div className="w-64 h-screen bg-white shadow-md sticky">
                        <div className="px-4 py-2">
                            <nav className="space-y-1">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex items-center p-3 text-gray-700 hover:bg-[#00B0C810] hover:text-[#00B0C8] rounded-lg transition-colors"
                                    >
                                        {item.icon}
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>
                );
            }
            */}
        </div>
    );
}