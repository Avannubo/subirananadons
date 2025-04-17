import { AuthCheck } from '@/components/auth/AuthCheck';
import AdminLayout from '@/components/Layouts/admin-layout';
import SettingsTabs from '@/components/admin/settings/SettingsTabs';

export default async function ConfiguracionPage() {
    return (
        <AuthCheck>
            <AdminLayout>
                <div className="p-6">
                    <h1 className="text-3xl font-bold mb-6">Configuración</h1>
                    <SettingsTabs />
                </div>
            </AdminLayout>
        </AuthCheck>
    );
}
