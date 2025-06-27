"use client"
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { InstagramIcon, YoutubeIcon, LinkedinIcon, ShoppingBag, TagIcon, Gift, Mail } from "lucide-react";
export default function Menu() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openSubmenus, setOpenSubmenus] = useState({});
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };
    // Dynamic menu data from JSON
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
            // {
            //      label: "Recomendaciones",
            //      href: "/recomendations"
            //  },
            {
                label: "Contacto",
                href: "/contact",
                icon: Mail
            },
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
                        <Link href={item.href} className="block py-2.5 font-medium text-[#353535] hover:text-[#00B0C8] hover:bg-gray-50 px-4 rounded transition-colors uppercase flex items-center">
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
            {/* Hamburger icon always visible, not absolute */}
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
            {/* Overlay and Side Menu */}
            {isMenuOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-[#00000080] z-40 pointer-events-auto"
                        onClick={toggleMenu}
                    ></div>
                    <div
                        className="fixed top-0 left-0 w-[90vw] max-w-xs h-full bg-white text-[#333] z-50 transform transition-transform duration-300 ease-in-out translate-x-0 pointer-events-auto shadow-lg"
                    >
                        <div className="p-4 md:p-6 h-full flex flex-col">
                            <div className="flex justify-between items-center mb-4 md:mb-6">
                                <Link href="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
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
                                <ul className="space-y-1">
                                    {renderMenuItems(menuData.items)}
                                </ul>
                            </nav>
                            {/* Social Media Section */}
                            <div className="mt-auto pt-4 md:pt-6 border-t border-gray-200">
                                <div className="flex space-x-4 md:space-x-5 justify-center my-2 md:my-4">
                                    <Link href="https://instagram.com" aria-label="Instagram" className="text-[#333] hover:text-[#00B0C8] transition-colors">
                                        <InstagramIcon size={24} />
                                    </Link>
                                    <Link href="https://youtube.com" aria-label="YouTube" className="text-[#333] hover:text-[#00B0C8] transition-colors">
                                        <YoutubeIcon size={24} />
                                    </Link>
                                    <Link href="https://linkedin.com" aria-label="LinkedIn" className="text-[#333] hover:text-[#00B0C8] transition-colors">
                                        <LinkedinIcon size={24} />
                                    </Link>
                                </div>
                                <p className="text-xs md:text-sm text-center text-gray-500 mt-2">© 2025 Subirana</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
