import { AuthCheck } from '@/components/auth/AuthCheck';
import AdminLayout from '@/components/Layouts/admin-layout';
import OrdersTabs from '@/components/admin/orders/OrdersTabs';
import OrdersStats from '@/components/admin/orders/OrdersStats';

export default async function PedidosPage() {
    return (
        <AuthCheck>
            <AdminLayout>
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold mb-6">Gestión de Pedidos</h1>

                    <OrdersStats />
                    <OrdersTabs />
                </div>
            </AdminLayout>
        </AuthCheck>
    );
}
