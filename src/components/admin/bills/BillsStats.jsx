'use client';
import { useState } from 'react';
import { FiUser, FiCalendar, FiShoppingBag, FiMail } from 'react-icons/fi';
import { useEffect } from 'react';
export default function BillsStats() {
    const [stats, setStats] = useState([
        {
            icon: <FiUser className="text-[#00B0C8] text-xl" />,
            title: "Facturas emitidas",
            value: "...",
            description: "Este mes",
            bgColor: "bg-blue-100"
        },
        {
            icon: <FiCalendar className="text-green-600 text-xl" />,
            title: "Facturas pagadas",
            value: "...",
            description: "Este mes",
            bgColor: "bg-green-100"
        },
        {
            icon: <FiShoppingBag className="text-yellow-600 text-xl" />,
            title: "Facturas pendientes",
            value: "...",
            description: "Este mes",
            bgColor: "bg-yellow-100"
        },
        {
            icon: <FiMail className="text-purple-600 text-xl" />,
            title: "Notificaciones enviadas",
            value: "...",
            description: "Este mes",
            bgColor: "bg-purple-100"
        }
    ]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/stats/bills');
                const data = await response.json();

                if (data.success) {
                    setStats([
                        {
                            icon: <FiUser className="text-[#00B0C8] text-xl" />,
                            title: "Facturas emitidas",
                            value: data.data.totalBills.toString(),
                            description: "Este mes",
                            bgColor: "bg-blue-100"
                        },
                        {
                            icon: <FiCalendar className="text-green-600 text-xl" />,
                            title: "Facturas pagadas",
                            value: data.data.paidBills.toString(),
                            description: "Este mes",
                            bgColor: "bg-green-100"
                        },
                        {
                            icon: <FiShoppingBag className="text-yellow-600 text-xl" />,
                            title: "Facturas pendientes",
                            value: data.data.pendingBills.toString(),
                            description: "Este mes",
                            bgColor: "bg-yellow-100"
                        },
                        {
                            icon: <FiMail className="text-purple-600 text-xl" />,
                            title: "Notificaciones enviadas",
                            value: data.data.notificationsSent.toString(),
                            description: "Este mes",
                            bgColor: "bg-purple-100"
                        }
                    ]);
                }
            } catch (error) {
                console.error('Error fetching billing stats:', error);
            }
        };

        fetchStats();
    }, []);

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