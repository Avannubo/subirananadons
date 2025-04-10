'use client';
import { FiSearch, FiFilter, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import { useState } from 'react';

export default function BillsTable({ bills = [], filters, setFilters }) {
    const handleFilterChange = (field, value) => {
        setFilters({ ...filters, [field]: value });
    };

    const clearFilters = () => {
        setFilters({
            searchId: '',
            searchReference: '',
            searchCustomer: '',
            searchTotal: '',
            searchPaymentMethod: '',
            issueDateFrom: '',
            issueDateTo: ''
        });
    };

    // Apply filters to bills
    const filteredBills = bills.filter(bill => {
        const idMatch = bill.id.toString().includes(filters.searchId);
        const referenceMatch = bill.reference.toLowerCase().includes(filters.searchReference.toLowerCase());
        const customerMatch = bill.customer.toLowerCase().includes(filters.searchCustomer.toLowerCase());
        const totalMatch = bill.total.toLowerCase().includes(filters.searchTotal.toLowerCase());
        const paymentMatch = bill.paymentMethod.toLowerCase().includes(filters.searchPaymentMethod.toLowerCase());

        const dateMatch =
            (filters.issueDateFrom === '' || new Date(bill.issueDate.split('/').reverse().join('-')) >= new Date(filters.issueDateFrom)) &&
            (filters.issueDateTo === '' || new Date(bill.issueDate.split('/').reverse().join('-')) <= new Date(filters.issueDateTo));

        return idMatch && referenceMatch && customerMatch && totalMatch && paymentMatch && dateMatch;
    });

    return (
        <div className="bg-white rounded-lg shadow">
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
                            onChange={(e) => handleFilterChange('searchId', e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar referencia"
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                            value={filters.searchReference}
                            onChange={(e) => handleFilterChange('searchReference', e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar cliente"
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                            value={filters.searchCustomer}
                            onChange={(e) => handleFilterChange('searchCustomer', e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar total"
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                            value={filters.searchTotal}
                            onChange={(e) => handleFilterChange('searchTotal', e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar método de pago"
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                            value={filters.searchPaymentMethod}
                            onChange={(e) => handleFilterChange('searchPaymentMethod', e.target.value)}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                        <input
                            type="date"
                            className="border border-gray-300 rounded p-2 w-full"
                            value={filters.issueDateFrom}
                            onChange={(e) => handleFilterChange('issueDateFrom', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                        <input
                            type="date"
                            className="border border-gray-300 rounded p-2 w-full"
                            value={filters.issueDateTo}
                            onChange={(e) => handleFilterChange('issueDateTo', e.target.value)}
                        />
                    </div>
                    <div className="flex items-end space-x-2">
                        <button className="flex items-center px-4 py-2 bg-[#00B0C8] text-white rounded hover:bg-[#00B0C880]">
                            <FiFilter className="mr-2" />
                            Buscar
                        </button>
                        <button
                            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                            onClick={clearFilters}
                        >
                            Limpiar
                        </button>
                    </div>
                </div>
            </div>

            {/* Bills Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referencia</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método de Pago</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha emisión</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha vencimiento</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredBills.length > 0 ? (
                            filteredBills.map(bill => (
                                <tr key={bill.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bill.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bill.reference}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bill.customer}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bill.total}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bill.paymentMethod}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bill.status === 'Pagada' ? 'bg-green-100 text-green-800' :
                                            'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {bill.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bill.issueDate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bill.dueDate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button className="text-[#00B0C8] hover:text-[#00B0C870]">
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
                                <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                                    No se encontraron facturas
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
                            Mostrando <span className="font-medium">1</span> a <span className="font-medium">{filteredBills.length}</span> de <span className="font-medium">{filteredBills.length}</span> resultados
                        </p>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                <span className="sr-only">Anterior</span>
                                &larr;
                            </button>
                            <button aria-current="page" className="z-10 bg-blue-50 border-[#00B0C8] text-[#00B0C8] relative inline-flex items-center px-4 py-2 border text-sm font-medium">
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