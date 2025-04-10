"use client"; 
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import LogoutBtn from "../ui/LogoutBtn";

export default function Header() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => setDropdownOpen((prev) => !prev);

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setDropdownOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header className="px-8 py-2 bg-gray-50 border-b border-gray-300 top-0 fixed w-full z-50">
            <div className="flex items-center justify-between">
                <Link href={"/"} className="flex items-center">
                    <Image
                        src="/assets/logo-header.svg"
                        alt="User Avatar"
                        width={240}
                        height={40}
                        className=""
                        onClick={toggleDropdown}
                    />
                </Link>
                <div className="relative" ref={dropdownRef}>
                    <Image
                        src="/assets/images/screenshot_3.png"
                        alt="User Avatar"
                        width={240}
                        height={240}
                        className="w-10 h-10 rounded-full object-cover cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={toggleDropdown}
                        tabIndex={0}
                    />
                    {dropdownOpen && (
                        <div
                            className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg"
                        >
                            <ul className="py-1">
                                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Profile</li>
                                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Settings</li>
                                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer"><LogoutBtn /></li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
