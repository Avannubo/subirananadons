'use client';
import { FiShoppingBag, FiPackage, FiTag, FiAlertCircle } from 'react-icons/fi';
import { useStats } from '@/contexts/StatsContext';
import StatsCard from '@/components/admin/shared/StatsCard';
import StatsCardGrid from '@/components/admin/shared/StatsCardGrid';

export default function ProductsStats() {
    const { stats, loading, refreshing, lastUpdated, refreshStats } = useStats();

    // Format the last updated time
    const formatLastUpdated = () => {
        if (!lastUpdated) return '';

        return new Intl.DateTimeFormat('es', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(lastUpdated);
    };

    const statsItems = [
        {
            icon: <FiShoppingBag className="text-[#00B0C8] text-xl" />,
            title: "Productos",
            value: loading ? "Cargando..." : `${stats.totalProducts}`,
            description: "Productos en catálogo",
            bgColor: "bg-blue-100"
        },
        {
            icon: <FiTag className="text-green-600 text-xl" />,
            title: "Categorías",
            value: loading ? "Cargando..." : stats.totalCategories.toString(),
            description: "Total de categorías",
            bgColor: "bg-green-100"
        },
        {
            icon: <FiPackage className="text-yellow-600 text-xl" />,
            title: "Marcas",
            value: loading ? "Cargando..." : stats.totalBrands.toString(),
            description: "Total de marcas",
            bgColor: "bg-yellow-100"
        },
        {
            icon: <FiAlertCircle className="text-red-600 text-xl" />,
            title: "Bajo stock",
            value: loading ? "Cargando..." : stats.lowStockProducts.toString(),
            description: "Productos bajo umbral mínimo",
            bgColor: "bg-red-100"
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