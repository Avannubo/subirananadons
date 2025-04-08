"use client"
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

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
                submenu: [
                    {
                        label: "Alimentación",
                        submenu: [
                            { label: "Tronas de viaje" },
                            { label: "Robots de cocina" },
                            { label: "Platos y cubiertos" },
                            { label: "Botellas y vasos" },
                            { label: "Baberos" },
                            { label: "Botes y fiambreras" },
                            { label: "Termos" },
                            { label: "Lactancia" }
                        ]
                    },
                    {
                        label: "Baño",
                        submenu: [
                            { label: "Accesorios baño" },
                            { label: "Kits higiene y cosmética" },
                            { label: "Cajas toallitas" },
                            { label: "Pañales y contenedores pañales" },
                            { label: "Orinales y reductores WC" }
                        ]
                    },
                    {
                        label: "Casa",
                        submenu: [
                            { label: "Intercomunicadores" },
                            { label: "Tronas" },
                            { label: "Barandillas de escalera" },
                            { label: "Hamacas" }
                        ]
                    },
                    {
                        label: "Habitación",
                        submenu: [
                            { label: "Cuna, colecho y moisés" },
                            { label: "Mobiliario" },
                            { label: "Colchones y protectores" },
                            { label: "Téxtil" },
                            { label: "Cambiadores y fundas" },
                            { label: "Luces y decoración" },
                            { label: "Barreras cama" }
                        ]
                    },
                    {
                        label: "Gemelos", href: "#"
                    },
                    {
                        label: "Madres",
                        submenu: [
                            { label: "Ropa embarazo y porteo" },
                            { label: "Sujetadores embarazo i lactancia" },
                            { label: "Basicos embarazo" },
                            { label: "Basicos hospital" }]
                    },
                    {
                        label: "Cochecitos",
                        submenu: [
                            { label: "Sillas de paseo" },
                            { label: "Accesorios cochecito" }
                        ]
                    },
                    {
                        label: "Entretenimientos",
                        submenu: [
                            { label: "Doudous y peluches" },
                            { label: "Botellas sensoriales" },
                            { label: "Alfombras de actividades" },
                            { label: "Bolsa almacenaje" },
                            { label: "Mordedores" },
                            { label: "Varios" }
                        ]
                    },
                    {
                        label: "Salud",
                        submenu: [
                            { label: "Aspirador nasal" },
                            { label: "Termómetros" },
                            { label: "Humidificadores" },
                            { label: "Cojines" },
                            { label: "Cojines cabeza plana" },
                            { label: "Casco antiruido" }
                        ]
                    },
                    {
                        label: "Sillas De Coche",
                        submenu: [
                            { label: "Grupo 0+" },
                            { label: "Grupo 0-1" },
                            { label: "Grupo 0-1 - 2" },
                            { label: "Grupo 0-1 - 2 - 3" },
                            { label: "Grupo 2-3" },
                            { label: "Fundas silla" },
                            { label: "Accesorios coche" }
                        ]
                    },
                    {
                        label: "Otros Productos",
                        submenu: [
                            { label: "Mochilas" },
                            { label: "Fulares y bandoleras" },
                            { label: "Ropa porteo" },
                            { label: "Cunas de viaje" },
                            { label: "Ropa bebé" },
                            { label: "Bolsas maternales" },
                            { label: "Bolsas muda" },
                            { label: "Porta Documentos" },
                            { label: "Mochilas infantiles" },
                            { label: "Arrullos" },
                            { label: "Silla para bici" },
                            { label: "Cambiadores de viaje" }
                        ]
                    }
                ]
            },
            { label: "Marcas", href: "#" },
            {
                label: "Listas de nacimientos", 
            },
            { label: "Contacto", href: "#" },
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
            return (
                <li key={currentPath} className="relative">
                    {!item.submenu ? (
                        <a href={item.href} className="block py-1 font-medium hover:text-[#353535] hover:bg-gray-200 px-2 rounded uppercase">
                            {item.label.toUpperCase()}
                        </a>
                    ) : (
                        <>
                            <button
                                onClick={() => toggleSubmenu(currentPath)}
                                className="w-full text-left py-2 hover:bg-gray-200 px-2 rounded flex justify-between items-center uppercase"
                            >
                                <span className="font-medium">{item.label.toUpperCase()}</span>
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
                                <ul className="pl-4 py-1">
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
        <div className={`absolute ${isMenuOpen ? 'overflow-hidden h-screen' : ''}`}>
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-[#00000080] bg-opacity-60 z-10"
                    onClick={toggleMenu}
                ></div>
            )}

            <header className="bg-white flex justify-between items-center">
                <button
                    className="w-[300px] flex flex-row items-center space-x-2"
                    onClick={toggleMenu}
                >
                    <svg width="34px" height="34px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 6H20M4 12H20M4 18H20" stroke="#353535" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                    <span>MENÚ</span>
                </button>
            </header>

            <div
                className={`fixed top-0 left-0 w-[50vh] h-full bg-white text-[#353535] z-20 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="p-4 py-8 h-full flex flex-col ">
                    <Link href="/" className="flex items-center mb-4">
                    <Image
                        src="/assets/logo-header.svg"
                        alt="logo"
                        width={280}
                        height={150}
                        className="mb-4 mt-6"
                    /></Link>
                    <nav className="flex-1 overflow-y-scroll " style={{ scrollbarWidth: 'none'  }}>
                        <ul className=" ">
                            {renderMenuItems(menuData.items)}
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    );
}
