import AuthCheck from '@/components/auth/AuthCheck';
import AdminLayout from '@/components/Layouts/admin-layout';
import ClientsTabs from '@/components/admin/clients/ClientTabs';
import ClientsStats from '@/components/admin/clients/ClientStats';
export default async function ClientesPage() {
    return (
        <AuthCheck>
            <AdminLayout>
                <div className="py-6 min-h-[90vh]">
                    <h1 className="text-2xl font-bold mb-6">Clientes</h1>
                    {/* <ClientsStats /> */}
                    <ClientsTabs />
                </div>
            </AdminLayout>
        </AuthCheck>
    );
}