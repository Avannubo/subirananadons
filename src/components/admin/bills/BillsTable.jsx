'use client';
import { FiSearch, FiFilter, FiEye, FiDownload, FiTrash2 } from 'react-icons/fi';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
export default function BillsTable({ bills = [], filters, setFilters, loading = false, isAdmin = false, onBillDeleted }) {
    const [deleteModal, setDeleteModal] = useState({ open: false, bill: null });

    const openDeleteModal = (bill) => {
        setDeleteModal({ open: true, bill });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ open: false, bill: null });
    }; 

    const confirmDeleteBill = async () => {
        const billId = deleteModal.bill?.id;
        if (!billId) return;
        try {
            const response = await fetch(`/api/orders/${billId}/invoice`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error al eliminar la factura');
            }
            toast.success('Factura eliminada correctamente');
            if (onBillDeleted) {
                onBillDeleted(billId);
                
            }
        } catch (error) {
            console.error('Error deleting bill:', error);
            toast.error(error.message || 'Error al eliminar la factura');
        } finally {
            closeDeleteModal();
        }
    };
    const handleFilterChange = (field, value) => {
        setFilters({ ...filters, [field]: value });
    }; const viewPdf = async (pdfUrl) => {
        if (!pdfUrl || pdfUrl === '#') {
            toast.error('PDF no disponible');
            return;
        }
        try {
            window.open(pdfUrl, '_blank');
        } catch (error) {
            console.error('Error viewing PDF:', error);
            toast.error('Error al visualizar el PDF');
        }
    };
    const downloadPdf = async (pdfUrl) => {
        if (!pdfUrl || pdfUrl === '#') {
            toast.error('PDF no disponible para descargar');
            return;
        }
        try {
            const response = await fetch(pdfUrl);
            if (!response.ok) throw new Error('Error downloading PDF');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `factura.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Factura descargada correctamente');
        } catch (error) {
            console.error('Error downloading PDF:', error);
            toast.error('Error al descargar el PDF');
        }
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
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="9" className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00B0C8]"></div>
                                        <span className="ml-2">Cargando facturas...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredBills.length > 0 ? (
                            filteredBills.map((bill, index) => (
                                <tr key={bill.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => viewPdf(bill.pdfUrl)}
                                                className="text-[#00B0C8] hover:text-[#008A9B] flex items-center"
                                                title="Ver PDF"
                                            >
                                                <FiEye size={20} />
                                            </button>
                                            <button
                                                onClick={() => downloadPdf(bill.pdfUrl)}
                                                className="text-yellow-600 hover:text-yellow-900 flex items-center"
                                                title="Descargar PDF"
                                            >
                                                <FiDownload size={20} />
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(bill)}
                                                className="text-red-600 hover:text-red-900 flex items-center"
                                                title="Eliminar factura"
                                            >
                                                <FiTrash2 size={20} />
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
            {/* <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
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
            </div> */}
            {/* Delete Confirmation Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000050] bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
                        <h2 className="text-lg font-semibold mb-4">¿Eliminar factura?</h2>
                        <p className="mb-6">¿Estás seguro de que deseas eliminar la factura <span className="font-bold">{deleteModal.bill?.reference}</span>? Esta acción no se puede deshacer.</p>
                        <div className="flex justify-end space-x-2">
                            <button
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                onClick={closeDeleteModal}
                            >
                                Cancelar
                            </button>
                            <button
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                onClick={confirmDeleteBill}
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}