'use client';
import { FiGift, FiCalendar, FiCheckCircle, FiX } from 'react-icons/fi';

export default function ListasStats() {
    // These would likely come from props or API in a real app
    const stats = [
        {
            icon: <FiGift className="text-[#00B0C8] text-xl" />,
            title: "Listas totales",
            value: "54",
            description: "Este mes",
            bgColor: "bg-blue-100"
        },
        {
            icon: <FiCalendar className="text-green-600 text-xl" />,
            title: "Listas activas",
            value: "32",
            description: "Este mes",
            bgColor: "bg-green-100"
        },
        {
            icon: <FiCheckCircle className="text-yellow-600 text-xl" />,
            title: "Listas completadas",
            value: "18",
            description: "Este mes",
            bgColor: "bg-yellow-100"
        },
        {
            icon: <FiX className="text-purple-600 text-xl" />,
            title: "Listas canceladas",
            value: "4",
            description: "Este mes",
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