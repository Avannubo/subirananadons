
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
            <div className=''>
                page
            </div>
        </AdminLayout>
    );
}