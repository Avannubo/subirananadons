'use client';
import { useState, useEffect } from 'react';
import { FiUser, FiCalendar, FiShoppingBag, FiMail, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
export default function OrdersStats() {
    const [period, setPeriod] = useState('30');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [statsData, setStatsData] = useState({
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        customerQueries: 0,
        // Percentages for trend indicators
        totalOrdersTrend: 0,
        completedOrdersTrend: 0,
        pendingOrdersTrend: 0,
        customerQueriesTrend: 0
    });
    // Function to fetch stats data based on selected period
    const fetchStatsData = async (selectedPeriod) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/orders/stats?period=${selectedPeriod}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch order statistics');
            }
            const data = await response.json();
            if (data.success) {
                setStatsData({
                    totalOrders: data.stats.totalOrders,
                    completedOrders: data.stats.completedOrders,
                    pendingOrders: data.stats.pendingOrders,
                    customerQueries: data.stats.customerQueries,
                    totalOrdersTrend: data.stats.totalOrdersTrend,
                    completedOrdersTrend: data.stats.completedOrdersTrend,
                    pendingOrdersTrend: data.stats.pendingOrdersTrend,
                    customerQueriesTrend: data.stats.customerQueriesTrend
                });
            } else {
                throw new Error(data.message || 'Failed to fetch order statistics');
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching order statistics:', err);
        } finally {
            setIsLoading(false);
        }
    };
    // Handle period change
    const handlePeriodChange = (e) => {
        const newPeriod = e.target.value;
        setPeriod(newPeriod);
        fetchStatsData(newPeriod);
    };
    // Initialize data on mount
    useEffect(() => {
        fetchStatsData(period);
    }, []);
    const stats = [
        {
            icon: <FiUser className="text-[#00B0C8] text-xl" />,
            title: "Pedidos totales",
            value: statsData.totalOrders,
            description: `Últimos ${period} días`,
            trend: statsData.totalOrdersTrend,
            trendIcon: statsData.totalOrdersTrend >= 0 ?
                <FiTrendingUp className="text-green-600" /> :
                <FiTrendingDown className="text-red-600" />,
            bgColor: "bg-blue-100"
        },
        {
            icon: <FiCalendar className="text-green-600 text-xl" />,
            title: "Pedidos completados",
            value: statsData.completedOrders,
            description: `Últimos ${period} días`,
            trend: statsData.completedOrdersTrend,
            trendIcon: statsData.completedOrdersTrend >= 0 ?
                <FiTrendingUp className="text-green-600" /> :
                <FiTrendingDown className="text-red-600" />,
            bgColor: "bg-green-100"
        },
        {
            icon: <FiShoppingBag className="text-yellow-600 text-xl" />,
            title: "Pedidos pendientes",
            value: statsData.pendingOrders,
            description: `Últimos ${period} días`,
            trend: statsData.pendingOrdersTrend,
            trendIcon: statsData.pendingOrdersTrend >= 0 ?
                <FiTrendingUp className={statsData.pendingOrdersTrend > 0 ? "text-red-600" : "text-green-600"} /> :
                <FiTrendingDown className={statsData.pendingOrdersTrend < 0 ? "text-green-600" : "text-red-600"} />,
            bgColor: "bg-yellow-100"
        },
        {
            icon: <FiMail className="text-purple-600 text-xl" />,
            title: "Consultas de clientes",
            value: statsData.customerQueries,
            description: `Últimos ${period} días`,
            trend: statsData.customerQueriesTrend,
            trendIcon: statsData.customerQueriesTrend >= 0 ?
                <FiTrendingUp className="text-green-600" /> :
                <FiTrendingDown className="text-red-600" />,
            bgColor: "bg-purple-100"
        }
    ];
    return (
        <div>
            {/* Period selector */}
            <div className="mb-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold"> </h2>
                <select
                    value={period}
                    onChange={handlePeriodChange}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    disabled={isLoading}
                >
                    <option value="7">Últimos 7 días</option>
                    <option value="30">Últimos 30 días</option>
                    <option value="90">Últimos 90 días</option>
                </select>
            </div>
            {/* Error message */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p>{error}</p>
                </div>
            )}
            {/* Loading indicator */}
            {isLoading ? (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B0C8]"></div>
                </div>
            ) : (
                /* Stats cards */
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className={`${stat.bgColor} p-3 rounded-full mr-4`}>
                                    {stat.icon}
                                </div>
                                <div className="flex-grow">
                                    <p className="text-sm text-gray-500">{stat.title}</p>
                                    <div className="flex items-center">
                                        <p className="text-xl font-bold">{stat.value}</p>
                                        <div className="flex items-center ml-2 text-xs">
                                            {stat.trendIcon}
                                            <span className={`ml-1 ${stat.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {Math.abs(stat.trend)}%
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">{stat.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}