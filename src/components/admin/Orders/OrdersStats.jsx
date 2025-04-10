'use client';
import { FiUser, FiCalendar, FiShoppingBag, FiMail } from 'react-icons/fi';

export default function OrdersStats() {
    const stats = [
        {
            icon: <FiUser className="text-[#00B0C8] text-xl" />,
            title: "Pedidos totales",
            value: "10",
            description: "Últimos 30 días",
            bgColor: "bg-blue-100"
        },
        {
            icon: <FiCalendar className="text-green-600 text-xl" />,
            title: "Pedidos completados",
            value: "25",
            description: "Últimos 30 días",
            bgColor: "bg-green-100"
        },
        {
            icon: <FiShoppingBag className="text-yellow-600 text-xl" />,
            title: "Pedidos pendientes",
            value: "5",
            description: "Últimos 30 días",
            bgColor: "bg-yellow-100"
        },
        {
            icon: <FiMail className="text-purple-600 text-xl" />,
            title: "Consultas de clientes",
            value: "50",
            description: "Últimos 30 días",
            bgColor: "bg-purple-100"
        }
    ];
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
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
    );
}