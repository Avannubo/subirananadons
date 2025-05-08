'use client';
import { FiUser, FiCalendar, FiShoppingBag, FiMail, FiRefreshCw } from 'react-icons/fi';
import { useClientStats } from '@/contexts/ClientStatsContext';

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
                {displayStats.map((stat, index) => (
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