'use client';
import { FiSearch, FiFilter, FiEdit, FiTrash2, FiEye, FiChevronDown } from 'react-icons/fi';
import { useState } from 'react';

export default function OrdersTable({ orders = [] }) {
    const [activeTab, setActiveTab] = useState('all');
    const [filters, setFilters] = useState({
        searchId: '',
        searchReference: '',
        searchCustomer: '',
        searchTotal: '',
        searchPayment: '',
        dateFrom: '',
        dateTo: ''
    });

    // Filter orders based on active tab and search criteria
    const filteredOrders = orders.filter(order => {
        // Status filter
        const statusMatch =
            activeTab === 'all' ||
            (activeTab === 'pending' && order.status === 'Pendiente') ||
            (activeTab === 'paid' && order.status === 'Pago aceptado') ||
            (activeTab === 'shipped' && order.status === 'Enviado') ||
            (activeTab === 'returned' && order.status === 'Devuelto');

        // Search filters
        const searchMatch =
            order.id.toString().includes(filters.searchId) &&
            order.reference.toLowerCase().includes(filters.searchReference.toLowerCase()) &&
            order.customer.toLowerCase().includes(filters.searchCustomer.toLowerCase()) &&
            order.total.toLowerCase().includes(filters.searchTotal.toLowerCase()) &&
            order.payment.toLowerCase().includes(filters.searchPayment.toLowerCase());

        // Date filters
        const dateMatch =
            (filters.dateFrom === '' || new Date(order.date) >= new Date(filters.dateFrom)) &&
            (filters.dateTo === '' || new Date(order.date) <= new Date(filters.dateTo));

        return statusMatch && searchMatch && dateMatch;
    });

    // Count orders by status
    const statusCounts = {
        all: orders.length,
        pending: orders.filter(o => o.status === 'Pendiente').length,
        paid: orders.filter(o => o.status === 'Pago aceptado').length,
        shipped: orders.filter(o => o.status === 'Enviado').length,
        returned: orders.filter(o => o.status === 'Devuelto').length
    };

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Status Tabs */}
            <div className="flex border-b border-gray-200">
                {[
                    { id: 'all', label: 'Todos' },
                    { id: 'pending', label: 'Pendientes' },
                    { id: 'paid', label: 'Pagados' },
                    { id: 'shipped', label: 'Enviados' },
                    { id: 'returned', label: 'Devueltos' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-3 text-sm font-medium ${activeTab === tab.id
                            ? 'border-b-2 border-blue-500 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab.label} ({statusCounts[tab.id]})
                    </button>
                ))}
            </div>

            {/* Search and Filters */}
            <div className="p-4 border-b border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar ID"
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                            value={filters.searchId}
                            onChange={(e) => setFilters({ ...filters, searchId: e.target.value })}
                        />
                    </div>
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar referencia"
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                            value={filters.searchReference}
                            onChange={(e) => setFilters({ ...filters, searchReference: e.target.value })}
                        />
                    </div>
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar cliente"
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                            value={filters.searchCustomer}
                            onChange={(e) => setFilters({ ...filters, searchCustomer: e.target.value })}
                        />
                    </div>
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar total"
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                            value={filters.searchTotal}
                            onChange={(e) => setFilters({ ...filters, searchTotal: e.target.value })}
                        />
                    </div>
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar pago"
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                            value={filters.searchPayment}
                            onChange={(e) => setFilters({ ...filters, searchPayment: e.target.value })}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                        <input
                            type="date"
                            className="border border-gray-300 rounded p-2 w-full"
                            value={filters.dateFrom}
                            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                        <input
                            type="date"
                            className="border border-gray-300 rounded p-2 w-full"
                            value={filters.dateTo}
                            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                        />
                    </div>
                    <div className="flex items-end space-x-2">
                        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            <FiFilter className="mr-2" />
                            Buscar
                        </button>
                        <button
                            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                            onClick={() => setFilters({
                                searchId: '',
                                searchReference: '',
                                searchCustomer: '',
                                searchTotal: '',
                                searchPayment: '',
                                dateFrom: '',
                                dateTo: ''
                            })}
                        >
                            Limpiar
                        </button>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referencia</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nuevo cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entrega</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pago</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map(order => (
                                <tr key={order.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.reference}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.newCustomer ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {order.newCustomer ? 'Sí' : 'No'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.delivery}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.total}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.payment}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Pago aceptado' ? 'bg-green-100 text-green-800' :
                                                order.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                                    order.status === 'Enviado' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-red-100 text-red-800'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button className="text-blue-600 hover:text-blue-900">
                                                <FiEye />
                                            </button>
                                            <button className="text-yellow-600 hover:text-yellow-900">
                                                <FiEdit />
                                            </button>
                                            <button className="text-red-600 hover:text-red-900">
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10" className="px-6 py-4 text-center text-sm text-gray-500">
                                    No se encontraron pedidos
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Mostrando <span className="font-medium">1</span> a <span className="font-medium">{filteredOrders.length}</span> de <span className="font-medium">{filteredOrders.length}</span> resultados
                        </p>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                <span className="sr-only">Anterior</span>
                                &larr;
                            </button>
                            <button aria-current="page" className="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                                1
                            </button>
                            <button className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                                2
                            </button>
                            <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                <span className="sr-only">Siguiente</span>
                                &rarr;
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
}