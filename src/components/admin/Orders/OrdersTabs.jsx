'use client';
import { useState } from 'react';
import OrdersTable from '@/components/admin/orders/OrdersTable';
const orders = [
    {
        id: 5453,
        reference: 'SUBBRIJU',
        newCustomer: true,
        delivery: 'España',
        customer: 'S. Font-Armadans',
        total: '117,00 €',
        payment: 'Redsys - Tarjeta',
        status: 'Pago aceptado',
        date: '09/04/2025 22:23:22'
    },
    {
        id: 5452,
        reference: 'MEGLYKOPC',
        newCustomer: true,
        delivery: 'España',
        customer: 'A. Sánchez Veredas',
        total: '71,82 €',
        payment: 'Redsys - Bizum',
        status: 'Pago aceptado',
        date: '09/04/2025 19:30:32'
    },
    {
        id: 5454,
        reference: 'YERTYERTY',
        newCustomer: true,
        delivery: 'España',
        customer: 'A. Sánchez Veredas',
        total: '71,82 €',
        payment: 'Redsys - Bizum',
        status: 'Pago aceptado',
        date: '09/04/2025 19:30:32'
    },
    {
        id: 5455,
        reference: 'FGHJGFHJGFHJ',
        newCustomer: true,
        delivery: 'España',
        customer: 'A. Sánchez Veredas',
        total: '71,82 €',
        payment: 'Redsys - Bizum',
        status: 'Pago aceptado',
        date: '09/04/2025 19:30:32'
    },
    {
        id: 5456,
        reference: 'ZXCVBNM',
        newCustomer: false,
        delivery: 'España',
        customer: 'M. López García',
        total: '150,00 €',
        payment: 'Transferencia bancaria',
        status: 'Pendiente de pago',
        date: '10/04/2025 10:15:45'
    },
    {
        id: 5457,
        reference: 'QWERTYUI',
        newCustomer: true,
        delivery: 'España',
        customer: 'J. Pérez Martínez',
        total: '200,50 €',
        payment: 'Redsys - Tarjeta',
        status: 'Pago aceptado',
        date: '10/04/2025 12:45:30'
    },
    {
        id: 5458,
        reference: 'ASDFGHJK',
        newCustomer: false,
        delivery: 'España',
        customer: 'L. García Fernández',
        total: '89,99 €',
        payment: 'Redsys - Bizum',
        status: 'Enviado',
        date: '10/04/2025 14:20:10'
    },
    {
        id: 5459,
        reference: 'POIUYTRE',
        newCustomer: true,
        delivery: 'España',
        customer: 'C. Martínez Ruiz',
        total: '120,00 €',
        payment: 'Redsys - Tarjeta',
        status: 'Devuelto',
        date: '10/04/2025 16:05:00'
    },
    {
        id: 5460,
        reference: 'LKJHGFDS',
        newCustomer: false,
        delivery: 'España',
        customer: 'R. Sánchez López',
        total: '300,00 €',
        payment: 'Transferencia bancaria',
        status: 'Pago aceptado',
        date: '10/04/2025 18:30:25'
    },
    {
        id: 5461,
        reference: 'MNBVCXZ',
        newCustomer: true,
        delivery: 'España',
        customer: 'P. Gómez Torres',
        total: '50,00 €',
        payment: 'Redsys - Bizum',
        status: 'Pendiente de pago',
        date: '10/04/2025 20:15:40'
    },
];
export default function OrdersTabs() {
    const [activeTab, setActiveTab] = useState('Todos');
    const [filters, setFilters] = useState({
        searchId: '',
        searchReference: '',
        searchCustomer: '',
        searchTotal: '',
        searchPayment: '',
        dateFrom: '',
        dateTo: ''
    });
    const tabs = ['Todos', 'Pendientes', 'Pagados', 'Enviados', 'Devueltos'];
    const filteredOrders = orders.filter((order) => {
        if (activeTab === 'Todos') return true;
        if (activeTab === 'Pendientes') return order.status === 'Pendiente de pago';
        if (activeTab === 'Pagados') return order.status === 'Pago aceptado';
        if (activeTab === 'Enviados') return order.status === 'Enviado';
        if (activeTab === 'Devueltos') return order.status === 'Devuelto';
        return false;
    });
    return (
        <div>
            {/* Tabs Navigation */}
            <div className="flex border-b border-b-gray-200 border-gray-200 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-medium text-sm ${activeTab === tab
                            ? 'border-b-2 border-[#00B0C8] text-[#00B0C8]'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab} {tab === 'Todos' ? `(${orders.length})` : `(${orders.filter(order => {
                            if (tab === 'Pendientes') return order.status === 'Pendiente de pago';
                            if (tab === 'Pagados') return order.status === 'Pago aceptado';
                            if (tab === 'Enviados') return order.status === 'Enviado';
                            if (tab === 'Devueltos') return order.status === 'Devuelto';
                            return false;
                        }).length})`}
                    </button>
                ))}
            </div>
            {/* Orders Table */}
            <OrdersTable orders={filteredOrders} filters={filters} setFilters={setFilters} />
        </div>
    );
}
