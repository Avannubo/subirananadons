'use client';
import { useSession } from 'next-auth/react';
import AuthCheck from '@/components/auth/AuthCheck';
import AdminLayout from '@/components/Layouts/admin-layout';
import ListasTabs from '@/components/admin/listas/ListasTabs';
export default function ListasPage() {
    const { data: session } = useSession();
    const userRole = session?.user?.role || 'user';
    return (
        <AuthCheck>
            <AdminLayout>
                <div className="py-6 min-h-[90vh]">
                    <h1 className="text-2xl font-bold mb-6">
                        {userRole === 'admin' ? 'Gestión de Listas de Regalos' : 'Mis Listas de Regalos'}
                    </h1>
                    {/* {userRole === 'admin' && <ListasStats />} */}
                    <ListasTabs userRole={userRole} />
                </div>
            </AdminLayout>
        </AuthCheck>
    );
}