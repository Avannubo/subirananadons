import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import AdminLayout from '@/app/(dashboard)/dashboard/admin-layout';
import BillTabs from '@/components/admin/bills/BillsTabs';
import BillsStats from '@/components/admin/bills/BillsStats'; 
export default async function Page() {
    const cookieStore = cookies()
    const token = await cookieStore.has('token');
    if (!token) {
        redirect('/');
    }
    return (
        <AdminLayout>
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-6">Facturación</h1>
                <BillsStats />
                <BillTabs />
            </div>
        </AdminLayout>
    );
}