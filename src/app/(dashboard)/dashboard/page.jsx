import AdminLayout from '@/components/Layouts/admin-layout';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import BarChart from '@/components/admin/charts/BarChart';
import LineChart from '@/components/admin/charts/LineChart';
import ChartContainer from '@/components/admin/charts/ChartContainer';
export default async function Page() {
    const cookieStore = cookies();
    const token = await cookieStore.has('token');
    if (!token) {
        redirect('/');
    }
    const barData = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: [
            {
                label: 'Orders',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };
    const lineData = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: [
            {
                label: 'Visits',
                data: [65, 59, 80, 81, 56, 55],
                fill: false,
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1,
            },
        ],
    };
    return (
        <AdminLayout>
            <h1 className="text-4xl font-bold text-start mb-8">Inicio</h1>
            <div className="grid grid-cols-2 gap-6">
                <ChartContainer title="Client Orders Statistics">
                    <BarChart
                        data={barData}
                        options={{
                            title: 'Monthly Orders',
                            plugins: {
                                legend: {
                                    display: false
                                }
                            }
                        }}
                    />
                </ChartContainer>
                <ChartContainer title="Page Visits Statistics">
                    <LineChart
                        data={lineData}
                        options={{
                            title: 'Monthly Visits',
                            plugins: {
                                legend: {
                                    display: false
                                }
                            }
                        }}
                    />
                </ChartContainer>
            </div>
        </AdminLayout>
    );
}