import  AuthCheck  from '@/components/auth/AuthCheck';
import AdminLayout from '@/components/Layouts/admin-layout';

export default async function ListasPage() {
    return (
        <AuthCheck>
            <AdminLayout>
                <div className="p-6">
                    <h1 className="text-3xl font-bold mb-6">Gestión de Listas de Regalos</h1>
                    {/* Add your gift list management components here */}
                </div>
            </AdminLayout>
        </AuthCheck>
    );
}