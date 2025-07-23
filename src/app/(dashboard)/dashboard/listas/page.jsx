'use client';
import { useSession } from 'next-auth/react';
import AuthCheck from '@/components/auth/AuthCheck';
import AdminLayout from '@/components/Layouts/admin-layout';
import ListasTabs from '@/components/admin/listas/ListasTabs';
export default function ListasPage() {
    const { data: session } = useSession();
    const userRole = session?.user?.role || 'user';
    // Locale detection (default to 'ca')
    let locale = 'ca';
    if (typeof window !== 'undefined' && window.navigator) {
        const lang = window.navigator.language || window.navigator.userLanguage;
        if (lang && lang.toLowerCase().startsWith('es')) locale = 'es';
    }
    const translations = {
        ca: {
            admin: 'Gestió de Llistes de Regals',
            user: 'Les Meves Llistes de Regals',
        },
        es: {
            admin: 'Gestión de Listas de Regalos',
            user: 'Mis Listas de Regalos',
        }
    };
    const t = translations[locale];
    return (
        <AuthCheck>
            <AdminLayout>
                <div className="py-6 min-h-[90vh]">
                    <h1 className="text-2xl font-bold mb-6">
                        {userRole === 'admin' ? t.admin : t.user}
                    </h1>
                    {/* {userRole === 'admin' && <ListasStats />} */}
                    <ListasTabs userRole={userRole} />
                </div>
            </AdminLayout>
        </AuthCheck>
    );
}