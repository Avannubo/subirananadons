import AuthCheck from '@/components/auth/AuthCheck';
import AdminLayout from '@/components/Layouts/admin-layout';
import ClientsTabs from '@/components/admin/clients/ClientTabs';
import ClientsStats from '@/components/admin/clients/ClientStats';
export default async function ClientesPage() {
    // Locale detection (default to 'ca')
    let locale = 'ca';
    if (typeof window !== 'undefined' && window.navigator) {
        const lang = window.navigator.language || window.navigator.userLanguage;
        if (lang && lang.toLowerCase().startsWith('es')) locale = 'es';
    }
    const translations = {
        ca: { clients: 'Clients' },
        es: { clients: 'Clientes' }
    };
    const t = translations[locale];
    return (
        <AuthCheck>
            <AdminLayout>
                <div className="py-6 min-h-[90vh]">
                    <h1 className="text-2xl font-bold mb-6">{t.clients}</h1>
                    {/* <ClientsStats /> */}
                    <ClientsTabs />
                </div>
            </AdminLayout>
        </AuthCheck>
    );
}