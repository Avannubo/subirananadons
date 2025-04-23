import  AuthCheck  from '@/components/auth/AuthCheck';
import AdminLayout from '@/components/Layouts/admin-layout';
import BillTabs from '@/components/admin/bills/BillsTabs';
import BillsStats from '@/components/admin/bills/BillsStats';

export default async function FacturacionPage() {
    return (
        <AuthCheck>
            <AdminLayout>
                <div className="p-6">
                    <h1 className="text-3xl font-bold mb-6">Facturación</h1>
                    <BillsStats />
                    <BillTabs />
                </div>
            </AdminLayout>
        </AuthCheck>
    );
}