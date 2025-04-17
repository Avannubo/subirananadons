import { AuthCheck } from '@/components/auth/AuthCheck';
import AdminLayout from '@/components/Layouts/admin-layout';
import LineChart from '@/components/admin/charts/LineChart';
import ChartContainer from '@/components/admin/charts/ChartContainer';

export default async function DashboardPage() {
    const salesData = {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
        datasets: [
            {
                label: 'Ventas',
                data: [12, 19, 3, 5, 2, 3],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
            },
        ],
    };

    const ordersData = {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
        datasets: [
            {
                label: 'Pedidos',
                data: [5, 15, 8, 12, 7, 10],
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1,
            },
        ],
    };

    return (
        <AuthCheck>
            <AdminLayout>
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                            <LineChart data={salesData} />
                        </ChartContainer>
                        <ChartContainer title="Pedidos Mensuales">
                            <LineChart data={ordersData} />
                        </ChartContainer>
                    </div>
                </div>
            </AdminLayout>
        </AuthCheck>
    );
}