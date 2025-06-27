import Image from "next/image";
import Link from "next/link";
import { InstagramIcon, YoutubeIcon, LinkedinIcon, Phone, Mail, ExternalLink } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-white text-[#333] w-full pt-10 md:pt-20">
            <div className="pt-6 md:pt-10" style={{ boxShadow: "0px -10px 15px -3px rgba(0, 0, 0, 0.1)" }}>
                <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
                    <div className="grid grid-cols-1 gap-10 md:gap-12 md:grid-cols-3 mx-auto">
                        {/* Logo Column */}
                        <div className="flex flex-col items-center md:items-start">
                            <div className="mb-4 md:mb-6 w-full flex justify-center md:justify-start">
                                <Image
                                    src="/assets/logo-header.svg"
                                    alt="logo"
                                    width={160}
                                    height={60}
                                    className="w-[160px] md:w-[200px] h-auto"
                                />
                            </div>
                            <div className="flex space-x-4 mt-4 md:mt-6 justify-center md:justify-start">
                                <Link href="https://instagram.com" aria-label="Instagram" className="text-[#333] hover:text-[#00B0C8] transition-colors cursor-pointer">
                                    <InstagramIcon size={28} />
                                </Link>
                                <Link href="https://youtube.com" aria-label="YouTube" className="text-[#333] hover:text-[#00B0C8] transition-colors cursor-pointer">
                                    <YoutubeIcon size={28} />
                                </Link>
                                <Link href="https://linkedin.com" aria-label="LinkedIn" className="text-[#333] hover:text-[#00B0C8] transition-colors cursor-pointer">
                                    <LinkedinIcon size={28} />
                                </Link>
                            </div>
                            <p className="text-xs md:text-sm mt-4 text-center md:text-left">Copyright © 2025 Subirana</p>
                        </div>
                        {/* Middle Links Column */}
                        <div className="flex flex-row justify-center items-center">
                            <ul className="space-y-2 md:space-y-3 text-center md:text-left">
                                <li><Link href="/privacy" className="hover:text-[#00B0C8] transition-colors cursor-pointer">POLÍTICA DE PRIVACIDAD</Link></li>
                                <li><Link href="/cookies" className="hover:text-[#00B0C8] transition-colors cursor-pointer">POLÍTICA DE COOKIES</Link></li>
                                <li><Link href="/legal" className="hover:text-[#00B0C8] transition-colors cursor-pointer">AVISO LEGAL</Link></li>
                            </ul>
                        </div>
                        {/* Right Links & Contact Column */}
                        <div className="flex flex-col items-center md:items-end">
                            <ul className="space-y-2 md:space-y-3 w-full text-center md:text-right">
                                <li className="flex items-center justify-center md:justify-end gap-2">
                                    <Phone size={18} className="text-[#00B0C8]" />
                                    <span className="hover:text-[#00B0C8] transition-colors cursor-pointer">+34 93 243 25 10</span>
                                </li>
                                <li className="flex items-center justify-center md:justify-end gap-2 mt-2 md:mt-4">
                                    <Mail size={18} className="text-[#00B0C8]" />
                                    <Link href="mailto:info@example.com" className="hover:text-[#00B0C8] transition-colors cursor-pointer">info@example.com</Link>
                                </li>
                                <li className="flex items-center justify-center md:justify-end gap-2 mt-2 md:mt-4">
                                    <ExternalLink size={18} className="text-[#00B0C8]" />
                                    <Link href="/contact" className="hover:text-[#00B0C8] transition-colors cursor-pointer">PONTE EN CONTACTO</Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}