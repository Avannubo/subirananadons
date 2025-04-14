import AdminLayout from '@/components/Layouts/admin-layout';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import ClientsTabs from '@/components/admin/clients/ClientTabs';
import ClientsStats from '@/components/admin/clients/ClientStats';

export default async function Page() {
    const cookieStore = cookies();
    const hasToken = cookieStore.has('token');

    if (!hasToken) {
        redirect('/');
    }

    return (
        <AdminLayout>
            <div className="p-6 pt-[100px]]">
                <h1 className="text-3xl font-bold mb-6">Clientes</h1>
                <ClientsStats />
                <ClientsTabs />
            </div>
        </AdminLayout>
    );
}