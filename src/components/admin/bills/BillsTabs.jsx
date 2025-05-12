'use client';
import { useState } from 'react';
import BillsTable from '@/components/admin/bills/BillsTable';
import TabNavigation from '@/components/admin/shared/TabNavigation';

const bills = [
    {
        id: 1001,
        reference: 'FAC2025-001',
        customer: 'S. Font-Armadans',
        total: '117,00 €',
        paymentMethod: 'Tarjeta',
        status: 'Pagada',
        issueDate: '09/04/2025',
        dueDate: '16/04/2025'
    },
    {
        id: 1002,
        reference: 'FAC2025-002',
        customer: 'A. Sánchez Veredas',
        total: '71,82 €',
        paymentMethod: 'Bizum',
        status: 'Pendiente',
        issueDate: '09/04/2025',
        dueDate: '16/04/2025'
    },
    {
        id: 1003,
        reference: 'FAC2025-003',
        customer: 'M. López García',
        total: '150,00 €',
        paymentMethod: 'Transferencia bancaria',
        status: 'Pagada',
        issueDate: '10/04/2025',
        dueDate: '17/04/2025'
    },
    {
        id: 1004,
        reference: 'FAC2025-004',
        customer: 'J. Pérez Martínez',
        total: '200,50 €',
        paymentMethod: 'Tarjeta',
        status: 'Pendiente',
        issueDate: '10/04/2025',
        dueDate: '17/04/2025'
    },
    {
        id: 1005,
        reference: 'FAC2025-005',
        customer: 'L. García Fernández',
        total: '89,99 €',
        paymentMethod: 'Bizum',
        status: 'Pagada',
        issueDate: '10/04/2025',
        dueDate: '17/04/2025'
    }
];

export default function BillsTabs() {
    const [activeTab, setActiveTab] = useState('Todas');
    const [filters, setFilters] = useState({
        searchId: '',
        searchReference: '',
        searchCustomer: '',
        searchTotal: '',
        searchPaymentMethod: '',
        issueDateFrom: '',
        issueDateTo: ''
    });

    const tabs = ['Todas', 'Pendientes', 'Pagadas'];
    const filteredBills = bills.filter((bill) => {
        if (activeTab === 'Todas') return true;
        if (activeTab === 'Pendientes') return bill.status === 'Pendiente';
        if (activeTab === 'Pagadas') return bill.status === 'Pagada';
        return false;
    });

    return (
        <div>
            {/* Tabs Navigation */}
            <TabNavigation
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                counts={{
                    'Todas': bills.length,
                    'Pendientes': bills.filter(bill => bill.status === 'Pendiente').length,
                    'Pagadas': bills.filter(bill => bill.status === 'Pagada').length
                }}
            />

            {/* Bills Table */}
            <BillsTable bills={filteredBills} filters={filters} setFilters={setFilters} />
        </div>
    );
}
