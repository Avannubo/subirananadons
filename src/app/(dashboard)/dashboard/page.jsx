"use client";
import AuthCheck from '@/components/auth/AuthCheck';
import AdminLayout from '@/components/Layouts/admin-layout';
import LineChart from '@/components/admin/charts/LineChart';
import ChartContainer from '@/components/admin/charts/ChartContainer';

import { useEffect, useState } from 'react';

export default function DashboardPage() {
    const [salesData, setSalesData] = useState(null);
    const [ordersData, setOrdersData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchDashboardData() {
            setLoading(true);
            setError(null);
            try {
                // Example endpoints, adjust as needed
                const [salesRes, ordersRes] = await Promise.all([
                    fetch('/api/dashboard/sales'),
                    fetch('/api/dashboard/orders'),
                ]);
                if (!salesRes.ok || !ordersRes.ok) throw new Error('Error fetching dashboard data');
                const salesJson = await salesRes.json();
                const ordersJson = await ordersRes.json();
                setSalesData({
                    labels: salesJson.labels,
                    datasets: [
                        {
                            label: 'Ventas',
                            data: salesJson.data,
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1,
                        },
                    ],
                });
                setOrdersData({
                    labels: ordersJson.labels,
                    datasets: [
                        {
                            label: 'Pedidos',
                            data: ordersJson.data,
                            borderColor: 'rgb(255, 99, 132)',
                            tension: 0.1,
                        },
                    ],
                });
            } catch (e) {
                setError('No se pudieron cargar los datos del panel');
            } finally {
                setLoading(false);
            }
        }
        fetchDashboardData();
    }, []);

    return (
        <AuthCheck>
            <AdminLayout>
                <div className="py-6 min-h-[85vh]">
                    <h1 className="text-2xl font-bold mb-6">Panel de Control</h1>
                    {error && <div className="text-red-500 mb-4">{error}</div>}
                    {loading ? (
                        <div className="text-gray-500">Cargando datos...</div>
                    ) : (
                        <>
                            {/* You can fetch and display summary stats from the API as well */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                {/* Example static summary, replace with API data if available */}
                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-700">Ventas Totales</h3>
                                    <p className="text-3xl font-bold text-[#00B0C8]">€15,350</p>
                                    <p className="text-sm text-green-500">+12% desde el mes pasado</p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-700">Pedidos</h3>
                                    <p className="text-3xl font-bold text-[#00B0C8]">156</p>
                                    <p className="text-sm text-green-500">+8% desde el mes pasado</p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-700">Clientes</h3>
                                    <p className="text-3xl font-bold text-[#00B0C8]">89</p>
                                    <p className="text-sm text-green-500">+15% desde el mes pasado</p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-700">Productos</h3>
                                    <p className="text-3xl font-bold text-[#00B0C8]">245</p>
                                    <p className="text-sm text-yellow-500">+2% desde el mes pasado</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <ChartContainer title="Ventas Mensuales">
                                    {salesData && <LineChart data={salesData} />}
                                </ChartContainer>
                                <ChartContainer title="Pedidos Mensuales">
                                    {ordersData && <LineChart data={ordersData} />}
                                </ChartContainer>
                            </div>
                        </>
                    )}
                </div>
            </AdminLayout>
        </AuthCheck>
    );
}