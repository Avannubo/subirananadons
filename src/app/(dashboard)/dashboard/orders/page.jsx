'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import AuthCheck from '@/components/auth/AuthCheck';
import AdminLayout from '@/components/Layouts/admin-layout'; 
// import OrdersTable from '@/components/admin/orders/OrdersTable'; 
import { useOrders } from '@/hooks/useOrders';

export default function PedidosPage() {
    const { data: session, status } = useSession();
    const userRole = session?.user?.role || 'user';  
    useEffect(() => {
        console.log('Pedidos Page - Session Status:', status);
        console.log('Pedidos Page - User Role:', userRole);
        console.log('Pedidos Page - Session Data:', session);
    }, [session, status, userRole]);
    // Get browser language (default to 'ca' if not found)
    let locale = 'ca';
    if (typeof window !== 'undefined' && window.navigator) {
        const lang = window.navigator.language || window.navigator.userLanguage;
        if (lang && lang.toLowerCase().startsWith('es')) locale = 'es';
    } 
    const {
        orders,
        loading,
        error,
        pagination,
        fetchOrders,
        updateOrderStatus,
        updateOrderDetails,
        deleteOrder,
        setCurrentPage,
        setLimit
    } = useOrders(userRole);
    // Add filters state
    const [filters, setFilters] = useState({
        searchId: '',
        searchReference: '',
        searchCustomer: '',
        searchTotal: '',
        searchPayment: ''
    });
    // Translations
    const translations = {  
        ca: {
            admin: 'Gestió de Comandes',
            user: 'Les Meves Comandes',
            all: 'Totes',
            accepted: 'Acceptades',
            cancelled: 'Cancel·lades',
            orderManagement: 'Gestió de Comandes',
            updated: 'Dades actualitzades correctament',
            export: 'Exporta',
            exportCSV: 'Exporta a CSV',
            exportExcel: 'Exporta a Excel',
            exportPDF: 'Exporta a PDF',
            searchId: 'Cerca ID',
            searchReference: 'Cerca Referència',
            searchCustomer: 'Cerca Client',
            searchTotal: 'Cerca Total',
            loading: 'Carregant comandes...',
            printPDF: 'Imprimeix PDF',
            exportTitle: 'Llistat de Comandes',
            exportDate: 'Data d\'exportació',
            paymentMethod: 'Mètode de Pagament',
            status: 'Estat',
            client: 'Client',
            reference: 'Referència',
            date: 'Data',
            total: 'Total',
            email: 'Email',
            id: 'ID',
            refresh: 'Actualitza dades',
            errorExport: 'Error en exportar les comandes: '
        },
        es: {
            admin: 'Gestión de Pedidos',
            user: 'Mis Pedidos',
            all: 'Todos',
            accepted: 'Aceptadas',
            cancelled: 'Canceladas',
            orderManagement: 'Gestión de Pedidos',
            updated: 'Datos actualizados correctamente',
            export: 'Exportar',
            exportCSV: 'Exportar a CSV',
            exportExcel: 'Exportar a Excel',
            exportPDF: 'Exportar a PDF',
            searchId: 'Buscar ID',
            searchReference: 'Buscar Referencia',
            searchCustomer: 'Buscar Cliente',
            searchTotal: 'Buscar Total',
            loading: 'Cargando pedidos...',
            printPDF: 'Imprimir PDF',
            exportTitle: 'Listado de Pedidos',
            exportDate: 'Fecha de exportación',
            paymentMethod: 'Método de Pago',
            status: 'Estado',
            client: 'Cliente',
            reference: 'Referencia',
            date: 'Fecha',
            total: 'Total',
            email: 'Email',
            id: 'ID',
            refresh: 'Actualizar datos',
            errorExport: 'Error al exportar los pedidos: '
        }
    }; 
    const heading = userRole === 'admin' ? translations[locale].admin : translations[locale].user;

    useEffect(() => {
        console.log('Pedidos Page - Session Status:', status);
        console.log('Pedidos Page - User Role:', userRole);
        console.log('Pedidos Page - Session Data:', session);
    }, [session, status, userRole]);

    return (
        <AuthCheck>
            <AdminLayout>
                <div className="py-6 min-h-[85vh] h-full\t">
                    <h1 className="text-2xl font-bold mb-6">
                        {heading}
                    </h1>
                    <div>
                        {/* filters searcg */}
</div>
                
                    {/* {loading ? (
                        <div className="py-20 text-center">
                            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-t-2 border-[#00B0C8]"></div>
                            <p className="mt-3 text-gray-600">{t.loading}</p>
                        </div>
                    ) : (
                        <OrdersTable
                            orders={orders}
                            filters={filters}
                            setFilters={setFilters}
                            userRole={userRole}
                            isLoading={loading}
                            onStatusChange={updateOrderStatus}
                            onDelete={deleteOrder}
                            pagination={pagination}
                            onPageChange={setCurrentPage}
                            onLimitChange={setLimit}
                        />
                    )} */}
                </div>
            </AdminLayout>
        </AuthCheck >
    );
}