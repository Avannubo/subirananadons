'use client';
import { FiUser, FiCalendar, FiShoppingBag, FiMail } from 'react-icons/fi';
import { useClientStats } from '@/contexts/ClientStatsContext';
import StatsCard from '@/components/admin/shared/StatsCard';
import StatsCardGrid from '@/components/admin/shared/StatsCardGrid';

export default function ClientsStats() {
    const { stats, loading, refreshing, lastUpdated, refreshStats } = useClientStats();

    // Format the last updated time
    const formatLastUpdated = () => {
        if (!lastUpdated) return '';

        return new Intl.DateTimeFormat('es', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(lastUpdated);
    };

    // Format stats for display
    const displayStats = [
        {
            icon: <FiUser className="text-[#00B0C8] text-xl" />,
            title: "Clientes",
            value: loading ? "Cargando..." : `${stats.totalClients} Clientes`,
            description: `${stats.activeClients} activos, ${stats.inactiveClients} inactivos`,
            bgColor: "bg-blue-100"
        },
        {
            icon: <FiCalendar className="text-green-600 text-xl" />,
            title: "Media de edad",
            value: loading ? "Cargando..." : `${stats.averageAge} años`,
            description: "Clientes registrados",
            bgColor: "bg-green-100"
        },
        {
            icon: <FiShoppingBag className="text-yellow-600 text-xl" />,
            title: "Pedidos por cliente",
            value: loading ? "Cargando..." : stats.ordersPerClient.toFixed(2),
            description: "Todo el tiempo",
            bgColor: "bg-yellow-100"
        },
        {
            icon: <FiMail className="text-purple-600 text-xl" />,
            title: "Inscripciones al boletín",
            value: loading ? "Cargando..." : stats.newsletterSubscribers,
            description: `${stats.partnerOffersSubscribers} reciben ofertas de socios`,
            bgColor: "bg-purple-100"
        }
    ];

    return (
        <StatsCardGrid
            lastUpdated={formatLastUpdated()}
            refreshStats={refreshStats}
            refreshing={refreshing}
        >
            {displayStats.map((stat, index) => (
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
    );
}