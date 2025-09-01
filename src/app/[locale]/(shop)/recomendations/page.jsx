'use client';
import { useState, useEffect } from 'react';
import ShopLayout from "@/components/Layouts/shop-layout";
import { motion } from 'framer-motion';
import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from 'next-intl';
export default function RecommendationsPage() {
    const t = useTranslations('RecommendationsPage');
    const locale = useLocale();
    const [groups, setGroups] = useState([]);
    const [bannerUrl, setBannerImage] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const res = await fetch('/api/portimg/active');
                if (!res.ok) throw new Error('Failed to fetch banner');
                const data = await res.json();
                if (data && data.imageUrl) {
                    setBannerImage(data.imageUrl);
                }
            } catch (err) {
                console.error('Error fetching banner:', err);
            }
        };
        fetchBanner();
    }, []);
    useEffect(() => {
        const fetchGroups = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/admin/recommendations', { cache: 'no-store' });
                if (!res.ok) throw new Error('Failed to fetch recommendations');
                const data = await res.json();
                setGroups(data.containers || []);
                console.log("Fetched recommendation groups:", data.containers);
            } catch (err) {
                setGroups([]);
            } finally {
                setLoading(false);
            }
        };
        fetchGroups();
    }, []);
    return (
        <ShopLayout>
            {bannerUrl ? (
                <div className="relative w-full mt-10 h-[30vw] min-h-[120px] max-h-[180px] sm:h-[40vh] flex flex-col justify-center items-center rounded-b-2xl overflow-hidden shadow-md">
                    <img
                        src={bannerUrl}
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
            <div className="container mx-auto px-4 py-8">
                {loading ? (
                    <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, idx) => (
                            <li key={idx} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
                                <ul className="space-y-2 mt-2">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <li key={i} className="h-4 bg-gray-100 rounded w-3/4"></li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                ) : groups.length === 0 ? (
                    <div className="text-center text-gray-400">{t('noRecommendations')}</div>
                ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                        {groups.map((container) => (
                            <motion.div
                                key={container._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="break-inside-avoid-column mb-4"
                            >
                                <div className="bg-white rounded-lg shadow-md p-6 h-fit">
                                    <h2 className="text-xl font-bold mb-4 text-gray-800">
                                        {container.title?.[locale] || ''}
                                    </h2>
                                    {container.groups && container.groups.length > 0 && (
                                        <ul className="space-y-2">
                                            {container.groups.map((g, gidx) => (
                                                <motion.li
                                                    key={g._id || gidx}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: gidx * 0.05 }}
                                                    className="text-gray-600 transition-colors"
                                                >
                                                    <span className="font-medium">
                                                        {g.groupTitle?.[locale] || g.groupTitle?.ca || g.groupTitle?.es || ''}
                                                    </span>
                                                    {g.category && g.category._id && (
                                                        <Link
                                                            href={`/products?category=${g.category._id}`}
                                                            className="text-[#3f93ba] hover:underline"
                                                        >
                                                            <span className="ml-2 text-sm text-[#3f93ba]">({g.category.name?.[locale]})</span>
                                                        </Link>
                                                    )}
                                                </motion.li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </ShopLayout>
    );
}