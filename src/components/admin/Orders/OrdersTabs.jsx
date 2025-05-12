'use client';
import { useState, useEffect } from 'react';
import OrdersTable from '@/components/admin/orders/OrdersTable';
import { FiDownload, FiRefreshCw, FiCalendar, FiChevronDown, FiFilter, FiSearch, FiPlus } from 'react-icons/fi';
import { useOrders } from '@/hooks/useOrders';
import TabNavigation from '@/components/admin/shared/TabNavigation';
import { toast } from 'react-hot-toast';

export default function OrdersTabs({ userRole = 'user' }) {
    const [activeTab, setActiveTab] = useState('Todos');
    const [isExporting, setIsExporting] = useState(false);
    const [rangeDropdownOpen, setRangeDropdownOpen] = useState(false);
    const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
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

    const tabs = ['Todos', 'Pendientes', 'Procesando', 'Completados', 'Cancelados'];

    // Initial fetch of all orders when component mounts
    useEffect(() => {
        console.log(`OrdersTabs mounted with userRole: ${userRole}`);
        fetchOrders(pagination.currentPage, pagination.limit);
    }, [userRole]); // Adding userRole as a dependency to ensure re-fetch if user role changes

    // Fetch orders when filters change
    useEffect(() => {
        // We can add search parameters to the fetchOrders call
        fetchOrders(pagination.currentPage, pagination.limit, filters);
    }, [filters.dateFrom, filters.dateTo]); // Refresh when date filters change

    const handleRefresh = async () => {
        await fetchOrders(pagination.currentPage, pagination.limit, filters);
        toast.success('Datos actualizados correctamente');
    };

    const handleExport = async (format) => {
        setIsExporting(true);
        try {
            // Prepare data for export - use the same filtered data shown in the table
            const exportData = filteredOrders.map((order, index) => {
                // Get customer data safely with fallbacks
                const customerName = order.customer && order.customer.name ? order.customer.name : 'N/A';
                const customerEmail = order.customer && order.customer.email ? order.customer.email : 'N/A';

                return {
                    ID: index + 1,
                    Referencia: order.reference || 'N/A',
                    Cliente: customerName,
                    Email: customerEmail,
                    Fecha: order.date || 'N/A',
                    Total: order.total ? `${order.total}` : '0.00 €',
                    Estado: order.status || 'N/A',
                    'Método de Pago': order.payment_method || 'N/A'
                };
            });

            // Helper function for Excel and PDF to format the table
            const generateTableHtml = () => {
                return `
                    <style>
                        table { 
                            border-collapse: collapse; 
                            width: 100%; 
                            margin-top: 20px;
                            font-family: Arial, sans-serif;
                        }
                        th, td { 
                            border: 1px solid #ddd; 
                            padding: 8px; 
                            text-align: left;
                        }
                        th { 
                            background-color: #00B0C8; 
                            color: white; 
                            font-weight: bold;
                        }
                        tr:nth-child(even) {
                            background-color: #f9f9f9;
                        }
                        h1 { 
                            color: #00B0C8; 
                            font-family: Arial, sans-serif;
                        }
                    </style>
                    <table>
                        <thead>
                            <tr>
                                ${Object.keys(exportData[0]).map(key => `<th>${key}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${exportData.map(row => `
                                <tr>
                                    ${Object.values(row).map(value => `<td>${value}</td>`).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            };

            if (format === 'csv') {
                // Create CSV string with proper escaping for values containing commas or quotes
                const headers = Object.keys(exportData[0]);

                // Function to escape CSV values
                const escapeCSV = (value) => {
                    if (value === null || value === undefined) return '';
                    const str = String(value);
                    // If the value contains commas, quotes, or newlines, wrap in quotes and escape any quotes
                    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                        return `"${str.replace(/"/g, '""')}"`;
                    }
                    return str;
                };

                const csvHeader = headers.map(escapeCSV).join(',');
                const csvRows = exportData.map(row =>
                    headers.map(header => escapeCSV(row[header])).join(',')
                );

                const csvContent = [csvHeader, ...csvRows].join('\n');

                // Create download link
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                triggerDownload(url, 'pedidos.csv');
            } else if (format === 'excel') {
                // Simple HTML table export as alternative to xlsx library
                const html = `
                    <html>
                        <head>
                            <meta charset="UTF-8">
                            <title>Pedidos</title>
                        </head>
                        <body>
                            <h1>Listado de Pedidos</h1>
                            <p>Fecha de exportación: ${new Date().toLocaleDateString()}</p>
                            ${generateTableHtml()}
                        </body>
                    </html>
                `;

                const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                triggerDownload(url, 'pedidos.xls');
            } else if (format === 'pdf') {
                // Create a hidden iframe to print PDF
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                document.body.appendChild(iframe);

                // Create PDF content as HTML
                const html = `
                    <html>
                        <head>
                            <meta charset="UTF-8">
                            <title>Pedidos</title>
                            <style>
                                body { 
                                    font-family: Arial, sans-serif;
                                    padding: 20px;
                                }
                                @media print {
                                    body { 
                                        margin: 0; 
                                        padding: 15px; 
                                    }
                                    button { 
                                        display: none; 
                                    }
                                }
                            </style>
                        </head>
                        <body>
                            <h1>Listado de Pedidos</h1>
                            <p>Fecha de exportación: ${new Date().toLocaleDateString()}</p>
                            ${generateTableHtml()}
                            <div style="text-align: center; margin-top: 30px;">
                                <button onclick="window.print(); window.close();" style="padding: 10px 20px; background-color: #00B0C8; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                    Imprimir PDF
                                </button>
                            </div>
                        </body>
                    </html>
                `;

                // Write to iframe and trigger print
                iframe.contentWindow.document.open();
                iframe.contentWindow.document.write(html);
                iframe.contentWindow.document.close();

                // Once it's loaded, print it
                iframe.onload = function () {
                    setTimeout(() => {
                        iframe.contentWindow.print();
                        // Clean up iframe after printing dialog is closed
                        setTimeout(() => {
                            document.body.removeChild(iframe);
                        }, 1000);
                    }, 500);
                };
            }
        } catch (err) {
            console.error('Error exporting orders:', err);
            alert('Error al exportar los pedidos: ' + err.message);
        } finally {
            setIsExporting(false);
        }
    };

    // Helper function to trigger download
    const triggerDownload = (url, filename) => {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        // Clean up
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    };

    // Apply date range filter and automatically refresh
    const applyDateRange = (days) => {
        const today = new Date();
        const fromDate = new Date();
        fromDate.setDate(today.getDate() - days);

        const newFilters = {
            ...filters,
            dateFrom: fromDate.toISOString().split('T')[0],
            dateTo: today.toISOString().split('T')[0]
        };

        setFilters(newFilters);
        setRangeDropdownOpen(false);

        // Immediately refresh with new filters
        fetchOrders(pagination.currentPage, pagination.limit, newFilters);
    };

    // Update filters and refresh table
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
    };

    // Apply filters
    const applyFilters = () => {
        setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
        fetchOrders(pagination.currentPage, pagination.limit, filters);
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            searchId: '',
            searchReference: '',
            searchCustomer: '',
            searchTotal: '',
            searchPayment: '',
            dateFrom: '',
            dateTo: ''
        });

        // Reset page and fetch
        setPagination(prev => ({ ...prev, currentPage: 1 }));
        fetchOrders(pagination.currentPage, pagination.limit, {
            searchId: '',
            searchReference: '',
            searchCustomer: '',
            searchTotal: '',
            searchPayment: '',
            dateFrom: '',
            dateTo: ''
        });
    };

    // Filter orders based on active tab
    const filteredOrders = orders.filter(order => {
        console.log(`Filtering order with status: "${order.status}" against active tab: "${activeTab}"`);
        if (activeTab === 'Todos') return true;
        if (activeTab === 'Pendientes') return order.status === 'Pendiente de pago';
        if (activeTab === 'Procesando') return order.status === 'Pago aceptado';
        if (activeTab === 'Completados') return order.status === 'Enviado' || order.status === 'Entregado';
        if (activeTab === 'Cancelados') return order.status === 'Cancelado';
        return false;
    });

    // Prepare counts for the TabNavigation component
    const orderCounts = {
        'Todos': orders.length,
        'Pendientes': orders.filter(order => order.status === 'Pendiente de pago').length,
        'Procesando': orders.filter(order => order.status === 'Pago aceptado').length,
        'Completados': orders.filter(order => (order.status === 'Enviado' || order.status === 'Entregado')).length,
        'Cancelados': orders.filter(order => order.status === 'Cancelado').length
    };

    console.log('Order tab counts:', orderCounts);

    return (
        <>
            <TabNavigation
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                counts={orderCounts}
            />

            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center">
                        <h2 className="text-lg font-medium">Gestión de Pedidos ({pagination.totalItems || filteredOrders.length})</h2>
                        <button
                            className="ml-2 text-gray-500 hover:text-gray-700 h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                            onClick={handleRefresh}
                            disabled={loading}
                            title="Actualizar datos"
                        >
                            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            className="flex items-center px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
                            onClick={() => handleExport('csv')}
                            disabled={isExporting || loading}
                            title="Exportar a CSV"
                        >
                            <FiDownload className="mr-1" /> Exportar
                        </button>
                        <button
                            className="flex items-center px-3 py-2 bg-[#00B0C8] text-white rounded text-sm hover:bg-[#00B0C890] transition-colors"
                            onClick={() => {/* Handle new order */ }}
                            title="Añadir nuevo pedido"
                        >
                            <FiPlus className="mr-1" /> Nuevo Pedido
                        </button>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="p-4 border-b border-gray-200 grid md:grid-cols-4 gap-4">
                    <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar ID"
                                name="searchId"
                                value={filters.searchId}
                                onChange={handleFilterChange}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                            />
                        </div>
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar Referencia"
                                name="searchReference"
                                value={filters.searchReference}
                                onChange={handleFilterChange}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                            />
                        </div>
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar Cliente"
                                name="searchCustomer"
                                value={filters.searchCustomer}
                                onChange={handleFilterChange}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                            />
                        </div>
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar Total"
                                name="searchTotal"
                                value={filters.searchTotal}
                                onChange={handleFilterChange}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                            />
                        </div>
                    </div>

                    <div className="flex sm:flex-row flex-col justify-start gap-2">
                        <button
                            className="flex items-center justify-center px-4 py-2 bg-[#00B0C8] text-white rounded hover:bg-[#00B0C890]"
                            onClick={applyFilters}
                            title="Aplicar filtros"
                        >
                            <FiFilter className="mr-2" />
                            Filtrar
                        </button>
                        <button
                            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                            onClick={clearFilters}
                            title="Limpiar filtros"
                        >
                            Limpiar
                        </button>
                    </div>
                </div>

                {/* Order data table */}
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-t-2 border-[#00B0C8]"></div>
                        <p className="mt-3 text-gray-600">Cargando pedidos...</p>
                    </div>
                ) : (
                    <OrdersTable
                        orders={filteredOrders}
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
                )}
            </div>
        </>
    );
}
