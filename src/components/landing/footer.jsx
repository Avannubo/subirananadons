"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { InstagramIcon, YoutubeIcon, LinkedinIcon, Phone, Mail, ExternalLink } from "lucide-react";
import { useTranslations } from 'next-intl';
import useShopSocials from '../../lib/useShopSocials';
import useShopParameter from '../../lib/useShopParameter';


export default function Footer() {
    const t = useTranslations('Footer');
    const { socials } = useShopSocials();
    const { value: whatsapp } = useShopParameter('whatsapp');
    const { value: telefono } = useShopParameter('telephone');
    const { value: email } = useShopParameter('email');
    return (
        <footer className="bg-white text-[#333] w-full pt-10 md:pt-20">
            <div className="pt-6 md:pt-10" style={{ boxShadow: "0px -5px 5px -3px rgba(0, 0, 0, 0.1)" }}>
                <div className="container mx-auto px-4 md:px-6 py-8 md:py-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-end items-center justify-center text-center gap-2 md:gap-0">
                        {/* Logo Column */}
                        <div className="flex flex-col items-center md:items-start w-full md:w-auto">
                            <div className="mb-2 w-full flex justify-center md:justify-start">
                                <img
                                    src="/assets/logo-header.svg"
                                    alt="logo"
                                    width={160}
                                    height={60}
                                    className="w-[160px] md:w-[180px] h-auto"
                                />
                            </div>
                            {/* Socials from DB */}
                            <div className="flex justify-center items-center gap-[12px] mt-4 md:mt-2">
                                {/* Socials icons */}
                                {socials && socials.map(({ key, link, Icon, name }) => (
                                    <Link key={key} href={link} aria-label={name} className="text-[#333] hover:text-[#00B0C8] transition-colors cursor-pointer" target="_blank" rel="noopener noreferrer">
                                        <Icon className="h-[25px] w-[25px]" />
                                    </Link>
                                ))}
                                {/* WhatsApp icon */}
                                {whatsapp && (
                                    <Link href={`https://wa.me/${whatsapp}`} aria-label="WhatsApp" className="text-[#333] hover:text-[#00B0C8] transition-colors cursor-pointer" target="_blank" rel="noopener noreferrer">
                                        <svg className="h-[34px] w-[34px] text-gray-700 hover:text-[#00B0C8]" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M17.6 6.31999C16.8669 5.58141 15.9943 4.99596 15.033 4.59767C14.0716 4.19938 13.0406 3.99622 12 3.99999C10.6089 4.00135 9.24248 4.36819 8.03771 5.06377C6.83294 5.75935 5.83208 6.75926 5.13534 7.96335C4.4386 9.16745 4.07046 10.5335 4.06776 11.9246C4.06507 13.3158 4.42793 14.6832 5.12 15.89L4 20L8.2 18.9C9.35975 19.5452 10.6629 19.8891 11.99 19.9C14.0997 19.9001 16.124 19.0668 17.6222 17.5816C19.1205 16.0965 19.9715 14.0796 19.99 11.97C19.983 10.9173 19.7682 9.87634 19.3581 8.9068C18.948 7.93725 18.3505 7.05819 17.6 6.31999ZM12 18.53C10.8177 18.5308 9.65701 18.213 8.64 17.61L8.4 17.46L5.91 18.12L6.57 15.69L6.41 15.44C5.55925 14.0667 5.24174 12.429 5.51762 10.8372C5.7935 9.24545 6.64361 7.81015 7.9069 6.80322C9.1702 5.79628 10.7589 5.28765 12.3721 5.37368C13.9853 5.4597 15.511 6.13441 16.66 7.26999C17.916 8.49818 18.635 10.1735 18.66 11.93C18.6442 13.6859 17.9355 15.3645 16.6882 16.6006C15.441 17.8366 13.756 18.5301 12 18.53ZM15.61 13.59C15.41 13.49 14.44 13.01 14.26 12.95C14.08 12.89 13.94 12.85 13.81 13.05C13.6144 13.3181 13.404 13.5751 13.18 13.82C13.07 13.96 12.95 13.97 12.75 13.82C11.6097 13.3694 10.6597 12.5394 10.06 11.47C9.85 11.12 10.26 11.14 10.64 10.39C10.6681 10.3359 10.6827 10.2759 10.6827 10.215C10.6827 10.1541 10.6681 10.0941 10.64 10.04C10.64 9.93999 10.19 8.95999 10.03 8.56999C9.87 8.17999 9.71 8.23999 9.58 8.22999H9.19C9.08895 8.23154 8.9894 8.25465 8.898 8.29776C8.8066 8.34087 8.72546 8.403 8.66 8.47999C8.43562 8.69817 8.26061 8.96191 8.14676 9.25343C8.03291 9.54495 7.98287 9.85749 8 10.17C8.0627 10.9181 8.34443 11.6311 8.81 12.22C9.6622 13.4958 10.8301 14.5293 12.2 15.22C12.9185 15.6394 13.7535 15.8148 14.58 15.72C14.8552 15.6654 15.1159 15.5535 15.345 15.3915C15.5742 15.2296 15.7667 15.0212 15.91 14.78C16.0428 14.4856 16.0846 14.1583 16.03 13.84C15.94 13.74 15.81 13.69 15.61 13.59Z" />
                                        </svg>
                                    </Link>
                                )}
                                {/* Teléfono icon */}
                                {telefono && (
                                    <a href={`tel:${telefono}`} aria-label="Teléfono" className="text-[#333] hover:text-[#00B0C8] transition-colors cursor-pointer">
                                        <Phone className="h-[25px] w-[25px]" />
                                    </a>
                                )}
                                {/* Email icon */}
                                {email && (
                                    <Link href={`mailto:${email}`} aria-label="Email" className="text-[#333] ml-1 mt-[1px] hover:text-[#00B0C8] transition-colors cursor-pointer">
                                        <Mail className="h-[25px] w-[25px]" />
                                    </Link>
                                )}
                            </div>

                            <p className="text-xs md:text-sm mt-4 text-center md:text-left">{t('copyright')}</p>

                            <div className="w-full flex justify-center md:justify-start">
                                <Link
                                    href="https://avannubo.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center md:justify-start mt-2 space-x-2"
                                >
                                    <span className="text-xs md:text-sm text-center md:text-left transition-colors cursor-pointer">
                                        Powered by:
                                    </span>
                                    <img
                                        src="/assets/images/Avan.png"
                                        alt="footer logo"
                                        width={120}
                                        height={60}
                                    />
                                </Link>
                            </div>
                        </div>
                        <div className="hidden md:flex flex-col justify-end items-center md:items-end w-full md:w-[240px] mt-6 md:mt-0">
                            <img
                                src="/assets/images/pago.png"
                                alt="footer logo"
                                width={320}
                                height={60}
                            />
                        </div>
                        {/* Middle Links Column */}
                        <div className="flex flex-row justify-center md:justify-end items-center w-full md:w-auto mt-6 md:mt-0">
                            <ul className="space-y-2 md:space-y-2 text-center md:text-left w-full">
                                <li><Link href="/terms" className="hover:text-[#00B0C8] font-medium transition-colors cursor-pointer">{t('terms')}</Link></li>
                                <li><Link href="/privacy" className="hover:text-[#00B0C8] font-medium transition-colors cursor-pointer">{t('privacy')}</Link></li>
                                <li><Link href="/cookies" className="hover:text-[#00B0C8] font-medium transition-colors cursor-pointer">{t('cookies')}</Link></li>
                                <li><Link href="/legal" className="hover:text-[#00B0C8] font-medium transition-colors cursor-pointer">{t('legal')}</Link></li>
                            </ul>
                        </div>
                        <div className="md:hidden flex flex-col justify-end items-center md:items-end w-full md:w-[240px] mt-6 md:mt-0">
                            <img
                                src="/assets/images/pago.png"
                                alt="footer logo"
                                width={320}
                                height={60}
                            />
                        </div>
                        {/* Right Links & Contact Column */}
                        {/* <div className="flex flex-col items-center md:items-end">
                            <ul className="space-y-2 md:space-y-3 w-full text-center md:text-right">
                                <li className="flex items-center justify-center md:justify-end gap-2">
                                    <Phone size={18} className="text-[#00B0C8]" />
                                    <span className="hover:text-[#00B0C8] transition-colors cursor-pointer">{t('phone')}</span>
                                </li>
                                <li className="flex items-center justify-center md:justify-end gap-2 mt-2 md:mt-4">
                                    <Mail size={18} className="text-[#00B0C8]" />
                                    <Link href="mailto:info@example.com" className="hover:text-[#00B0C8] transition-colors cursor-pointer">{t('email')}</Link>
                                </li>
                                <li className="flex items-center justify-center md:justify-end gap-2 mt-2 md:mt-4">
                                    <ExternalLink size={18} className="text-[#00B0C8]" />
                                    <Link href="/contact" className="hover:text-[#00B0C8] transition-colors cursor-pointer">{t('contact')}</Link>
                                </li>
                            </ul>
                        </div> */}
                    </div>
                </div>
            </div>
        </footer>
    );
}