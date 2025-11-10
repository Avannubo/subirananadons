"use client";
import { useState, useEffect } from "react";
import ShopLayout from "@/components/Layouts/shop-layout";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
export default function ContactPage() {
    const t = useTranslations('ContactPage');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [bannerImage, setBannerImage] = useState(null);
    const [shopParams, setShopParams] = useState({ address: '', telephone: '', email: '', horari: '', googleMapsSrc: '' });
    const [submitStatus, setSubmitStatus] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus("");
        if (!acceptTerms) {
            setSubmitStatus("error");
            return;
        }
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (!res.ok) throw new Error("No se pudo enviar el mensaje");
            setSubmitStatus("success");
            setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
            setAcceptTerms(false);
        } catch (err) {
            setSubmitStatus("error");
        }
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const res = await fetch('/api/portimg/active');
                if (!res.ok) throw new Error('Failed to fetch banner');
                const data = await res.json();
                if (data && (data.image || data.imageUrl)) {
                    setBannerImage(data.image || data.imageUrl);
                }
            } catch (err) {
                setBannerImage(null);
            }
        };
        fetchBanner();
        // Fetch shop parameters
        const fetchParams = async () => {
            try {
                const res = await fetch('/api/shop-parameters');
                if (!res.ok) throw new Error('Failed to fetch shop parameters');
                const params = await res.json();
                const paramMap = {};
                params.forEach(p => {
                    paramMap[p.key] = p.value;
                });
                setShopParams({
                    address: paramMap.address || '',
                    telephone: paramMap.telephone || '',
                    email: paramMap.email || '',
                    horari: paramMap.horari || '',
                    googleMapsSrc: paramMap.googleMapsSrc || ''
                });
            } catch (err) {
                setShopParams({ address: '', telephone: '', email: '', horari: '', googleMapsSrc: '' });
            }
        };
        fetchParams();
    }, []);
    return (
        <ShopLayout>
            {/* Hero Section */}
            {bannerImage ? (
                <div className="relative w-full mt-10 h-[30vw] min-h-[120px] max-h-[180px] sm:h-[40vh] flex flex-col justify-center items-center rounded-b-2xl overflow-hidden shadow-md">
                    <img
                        src={bannerImage}
                        alt="banner"
                        fill
                        className="object-cover"
                        priority
                    />
                    {/* Overlay for contrast */}
                    <div className="absolute inset-0 bg-white/70 z-10 pointer-events-none" />
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                        <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-800 shadow-amber-50 mt-8 lg:mt-20 drop-shadow-lg">{t('title')}</h1>
                    </div>
                </div>
            ) : (
                <div className="w-full mt-10 h-[30vw] min-h-[120px] max-h-[180px] sm:h-[40vh] flex flex-col justify-center items-center rounded-b-2xl bg-white">
                    <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-800 mt-8 lg:mt-20">{t('title')}</h1>
                </div>
            )}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Contact Information */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        <div>
                            <h2 className="text-2xl font-bold mb-6">{t('infoTitle')}</h2>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-4">
                                    <div className="w-8 h-8 rounded-full bg-[#36A9E1] flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg mb-1">{t('addressTitle')}</h3>
                                        <p className="text-gray-600">{shopParams.address}</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="w-8 h-8 rounded-full bg-[#36A9E1] flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg mb-1">{t('phoneTitle')}</h3>
                                        <p className="text-gray-600">{shopParams.telephone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="w-8 h-8 rounded-full bg-[#36A9E1] flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg mb-1">{t('emailTitle')}</h3>
                                        <p className="text-gray-600">{shopParams.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="w-8 h-8 rounded-full bg-[#36A9E1] flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg mb-1">{t('hoursTitle')}</h3>
                                        <p className="text-gray-600 whitespace-pre-line">{shopParams.horari}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Map */}
                        <div className="h-[300px] bg-gray-100 rounded-lg overflow-hidden">
                            {shopParams.googleMapsSrc ? (
                                <iframe
                                    src={shopParams.googleMapsSrc}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                ></iframe>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">Mapa no configurado</div>
                            )}
                        </div>
                    </motion.div>
                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-lg shadow-lg p-8"
                    >
                        <h2 className="text-2xl font-bold mb-6">{t('formTitle')}</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {submitStatus === 'success' && (
                                <div className="text-green-600 font-semibold mb-2">{t('successMessage', { default: 'Mensaje enviado correctamente.' })}</div>
                            )}
                            {submitStatus === 'error' && (
                                <div className="text-red-600 font-semibold mb-2">{t('errorMessage', { default: 'No se pudo enviar el mensaje. Inténtalo de nuevo.' })}</div>
                            )}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('nameLabel')}
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#36A9E1] focus:border-[#36A9E1] outline-none transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('emailLabel')}
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#36A9E1] focus:border-[#36A9E1] outline-none transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('phoneLabel')}
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#36A9E1] focus:border-[#36A9E1] outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('subjectLabel')}
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#36A9E1] focus:border-[#36A9E1] outline-none transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('messageLabel')}
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#36A9E1] focus:border-[#36A9E1] outline-none transition-colors"
                                    required
                                ></textarea>
                            </div>
                            <div className="flex items-start mb-2">
                                <input
                                    type="checkbox"
                                    id="acceptTerms"
                                    checked={acceptTerms}
                                    onChange={e => setAcceptTerms(e.target.checked)}
                                    className="mt-1 mr-2"
                                    required
                                />
                                <label htmlFor="acceptTerms" className="text-sm text-gray-700 select-none">
                                    {t('acceptTermsText', {
                                        default: 'He llegit i accepto els '
                                    })}
                                    <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline text-[#36A9E1] mx-1">{t('termsLabel', {default: 'Termes i Condicions'})}</a>
                                    {t('andText', {default: ' i la '})}
                                    <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline text-[#36A9E1] mx-1">{t('privacyLabel', {default: 'Política de Privacitat'})}</a>
                                </label>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-[#36A9E1] text-white py-3 px-6 rounded-md hover:bg-[#3f93ba] transition-colors duration-300"
                            >
                                {t('submitButton')}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </ShopLayout>
    );
}