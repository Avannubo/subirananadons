import AdminLayout from '@/app/(dashboard)/dashboard/admin-layout';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers'; 
import OrdersTabs from '@/components/admin/Orders/OrdersTabs';
export default async function Page() {
    const cookieStore = cookies();
    const hasToken = cookieStore.has('token');
    if (!hasToken) {
        redirect('/');
    }
    return (
        <AdminLayout>
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-6">Pedidos</h1>
                <OrdersTabs />
            </div>
        </AdminLayout>
    );
}