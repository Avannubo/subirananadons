'use client';
import { useState, useEffect } from 'react';
import OrdersTable from '@/components/admin/orders/OrdersTable';
import { FiDownload, FiRefreshCw, FiCalendar, FiChevronDown } from 'react-icons/fi';
import { useOrders } from '@/hooks/useOrders';

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

    // Initial fetch of all orders when component mounts
    useEffect(() => {
        fetchOrders(pagination.currentPage, pagination.limit, filters);
    }, []);

    // Fetch orders when filters change
    useEffect(() => {
        // We can add search parameters to the fetchOrders call
        fetchOrders(pagination.currentPage, pagination.limit, filters);
    }, [filters.dateFrom, filters.dateTo]); // Refresh when date filters change

    const handleRefresh = async () => {
        await fetchOrders(pagination.currentPage, pagination.limit, filters);
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
                    ID: index+1,
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

        // If it's a date filter, immediately update
        if (name === 'dateFrom' || name === 'dateTo') {
            fetchOrders(pagination.currentPage, pagination.limit, newFilters);
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

                        <div className="relative inline-block">
                            <button
                                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                                className="px-3 py-2 bg-[#00B0C8] hover:bg-[#008da0] text-white rounded-md flex items-center text-sm"
                                disabled={isExporting || loading}
                            >
                                <FiDownload className="mr-2" /> Exportar
                            </button>
                            {exportDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                                    <button
                                        onClick={() => {
                                            handleExport('csv');
                                            setExportDropdownOpen(false);
                                        }}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                        disabled={isExporting || loading}
                                    >
                                        Exportar a CSV
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleExport('excel');
                                            setExportDropdownOpen(false);
                                        }}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                        disabled={isExporting || loading}
                                    >
                                        Exportar a Excel
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleExport('pdf');
                                            setExportDropdownOpen(false);
                                        }}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                        disabled={isExporting || loading}
                                    >
                                        Exportar a PDF
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex space-x-4 items-center">
                        {/* Range Selector Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setRangeDropdownOpen(!rangeDropdownOpen)}
                                className="px-3 border border-gray-300 py-2 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center text-sm"
                            >
                                <FiCalendar className="mr-2" />
                                Rango
                                <FiChevronDown className="ml-2" />
                            </button>

                            {rangeDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                                    <button
                                        onClick={() => {
                                            setFilters({ ...filters, dateFrom: '', dateTo: '' });
                                            fetchOrders(pagination.currentPage, pagination.limit, { ...filters, dateFrom: '', dateTo: '' });
                                            setRangeDropdownOpen(false);
                                        }}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                        Mostrar todos
                                    </button>
                                    <button
                                        onClick={() => applyDateRange(1)}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                        Hoy
                                    </button>
                                    <button
                                        onClick={() => applyDateRange(30)}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                        Último mes
                                    </button>
                                    <button
                                        onClick={() => applyDateRange(180)}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                        Últimos 6 meses
                                    </button>
                                    <button
                                        onClick={() => applyDateRange(365)}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                        Último año
                                    </button>
                                </div>
                            )}
                        </div>

                        <div>
                            <input
                                type="date"
                                name="dateFrom"
                                value={filters.dateFrom}
                                onChange={handleFilterChange}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                placeholder="Desde"
                            />
                        </div>
                        <div>
                            <input
                                type="date"
                                name="dateTo"
                                value={filters.dateTo}
                                onChange={handleFilterChange}
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
                        {tab}

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
