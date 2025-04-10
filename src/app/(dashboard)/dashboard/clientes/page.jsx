
import AdminLayout from '@/app/(dashboard)/dashboard/admin-layout';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers'
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
                page
            </div>
        </AdminLayout>
    );
}