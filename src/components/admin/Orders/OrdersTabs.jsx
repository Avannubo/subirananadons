'use client';
import { useState, useEffect } from 'react';
import OrdersTable from '@/components/admin/orders/OrdersTable';
import { FiDownload, FiRefreshCw, FiCalendar, FiChevronDown, FiFilter, FiSearch, FiPlus } from 'react-icons/fi';
import { useOrders } from '@/hooks/useOrders';
import { toast } from 'react-hot-toast';
export default function OrdersTabs({ userRole = 'user' }) {
    // Locale detection (default to 'ca')
    let locale = 'ca';
    if (typeof window !== 'undefined' && window.navigator) {
        const lang = window.navigator.language || window.navigator.userLanguage;
        if (lang && lang.toLowerCase().startsWith('es')) locale = 'es';
    }

    // Translations
    const translations = {
        ca: {
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

    const t = translations[locale];

    // Removed tab navigation logic
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
        //console.log(`OrdersTabs mounted with userRole: ${userRole}`);
        fetchOrders(pagination.currentPage, pagination.limit);
    }, [userRole]);
    // Fetch orders when filters change
    useEffect(() => {
        fetchOrders(pagination.currentPage, pagination.limit, filters);
    }, [filters.dateFrom, filters.dateTo]);
    const handleRefresh = async () => {
        await fetchOrders(pagination.currentPage, pagination.limit, filters);
        toast.success(t.updated);
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
                    [t.id]: index + 1,
                    [t.reference]: order.reference || 'N/A',
                    [t.client]: customerName,
                    [t.email]: customerEmail,
                    [t.date]: order.date || 'N/A',
                    [t.total]: order.total ? `${order.total}` : '0.00 €',
                    [t.status]: order.status || 'N/A',
                    [t.paymentMethod]: order.payment_method || 'N/A'
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
                            background-color: #36A9E1; 
                            color: white; 
                            font-weight: bold;
                        }
                        tr:nth-child(even) {
                            background-color: #f9f9f9;
                        }
                        h1 { 
                            color: #36A9E1; 
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
                const headers = Object.keys(exportData[0]);
                const escapeCSV = (value) => {
                    if (value === null || value === undefined) return '';
                    const str = String(value);
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
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                triggerDownload(url, `${t.orderManagement.toLowerCase().replace(/ /g, '_')}.csv`);
            } else if (format === 'excel') {
                const html = `
                    <html>
                        <head>
                            <meta charset="UTF-8">
                            <title>${t.exportTitle}</title>
                        </head>
                        <body>
                            <h1>${t.exportTitle}</h1>
                            <p>${t.exportDate}: ${new Date().toLocaleDateString()}</p>
                            ${generateTableHtml()}
                        </body>
                    </html>
                `;
                const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                triggerDownload(url, `${t.orderManagement.toLowerCase().replace(/ /g, '_')}.xls`);
            } else if (format === 'pdf') {
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
                const html = `
                    <html>
                        <head>
                            <meta charset="UTF-8">
                            <title>${t.exportTitle}</title>
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
                            <h1>${t.exportTitle}</h1>
                            <p>${t.exportDate}: ${new Date().toLocaleDateString()}</p>
                            ${generateTableHtml()}
                            <div style="text-align: center; margin-top: 30px;">
                                <button onclick="window.print(); window.close();" style="padding: 10px 20px; background-color: #36A9E1; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                    ${t.printPDF}
                                </button>
                            </div>
                        </body>
                    </html>
                `;
                iframe.contentWindow.document.open();
                iframe.contentWindow.document.write(html);
                iframe.contentWindow.document.close();
                iframe.onload = function () {
                    setTimeout(() => {
                        iframe.contentWindow.print();
                        setTimeout(() => {
                            document.body.removeChild(iframe);
                        }, 1000);
                    }, 500);
                };
            }
        } catch (err) {
            console.error('Error exporting orders:', err);
            alert(t.errorExport + err.message);
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
    // No tab filtering, show all orders
    const filteredOrders = orders;

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center">
                    <h2 className="text-lg font-medium">{t.orderManagement} ({pagination.totalItems || filteredOrders.length})</h2>
                    <button
                        className="ml-2 text-gray-500 hover:text-gray-700 h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer"
                        onClick={handleRefresh}
                        disabled={loading}
                        title={t.refresh}
                    >
                        <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
                <div className="flex space-x-2">
                    {/* <button
                            className="flex items-center px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
                            onClick={() => handleExport('pdf')}
                            disabled={isExporting || loading}
                            title={t.exportCSV}
                        >
                            <FiDownload className="mr-1" /> {t.export}
                        </button> */}
                    {/* {userRole === 'admin' && (
                            <button
                                className="flex items-center px-3 py-2 bg-[#36A9E1] text-white rounded text-sm hover:bg-[#00B0C890] transition-colors"
                                onClick={() =>  }
                                title="Añadir nuevo pedido"
                            >
                                <FiPlus className="mr-1" /> Nuevo Pedido
                            </button>)} */}
                </div>
            </div>
            {/* Search and Filters */}
            {/* <div className="p-4 border-b border-gray-200 grid md:grid-cols-4 gap-4">
                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {/* <div className="relative">
                            <FiSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t.searchId}
                                name="searchId"
                                value={filters.searchId}
                                onChange={handleFilterChange}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                            />
                        </div> */}
            {/* <div className="relative">
                        <FiSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t.searchReference}
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
                            placeholder={t.searchCustomer}
                            name="searchCustomer"
                            value={filters.searchCustomer}
                            onChange={handleFilterChange}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                        />
                    </div> */}
            {/* <div className="relative">
                            <FiSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t.searchTotal}
                                name="searchTotal"
                                value={filters.searchTotal}
                                onChange={handleFilterChange}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                            />
                        </div>  
                </div>
            </div>
             */}
            {/* Order data table */}
            {loading ? (
                <div className="py-20 text-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-t-2 border-[#36A9E1]"></div>
                    <p className="mt-3 text-gray-600">{t.loading}</p>
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
    );
}
