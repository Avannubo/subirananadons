'use client';
import { useState, useEffect } from 'react';
import { TagIcon, CheckCircle, XCircle, Image, ShoppingBag } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function BrandsStats() {
    const [stats, setStats] = useState({
        totalBrands: '--',
        activeBrands: '--',
        inactiveBrands: '--',
        brandsWithLogo: '--'
    });
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        try {
            setLoading(true);
            setRefreshing(true);
            const response = await fetch('/api/brands');

            if (!response.ok) {
                throw new Error('Failed to fetch brands data');
            }

            const data = await response.json();
            const brands = Array.isArray(data) ? data : (data.brands || []);

            // Calculate stats
            const totalBrands = brands.length;
            const activeBrands = brands.filter(brand => brand.enabled).length;
            const inactiveBrands = totalBrands - activeBrands;
            const brandsWithLogo = brands.filter(brand => brand.logo && brand.logo.trim() !== '').length;

            setStats({
                totalBrands,
                activeBrands,
                inactiveBrands,
                brandsWithLogo
            });

            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching brand stats:', error);
            toast.error('Error loading brand statistics');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    // Format the last updated time
    const formatLastUpdated = () => {
        if (!lastUpdated) return '';

        return new Intl.DateTimeFormat('es', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(lastUpdated);
    };

    return (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
                {lastUpdated && (
                    <div className="text-sm text-gray-500">
                        <span>Última actualización: {formatLastUpdated()}</span>
                    </div>
                )}
                <button
                    onClick={fetchStats}
                    disabled={refreshing}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                    </svg>
                    <span>{refreshing ? 'Actualizando...' : 'Actualizar'}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <TagIcon className="text-blue-500" size={24} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-gray-500 text-sm">Marcas</h2>
                            <p className="text-2xl font-bold">{loading ? "--" : stats.totalBrands}</p>
                            <p className="text-xs text-gray-500">Total de marcas</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="text-green-500" size={24} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-gray-500 text-sm">Marcas Activas</h2>
                            <p className="text-2xl font-bold">{loading ? "--" : stats.activeBrands}</p>
                            <p className="text-xs text-gray-500">Marcas habilitadas</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                <XCircle className="text-gray-500" size={24} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-gray-500 text-sm">Marcas Inactivas</h2>
                            <p className="text-2xl font-bold ">{loading ? "--" : stats.inactiveBrands}</p>
                            <p className="text-xs text-gray-500">Marcas deshabilitadas</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <Image className="text-red-500" size={24} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-gray-500 text-sm">Con Logo</h2>
                            <p className="text-2xl font-bold ">{loading ? "--" : stats.brandsWithLogo}</p>
                            <p className="text-xs text-gray-500">Marcas con imagen</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 