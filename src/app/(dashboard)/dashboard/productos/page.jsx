import AuthCheck from '@/components/auth/AuthCheck';
import AdminLayout from '@/components/Layouts/admin-layout';
import ProductTabs from '@/components/admin/products/ProductTabs';
import ProductsStats from '@/components/admin/products/ProductsStats';

export default async function ProductosPage() {
    return (
        <AuthCheck>
            <AdminLayout>
                <div className="py-6 min-h-[100vh]">
                    <h1 className="text-2xl font-bold mb-6">Catálogo</h1>
                    {/* <ProductsStats /> */}
                    <ProductTabs />
                </div>
            </AdminLayout>
        </AuthCheck>
    );
}
