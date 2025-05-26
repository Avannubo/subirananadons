import AuthCheck from '@/components/auth/AuthCheck';
import AdminLayout from '@/components/Layouts/admin-layout';
import BrandsTable from '@/components/admin/products/BrandsTable';
import BrandsStats from '@/components/admin/products/BrandsStats';

export default async function BrandsPage() {
    return (
        <AuthCheck>
            <AdminLayout>
                <div className="py-6 min-h-[100vh]">
                    <h1 className="text-2xl font-bold mb-6">Gestión de Marcas</h1>
                    {/* <BrandsStats /> */}
                    <div className="bg-white rounded-lg shadow">
                        <BrandsTable />
                    </div>
                </div>
            </AdminLayout>
        </AuthCheck>
    );
} 