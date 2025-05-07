import Image from "next/image";
import Link from "next/link";
import { InstagramIcon, YoutubeIcon, LinkedinIcon, Phone, Mail, ExternalLink } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-white text-[#333] w-full pt-20" >
            <div className="pt-10" style={{ boxShadow: "0px -10px 15px -3px rgba(0, 0, 0, 0.1)" }}>
                <div className="container mx-auto px-6 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mx-auto">
                        {/* Logo Column */}
                        <div className="flex flex-col">
                            <div className="mb-6">
                                <Image
                                    src="/assets/logo-header.svg"
                                    alt="logo"
                                    width={200}
                                    height={60}
                                    className="w-[550px]"
                                />
                            </div>

                            <div className="flex space-x-4 mt-6">
                                <Link href="https://instagram.com" aria-label="Instagram" className="text-[#333] hover:text-[#00B0C8] transition-colors cursor-pointer">
                                    <InstagramIcon size={34} />
                                </Link>
                                <Link href="https://youtube.com" aria-label="YouTube" className="text-[#333] hover:text-[#00B0C8] transition-colors cursor-pointer">
                                    <YoutubeIcon size={34} />
                                </Link>
                                <Link href="https://linkedin.com" aria-label="LinkedIn" className="text-[#333] hover:text-[#00B0C8] transition-colors cursor-pointer">
                                    <LinkedinIcon size={34} />
                                </Link>
                            </div>
                            <p className="text-sm mt-4">Copyright © 2025 Subirana</p>
                        </div>

                        {/* Middle Links Column */}
                        <div className="flex flex-row justify-center">
                            <ul className="space-y-3">
                                <li><Link href="/privacy" className="hover:text-[#00B0C8] transition-colors cursor-pointer">POLÍTICA DE PRIVACIDAD</Link></li>
                                <li><Link href="/cookies" className="hover:text-[#00B0C8] transition-colors cursor-pointer">POLÍTICA DE COOKIES</Link></li>
                                <li><Link href="/legal" className="hover:text-[#00B0C8] transition-colors cursor-pointer">AVISO LEGAL</Link></li>
                            </ul>
                        </div>

                        {/* Right Links & Contact Column */}
                        <div className=" ">
                            <p className="mb-4">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
                            <ul className="space-y-3 mt-6">
                                <li className="flex items-center gap-2">
                                    <Phone size={18} className="text-[#00B0C8]" />
                                    <span className="hover:text-[#00B0C8] transition-colors cursor-pointer">+34 93 243 25 10</span>
                                </li>
                                <li className="flex items-center gap-2 mt-4">
                                    <Mail size={18} className="text-[#00B0C8]" />
                                    <Link href="mailto:info@example.com" className="hover:text-[#00B0C8] transition-colors cursor-pointer">info@example.com</Link>
                                </li>
                                <li className="flex items-center gap-2 mt-4">
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