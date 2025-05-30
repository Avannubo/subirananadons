'use client';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import AuthCheck from '@/components/auth/AuthCheck';
import AdminLayout from '@/components/Layouts/admin-layout';
import OrdersTabs from '@/components/admin/orders/OrdersTabs';
import OrdersStats from '@/components/admin/orders/OrdersStats';
export default function PedidosPage() {
    const { data: session, status } = useSession();
    const userRole = session?.user?.role || 'user'; 
    useEffect(() => {
        console.log('Pedidos Page - Session Status:', status);
        console.log('Pedidos Page - User Role:', userRole);
        console.log('Pedidos Page - Session Data:', session);
    }, [session, status, userRole]);
    return (
        <AuthCheck>
            <AdminLayout>
                <div className="py-6 min-h-[85vh] h-full	">
                    <h1 className="text-2xl font-bold mb-6">
                        {userRole === 'admin' ? 'Gestión de Pedidos' : 'Mis Pedidos'}
                    </h1>
                    {/* {userRole === 'admin' && <OrdersStats />} */}
                    <OrdersTabs userRole={userRole} />
                </div>
            </AdminLayout>
        </AuthCheck>
    );
}