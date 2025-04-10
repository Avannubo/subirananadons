'use client';
import { useState } from 'react';
import BillsTable from '@/components/admin/bills/BillsTable';

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
                        {tab} {tab === 'Todas' ? `(${bills.length})` : `(${bills.filter(bill => {
                            if (tab === 'Pendientes') return bill.status === 'Pendiente';
                            if (tab === 'Pagadas') return bill.status === 'Pagada';
                            return false;
                        }).length})`}
                    </button>
                ))}
            </div>
            {/* Bills Table */}
            <BillsTable bills={filteredBills} filters={filters} setFilters={setFilters} />
        </div>
    );
}
