import AdminLayout from '@/components/Layouts/admin-layout';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers'
export default async function GiftListsPage() {
    const cookieStore = cookies()
    const token = await cookieStore.has('token');
    if (!token) {
        redirect('/');
    }
    return (
        <AdminLayout>
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-6">Gestión de Listas de Regalos</h1>

            </div>
        </AdminLayout>
    );
}