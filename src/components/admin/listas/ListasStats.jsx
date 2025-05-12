'use client';
import { FiGift, FiCalendar, FiCheckCircle, FiX, FiRefreshCw } from 'react-icons/fi';
import { useListStats } from '@/contexts/ListStatsContext';
import StatsCard from '@/components/admin/shared/StatsCard';
import StatsCardGrid from '@/components/admin/shared/StatsCardGrid';

export default function ListasStats() {
    const { stats, loading, refreshing, lastUpdated, formatLastUpdated, refreshStats } = useListStats();

    const statsItems = [
        {
            icon: <FiGift className="text-[#00B0C8] text-xl" />,
            title: "Listas totales",
            value: loading ? "Cargando..." : stats.listsThisMonth.toString(),
            description: "Este mes",
            bgColor: "bg-blue-100"
        },
        {
            icon: <FiCalendar className="text-green-600 text-xl" />,
            title: "Listas activas",
            value: loading ? "Cargando..." : stats.activeListsThisMonth.toString(),
            description: "Este mes",
            bgColor: "bg-green-100"
        },
        {
            icon: <FiCheckCircle className="text-yellow-600 text-xl" />,
            title: "Listas completadas",
            value: loading ? "Cargando..." : stats.completedListsThisMonth.toString(),
            description: "Este mes",
            bgColor: "bg-yellow-100"
        },
        {
            icon: <FiX className="text-purple-600 text-xl" />,
            title: "Listas canceladas",
            value: loading ? "Cargando..." : stats.canceledListsThisMonth.toString(),
            description: "Este mes",
            bgColor: "bg-purple-100"
        }
    ];

    return (
        <StatsCardGrid
            lastUpdated={formatLastUpdated()}
            refreshStats={refreshStats}
            refreshing={refreshing}
        >
            {statsItems.map((stat, index) => (
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