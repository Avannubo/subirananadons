'use client';
import { FiShoppingBag, FiPackage, FiTag, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { useStats } from '@/contexts/StatsContext';

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
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                    {lastUpdated && (
                        <span>Última actualización: {formatLastUpdated()}</span>
                    )}
                </div>
                <button
                    onClick={refreshStats}
                    disabled={refreshing}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                    <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''}`} />
                    <span>{refreshing ? 'Actualizando...' : 'Actualizar'}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {statsItems.map((stat, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow flex items-center">
                        <div className={`${stat.bgColor} p-3 rounded-full mr-4`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{stat.title}</p>
                            <p className="text-xl font-bold">{stat.value}</p>
                            <p className="text-xs text-gray-500">{stat.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}