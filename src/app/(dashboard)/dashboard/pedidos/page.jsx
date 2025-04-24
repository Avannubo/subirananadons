'use client';

import { useSession } from 'next-auth/react';
import AuthCheck from '@/components/auth/AuthCheck';
import AdminLayout from '@/components/Layouts/admin-layout';
import OrdersTabs from '@/components/admin/orders/OrdersTabs';
import OrdersStats from '@/components/admin/orders/OrdersStats';

export default function PedidosPage() {
    const { data: session } = useSession();
    const userRole = session?.user?.role || 'user';

    return (
        <AuthCheck>
            <AdminLayout>
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold mb-6">
                        {userRole === 'admin' ? 'Gestión de Pedidos' : 'Mis Pedidos'}
                    </h1>

                    {userRole === 'admin' && <OrdersStats />}
                    <OrdersTabs userRole={userRole} />
                </div>
            </AdminLayout>
        </AuthCheck>
    );
}
