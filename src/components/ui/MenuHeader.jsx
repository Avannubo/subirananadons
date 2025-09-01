"use client"
import { useState } from 'react';
import Image from 'next/image';
import UserAuth from "@/components/ui/UserAuthModal";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { InstagramIcon, UserRound, Search, ShoppingBag, TagIcon, Gift, Mail, ShoppingCart } from "lucide-react";
import useShopSocials from "@/lib/useShopSocials";
import useShopParameter from "@/lib/useShopParameter";
import { useTranslations } from 'next-intl';
export default function Menu() {
    const t = useTranslations('Menu');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [openSubmenus, setOpenSubmenus] = useState({});
    const { socials } = useShopSocials();
    const { value: shopPhone } = useShopParameter('telephone');
    // Handles swipe animation for open/close
    // menuVisible keeps the menu mounted for animation
    const openMenu = () => {
        setMenuVisible(true);
        setTimeout(() => setIsMenuOpen(true), 10); // allow for CSS transition
    };
    const closeMenu = () => {
        setIsMenuOpen(false);
        setTimeout(() => setMenuVisible(false), 300); // match transition duration
    };
    const toggleMenu = () => {
        if (!menuVisible && !isMenuOpen) {
            openMenu();
        } else {
            closeMenu();
        }
    };
    const menuData = {
        logo: "/assets/logo-header.svg",
        items: [
            {
                label: t('products'),
                href: "/products",
                icon: ShoppingBag
            },
            {
                label: t('brands'),
                href: "/brands",
                icon: TagIcon
            },
            {
                label: t('birthlists'),
                href: "/listas-de-nacimiento",
                icon: Gift
            },
            {
                label: t('contact'),
                href: "/contact",
                icon: Mail
            },
            {
                label: t('search'),
                href: "/search",
                icon: Search
            },
            {
                label: t('cart'),
                href: "/cart",
                icon: ShoppingCart
            }
        ]
    };
    const pathname = usePathname();
    // Locale switcher component (only for localized routes)
    const locales = [
        { code: 'ca', label: 'CA' },
        { code: 'es', label: 'ES' }
    ];
    // Only show switcher if route is localized
    const currentLocale = /^\/(ca|es)(\/|$)/.test(pathname) ? pathname.split('/')[1] : null;
    const toggleSubmenu = (path) => {
        setOpenSubmenus(prev => ({
            ...prev,
            [path]: !prev[path]
        }));
    };
    const renderMenuItems = (items, parentPath = '') => {
        return items.map((item, index) => {
            const currentPath = parentPath ? `${parentPath}.${index}` : `${index}`;
            const IconComponent = item.icon;
            return (
                <li key={currentPath} className="relative">
                    {!item.submenu ? (
                        <Link href={item.href} className="py-2.5 font-medium text-[#353535] hover:text-[#36A9E1] hover:bg-gray-50 px-4 rounded transition-colors uppercase flex items-center">
                            {IconComponent && <IconComponent className="mr-3" size={20} />}
                            {item.label.toUpperCase()}
                        </Link>
                    ) : (
                        <>
                            <button
                                onClick={() => toggleSubmenu(currentPath)}
                                className="w-full text-left py-2.5 text-[#353535] hover:text-[#36A9E1]  px-4 rounded flex justify-between items-center uppercase transition-colors"
                            >
                                <div className="flex items-center">
                                    {IconComponent && <IconComponent className="mr-3" size={20} />}
                                    <span className="font-medium">{item.label.toUpperCase()}</span>
                                </div>
                                <svg
                                    className={`w-4 h-4 transition-transform ${openSubmenus[currentPath] ? 'rotate-90' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                            {openSubmenus[currentPath] && (
                                <ul className="pl-6 py-1">
                                    {renderMenuItems(item.submenu, currentPath)}
                                </ul>
                            )}
                        </>
                    )}
                </li>
            );
        });
    };
    return (
        <div className="relative">
            <header className="bg-white flex justify-between items-center">
                <button
                    className="w-12 h-12 flex flex-row items-center justify-center md:justify-start space-x-2 focus:outline-none cursor-pointer"
                    onClick={toggleMenu}
                    aria-label="Abrir menú"
                >
                    <svg
                        width="34px"
                        height="34px"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-gray-700 hover:text-[#36A9E1] transition-colors duration-200"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M4 6H20M4 12H20M4 18H20"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </header>
            {menuVisible && (
                <>
                    <div
                        className="fixed inset-0 bg-[#00000080] z-40 pointer-events-auto"
                        onClick={toggleMenu}
                    ></div>
                    <div
                        className={`fixed top-0 left-0 w-[90vw] max-w-xs h-full bg-white text-[#333] z-50 transform transition-transform duration-300 ease-in-out pointer-events-auto shadow-lg ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                    >
                        <div className="p-4 md:p-6 h-full flex flex-col">
                            <div className="flex justify-between items-center mb-4 md:mb-6">
                                <Link href="/" className="flex items-center" onClick={closeMenu}>
                                    <img
                                        src="/assets/logo-header.svg"
                                        alt="logo"
                                        width={120}
                                        height={40}
                                        className="w-[100px] md:w-[180px] h-auto mt-2"
                                    />
                                </Link>
                                <button
                                    onClick={toggleMenu}
                                    className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                                    aria-label="Cerrar menú"
                                >
                                    <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M18 6L6 18M6 6l12 12" stroke="#353535" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                    </svg>
                                </button>
                            </div>
                            <nav className="flex-1 overflow-y-auto scrollbar-hide">
                                <ul className="space-y-1 ">
                                    {renderMenuItems(menuData.items)}
                                    <UserAuth title="perfil" />
                                </ul>
                            </nav>
                            <div className="flex flex-col justify-center mt-auto pt-4 md:pt-6 border-t border-gray-200">
                                <div className='sm:hidden justify-center items-center flex space-x-2 mb-4'>
                                    {currentLocale && (
                                        <div className="flex items-center space-x-1">
                                            {locales.map(locale => (
                                                <a
                                                    key={locale.code}
                                                    href={pathname.replace(/^\/(ca|es)/, `/${locale.code}`)}
                                                    className={`px-2 py-1 rounded text-xs font-bold border transition-colors ${currentLocale === locale.code ? 'bg-[#36A9E1] text-white border-[#36A9E1]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                                                    aria-current={currentLocale === locale.code ? 'page' : undefined}
                                                >
                                                    {locale.label}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {/* <div className="flex space-x-2 justify-center my-2 md:my-4">
                                    {socials.map((social) => {
                                        const Icon = social.Icon;
                                        return (
                                            <Link key={social.key} target="_blank" href={social.link} aria-label={social.name} className="flex justify-center items-center text-gray-700 hover:text-[#36A9E1] cursor-pointer" rel="noopener noreferrer">
                                                <Icon className="w-6 h-6" />
                                            </Link>
                                        );
                                    })}
                                </div> */}
                                <Link href={`tel:${shopPhone || '938751567'}`} className="block text-gray-700 text-sm hover:text-[#36A9E1] cursor-pointer text-center">
                                    Tel: {shopPhone || '938 751 567'}
                                </Link>
                                <p className="text-xs md:text-sm text-center text-gray-400 mt-2">© 2025 Subirana</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
