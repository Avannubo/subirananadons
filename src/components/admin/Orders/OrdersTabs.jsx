'use client';
import { useState, useEffect } from 'react';
import OrdersTable from '@/components/admin/orders/OrdersTable';
import { FiDownload, FiRefreshCw } from 'react-icons/fi';
import { useOrders } from '@/hooks/useOrders';

export default function OrdersTabs({ userRole = 'user' }) {
    const [activeTab, setActiveTab] = useState('Todos');
    const [isExporting, setIsExporting] = useState(false);
    const [filters, setFilters] = useState({
        searchId: '',
        searchReference: '',
        searchCustomer: '',
        searchTotal: '',
        searchPayment: '',
        dateFrom: '',
        dateTo: ''
    });

    // Use our orders hook to fetch and manage orders
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

    const handleRefresh = async () => {
        await fetchOrders(pagination.currentPage, pagination.limit);
    };

    const handleExport = async (format) => {
        setIsExporting(true);
        try {
            // In a real app, this would call an API endpoint to generate and download a file
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            alert(`Exportando pedidos en formato ${format}`);
        } catch (err) {
            console.error('Error exporting orders:', err);
        } finally {
            setIsExporting(false);
        }
    };

    // Filter orders based on active tab and search filters
    const filteredOrders = orders.filter((order) => {
        // Basic tab filtering
        if (activeTab !== 'Todos') {
            if (activeTab === 'Pendientes' && order.status !== 'Pendiente de pago') return false;
            if (activeTab === 'Pagados' && order.status !== 'Pago aceptado') return false;
            if (activeTab === 'Enviados' && order.status !== 'Enviado') return false;
            if (activeTab === 'Devueltos' && order.status !== 'Devuelto') return false;
        }

        // Date filtering
        if (filters.dateFrom || filters.dateTo) {
            const orderDate = new Date(order.date.split(' ')[0].split('/').reverse().join('-'));

            if (filters.dateFrom) {
                const fromDate = new Date(filters.dateFrom);
                if (orderDate < fromDate) return false;
            }

            if (filters.dateTo) {
                const toDate = new Date(filters.dateTo);
                if (orderDate > toDate) return false;
            }
        }

        return true;
    });

    // Calculate tab counts
    const tabCounts = {
        'Todos': orders.length,
        'Pendientes': orders.filter(order => order.status === 'Pendiente de pago').length,
        'Pagados': orders.filter(order => order.status === 'Pago aceptado').length,
        'Enviados': orders.filter(order => order.status === 'Enviado').length,
        'Devueltos': orders.filter(order => order.status === 'Devuelto').length
    };

    // Define tabs
    const tabs = ['Todos', 'Pendientes', 'Pagados', 'Enviados', 'Devueltos'];

    // Handle order status change from the table
    const handleStatusChange = async (orderId, newStatus) => {
        if (typeof newStatus === 'object') {
            // This is from the edit modal with full form data
            return await updateOrderDetails(orderId, newStatus);
        } else {
            // This is just a status change
            return await updateOrderStatus(orderId, newStatus);
        }
    };

    // Handle order deletion from the table
    const handleOrderDelete = async (orderId) => {
        return await deleteOrder(orderId);
    };

    return (
        <div>
            {/* Header with actions */}
            {userRole === 'admin' && (
                <div className="flex flex-col md:flex-row justify-between mb-4">
                    <div className="flex space-x-4 mb-4 md:mb-0">
                        <button
                            onClick={handleRefresh}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center text-sm"
                            disabled={loading}
                        >
                            <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                            {loading ? 'Actualizando...' : 'Actualizar'}
                        </button>

                        <div className="relative inline-block group">
                            <button
                                className="px-3 py-2 bg-[#00B0C8] hover:bg-[#008da0] text-white rounded-md flex items-center text-sm"
                                disabled={isExporting || loading}
                            >
                                <FiDownload className="mr-2" /> Exportar
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
                                <button
                                    onClick={() => handleExport('excel')}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    disabled={isExporting || loading}
                                >
                                    Exportar a Excel
                                </button>
                                <button
                                    onClick={() => handleExport('pdf')}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    disabled={isExporting || loading}
                                >
                                    Exportar a PDF
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-4">
                        <div>
                            <input
                                type="date"
                                name="dateFrom"
                                value={filters.dateFrom}
                                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                placeholder="Desde"
                            />
                        </div>
                        <div>
                            <input
                                type="date"
                                name="dateTo"
                                value={filters.dateTo}
                                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                placeholder="Hasta"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p>{error}</p>
                </div>
            )}

            {/* Tabs Navigation */}
            <div className="flex border-b border-b-gray-200 border-gray-200 mb-6 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === tab
                            ? 'border-b-2 border-[#00B0C8] text-[#00B0C8]'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab} ({tabCounts[tab]})
                    </button>
                ))}
            </div>

            {/* Loading indicator */}
            {loading && (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B0C8]"></div>
                </div>
            )}

            {/* Orders Table */}
            {!loading && (
                <OrdersTable
                    orders={filteredOrders}
                    filters={filters}
                    setFilters={setFilters}
                    userRole={userRole}
                    onStatusChange={handleStatusChange}
                    onDelete={handleOrderDelete}
                    pagination={pagination}
                    onPageChange={setCurrentPage}
                    onLimitChange={setLimit}
                />
            )}

            {/* No orders message */}
            {!loading && orders.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-500">No tienes pedidos en este momento.</p>
                </div>
            )}
        </div>
    );
}
