"use client"
import { useState } from 'react';
import Image from 'next/image';
import UserAuth from "@/components/ui/UserAuthModal";

import Link from 'next/link';
import { InstagramIcon, UserRound, Search, ShoppingBag, TagIcon, Gift, Mail } from "lucide-react";
export default function Menu() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [openSubmenus, setOpenSubmenus] = useState({});
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
                label: "Productos",
                href: "/products",
                icon: ShoppingBag
            },
            {
                label: "Marcas",
                href: "/brands",
                icon: TagIcon
            },
            {
                label: "Listas de nacimientos",
                href: "/listas-de-nacimiento",
                icon: Gift
            },
            {
                label: "Contacto",
                href: "/contact",
                icon: Mail
            },
            {
                label: "Buscar",
                href: "/search",
                icon: Search
            },
            {
                label: "Carrito",
                href: "/cart",
                icon: ShoppingBag
            }
        ]
    };
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
                        <Link href={item.href} className="py-2.5 font-medium text-[#353535] hover:text-[#00B0C8] hover:bg-gray-50 px-4 rounded transition-colors uppercase flex items-center">
                            {IconComponent && <IconComponent className="mr-3" size={20} />}
                            {item.label.toUpperCase()}
                        </Link>
                    ) : (
                        <>
                            <button
                                onClick={() => toggleSubmenu(currentPath)}
                                className="w-full text-left py-2.5 text-[#353535] hover:text-[#00B0C8]  px-4 rounded flex justify-between items-center uppercase transition-colors"
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
                    className="w-12 h-12 flex flex-row items-center justify-center md:justify-start space-x-2 focus:outline-none"
                    onClick={toggleMenu}
                    aria-label="Abrir menú"
                >
                    <svg width="34px" height="34px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 6H20M4 12H20M4 18H20" stroke="#353535" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
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
                                    <Image
                                        src="/assets/logo-header.svg"
                                        alt="logo"
                                        width={120}
                                        height={40}
                                        className="w-[100px] md:w-[180px] h-auto mt-2"
                                    />
                                </Link>
                                <button
                                    onClick={toggleMenu}
                                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
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
                            <div className="mt-auto pt-4 md:pt-6 border-t border-gray-200">
                                <div className="flex space-x-2 justify-center my-2 md:my-4">
                                    <Link href="#" className='flex justify-center items-center' >
                                        <InstagramIcon className="w-6 h-6 text-gray-700 hover:text-[#00B0C8] cursor-pointer" />
                                    </Link>
                                    <Link className=" cursor-pointer w-8 h-8" href="#">
                                        <svg className="text-gray-700 hover:text-[#00B0C8]" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M17.6 6.31999C16.8669 5.58141 15.9943 4.99596 15.033 4.59767C14.0716 4.19938 13.0406 3.99622 12 3.99999C10.6089 4.00135 9.24248 4.36819 8.03771 5.06377C6.83294 5.75935 5.83208 6.75926 5.13534 7.96335C4.4386 9.16745 4.07046 10.5335 4.06776 11.9246C4.06507 13.3158 4.42793 14.6832 5.12 15.89L4 20L8.2 18.9C9.35975 19.5452 10.6629 19.8891 11.99 19.9C14.0997 19.9001 16.124 19.0668 17.6222 17.5816C19.1205 16.0965 19.9715 14.0796 19.99 11.97C19.983 10.9173 19.7682 9.87634 19.3581 8.9068C18.948 7.93725 18.3505 7.05819 17.6 6.31999ZM12 18.53C10.8177 18.5308 9.65701 18.213 8.64 17.61L8.4 17.46L5.91 18.12L6.57 15.69L6.41 15.44C5.55925 14.0667 5.24174 12.429 5.51762 10.8372C5.7935 9.24545 6.64361 7.81015 7.9069 6.80322C9.1702 5.79628 10.7589 5.28765 12.3721 5.37368C13.9853 5.4597 15.511 6.13441 16.66 7.26999C17.916 8.49818 18.635 10.1735 18.66 11.93C18.6442 13.6859 17.9355 15.3645 16.6882 16.6006C15.441 17.8366 13.756 18.5301 12 18.53ZM15.61 13.59C15.41 13.49 14.44 13.01 14.26 12.95C14.08 12.89 13.94 12.85 13.81 13.05C13.6144 13.3181 13.404 13.5751 13.18 13.82C13.07 13.96 12.95 13.97 12.75 13.82C11.6097 13.3694 10.6597 12.5394 10.06 11.47C9.85 11.12 10.26 11.14 10.64 10.39C10.6681 10.3359 10.6827 10.2759 10.6827 10.215C10.6827 10.1541 10.6681 10.0941 10.64 10.04C10.64 9.93999 10.19 8.95999 10.03 8.56999C9.87 8.17999 9.71 8.23999 9.58 8.22999H9.19C9.08895 8.23154 8.9894 8.25465 8.898 8.29776C8.8066 8.34087 8.72546 8.403 8.66 8.47999C8.43562 8.69817 8.26061 8.96191 8.14676 9.25343C8.03291 9.54495 7.98287 9.85749 8 10.17C8.0627 10.9181 8.34443 11.6311 8.81 12.22C9.6622 13.4958 10.8301 14.5293 12.2 15.22C12.9185 15.6394 13.7535 15.8148 14.58 15.72C14.8552 15.6654 15.1159 15.5535 15.345 15.3915C15.5742 15.2296 15.7667 15.0212 15.91 14.78C16.0428 14.4856 16.0846 14.1583 16.03 13.84C15.94 13.74 15.81 13.69 15.61 13.59Z" />
                                        </svg>
                                    </Link>
                                </div>
                                <Link href="#" className="block text-gray-700 text-sm hover:text-[#00B0C8] cursor-pointer text-center">Tel: 938 751 567</Link>
                                <p className="text-xs md:text-sm text-center text-gray-400 mt-2">© 2025 Subirana</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
