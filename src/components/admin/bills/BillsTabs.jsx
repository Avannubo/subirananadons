'use client';
import { useState, useEffect } from 'react';
import BillsTable from '@/components/admin/bills/BillsTable';
import TabNavigation from '@/components/admin/shared/TabNavigation';
import { toast } from 'react-hot-toast';
export default function BillsTabs() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
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
    const tabs = ['Todas', 'Pendientes', 'Pagadas'];    // Fetch invoices
    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const url = new URL('/api/invoices', window.location.origin);
            if (activeTab !== 'Todas') {
                url.searchParams.append('status', activeTab);
            }
            if (filters.issueDateFrom) {
                url.searchParams.append('from', filters.issueDateFrom);
            }
            if (filters.issueDateTo) {
                url.searchParams.append('to', filters.issueDateTo);
            }
            const response = await fetch(url);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.details || data.error || 'Error fetching invoices');
            }
            if (!Array.isArray(data)) {
                console.error('Unexpected data format:', data);
                throw new Error('Invalid data format received from server');
            }
            setBills(data);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            toast.error(`Error al cargar las facturas: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };
    // Fetch invoices when tab or filters change
    useEffect(() => {
        fetchInvoices();
    }, [activeTab, filters.issueDateFrom, filters.issueDateTo]);
    const filteredBills = bills.filter((bill) => {
        // Apply local filters
        if (filters.searchId && !bill.id.toString().includes(filters.searchId)) return false;
        if (filters.searchReference && !bill.reference.toLowerCase().includes(filters.searchReference.toLowerCase())) return false;
        if (filters.searchCustomer && !bill.customer.toLowerCase().includes(filters.searchCustomer.toLowerCase())) return false;
        if (filters.searchTotal && !bill.total.includes(filters.searchTotal)) return false;
        if (filters.searchPaymentMethod && !bill.paymentMethod.toLowerCase().includes(filters.searchPaymentMethod.toLowerCase())) return false;
        return true;
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
            />            {/* Bills Table */}
            <BillsTable
                bills={filteredBills}
                filters={filters}
                setFilters={setFilters}
                loading={loading}
            />
        </div>
    );
}
