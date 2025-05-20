'use client';
import { useState, useEffect } from 'react';
import { FiUser, FiCalendar, FiShoppingBag, FiMail, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import StatsCard from '@/components/admin/shared/StatsCard';
import StatsCardGrid from '@/components/admin/shared/StatsCardGrid';

export default function OrdersStats() {
    const [period, setPeriod] = useState('30');
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
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
    const fetchStatsData = async (selectedPeriod, showRefreshing = true) => {
        if (showRefreshing) {
            setRefreshing(true);
        }
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
                setLastUpdated(new Date());
            } else {
                throw new Error(data.message || 'Failed to fetch order statistics');
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching order statistics:', err);
        } finally {
            setIsLoading(false);
            if (showRefreshing) {
                setRefreshing(false);
            }
        }
    };

    // Handle period change
    const handlePeriodChange = (e) => {
        const newPeriod = e.target.value;
        setPeriod(newPeriod);
        fetchStatsData(newPeriod);
    };

    // Refresh stats
    const refreshStats = () => {
        if (refreshing) return;
        fetchStatsData(period, true);
    };

    // Format the last updated time
    const formatLastUpdated = () => {
        if (!lastUpdated) return '';

        return new Intl.DateTimeFormat('es', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(lastUpdated);
    };

    // Initialize data on mount
    useEffect(() => {
        fetchStatsData(period, false);
    }, []);

    const stats = [
        {
            icon: <FiUser className="text-[#00B0C8] text-xl" />,
            title: "Pedidos totales",
            value: isLoading ? "Cargando..." : statsData.totalOrders.toString(),
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
            value: isLoading ? "Cargando..." : statsData.completedOrders.toString(),
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
            value: isLoading ? "Cargando..." : statsData.pendingOrders.toString(),
            description: `Últimos ${period} días`,
            trend: statsData.pendingOrdersTrend,
            trendIcon: statsData.pendingOrdersTrend >= 0 ?
                <FiTrendingUp className={statsData.pendingOrdersTrend < 0 ? "text-red-600" : "text-green-600"} /> :
                <FiTrendingDown className={statsData.pendingOrdersTrend < 0 ? "text-green-600" : "text-red-600"} />,
            bgColor: "bg-yellow-100"
        },
        {
            icon: <FiMail className="text-purple-600 text-xl" />,
            title: "Consultas de clientes",
            value: isLoading ? "Cargando..." : statsData.customerQueries.toString(),
            description: `Últimos ${period} días`,
            trend: statsData.customerQueriesTrend,
            trendIcon: statsData.customerQueriesTrend >= 0 ?
                <FiTrendingUp className="text-green-600" /> :
                <FiTrendingDown className="text-red-600" />,
            bgColor: "bg-purple-100"
        }
    ];

    return (
        <>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p>{error}</p>
                </div>
            )}

            <StatsCardGrid
                lastUpdated={formatLastUpdated()}
                refreshStats={refreshStats}
                refreshing={refreshing}
            >
                {stats.map((stat, index) => (
                    <StatsCard
                        key={index}
                        icon={stat.icon}
                        bgColor={stat.bgColor}
                        title={stat.title}
                        value={stat.value}
                        description={stat.description}
                    />
                ))}
            </StatsCardGrid>
        </>
    );
}