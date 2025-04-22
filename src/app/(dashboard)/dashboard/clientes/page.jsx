import  AuthCheck  from '@/components/auth/AuthCheck';
import AdminLayout from '@/components/Layouts/admin-layout';
import ClientsTabs from '@/components/admin/clients/ClientTabs';
import ClientsStats from '@/components/admin/clients/ClientStats';

export default async function ClientesPage() {
    return (
        <AuthCheck>
            <AdminLayout>
                <div className="p-6">
                    <h1 className="text-3xl font-bold mb-6">Clientes</h1>
                    <ClientsStats />
                    <ClientsTabs />
                </div>
            </AdminLayout>
        </AuthCheck>
    );
}