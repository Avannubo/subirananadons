'use client';
import { FiUser, FiCalendar, FiShoppingBag, FiMail } from 'react-icons/fi';

export default function ProductsStats() {
    // These would likely come from props or API in a real app
    const stats = [
        {
            icon: <FiShoppingBag className="text-blue-600 text-xl" />,
            title: "Productos",
            value: "120 Productos",
            description: "Todo el tiempo",
            bgColor: "bg-blue-100"
        },
        {
            icon: <FiCalendar className="text-green-600 text-xl" />,
            title: "Media de antigüedad",
            value: "2 años",
            description: "Todo el tiempo",
            bgColor: "bg-green-100"
        },
        {
            icon: <FiUser className="text-yellow-600 text-xl" />,
            title: "Clientes por producto",
            value: "15",
            description: "Todo el tiempo",
            bgColor: "bg-yellow-100"
        },
        {
            icon: <FiMail className="text-purple-600 text-xl" />,
            title: "Consultas de productos",
            value: "320",
            description: "Todo el tiempo",
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