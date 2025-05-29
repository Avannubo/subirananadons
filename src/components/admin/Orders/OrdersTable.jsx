'use client';
import { FiSearch, FiFilter, FiEye, FiDownload, FiTrash2, FiEdit } from 'react-icons/fi';
import { FaRegFilePdf } from 'react-icons/fa';
import { useState, useEffect, use } from 'react';
import { toast } from 'react-hot-toast';
import Pagination from '../shared/Pagination';

import OrderDeleteModal from './OrderDeleteModal';
import OrderEditModal from './OrderEditModal';
import OrderViewModal from './OrderViewModal';
export default function OrdersTable({
    orders,
    filters,
    setFilters,
    userRole = 'user',
    onStatusChange,
    onDelete,
    pagination,
    onPageChange,
    onLimitChange
}) {
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [statusDropdown, setStatusDropdown] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        console.log(`OrdersTable received ${orders?.length || 0} orders for userRole ${userRole}`);
        console.log('Orders data:', orders);
    }, [orders, userRole]);



    const viewPdf = async (pdfUrl) => {
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

    // const downloadPdf = async (orderId) => {
    //     try {
    //         const response = await fetch(`/api/orders/${orderId}/invoice`);
    //         if (!response.ok) throw new Error('Error downloading invoice');

    //         const blob = await response.blob();
    //         const url = window.URL.createObjectURL(blob);
    //         const link = document.createElement('a');
    //         link.href = url;
    //         link.download = `factura.pdf`;
    //         document.body.appendChild(link);
    //         link.click();
    //         link.remove();
    //         window.URL.revokeObjectURL(url);
    //         toast.success('Factura descargada correctamente');
    //     } catch (error) {
    //         console.error('Error downloading invoice:', error);
    //         toast.error('Error al descargar la factura');
    //     }
    // };

    // Filter the orders based on search criteria
    const filteredOrders = orders.filter((order) => {
        return (
            (order.id?.toString() || '').includes(filters.searchId) &&
            (order.reference?.toLowerCase() || '').includes(filters.searchReference.toLowerCase()) &&
            (order.customer?.toLowerCase() || '').includes(filters.searchCustomer.toLowerCase()) &&
            (order.total || '').includes(filters.searchTotal) &&
            (order.payment?.toLowerCase() || '').includes(filters.searchPayment.toLowerCase())
        );
    });
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedOrders(filteredOrders.map(order => order.id));
        } else {
            setSelectedOrders([]);
        }
    };
    const handleSelectOrder = (id) => {
        if (selectedOrders.includes(id)) {
            setSelectedOrders(selectedOrders.filter(orderId => orderId !== id));
        } else {
            setSelectedOrders([...selectedOrders, id]);
        }
    };
    const handleBulkAction = (action) => {
        if (selectedOrders.length === 0) {
            alert('Por favor, selecciona al menos un pedido');
            return;
        }
        if (action === 'eliminar') {
            if (window.confirm(`¿Estás seguro de que deseas eliminar ${selectedOrders.length} pedidos? Esta acción no se puede deshacer.`)) {
                // Call the API to delete multiple orders
                // For now, we'll just handle each order individually
                Promise.all(selectedOrders.map(id => onDelete(id)))
                    .then(() => setSelectedOrders([]));
            }
        } else if (action === 'enviar') {
            // Call the API to mark orders as shipped
            Promise.all(selectedOrders.map(id => onStatusChange(id, 'Enviado')))
                .then(() => setSelectedOrders([]));
        } else if (action === 'archivar') {
            // This would be implemented with a real archive feature
            alert(`Archivando ${selectedOrders.length} pedidos`);
            setSelectedOrders([]);
        }
    };
    const toggleStatusDropdown = (id) => {
        if (statusDropdown === id) {
            setStatusDropdown(null);
        } else {
            setStatusDropdown(id);
        }
    };
    const changeOrderStatus = (id, newStatus) => {
        onStatusChange(id, newStatus);
        setStatusDropdown(null);
    };
    // View order details
    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setViewModalOpen(true);
    };
    // Edit order
    const handleEditOrder = (order) => {
        setSelectedOrder(order);
        setEditModalOpen(true);
    };
    // Delete order
    const handleDeleteOrder = (order) => {
        setSelectedOrder(order);
        setDeleteModalOpen(true);
    };
    // Handle edit save
    const handleSaveEdit = async (orderId, formData) => {
        setIsActionLoading(true);
        try {
            // Convert UI status to DB status using the mapStatusToDb function
            // We expect this is implemented in the parent component
            const success = await onStatusChange(orderId, formData.status);
            if (success) {
                setEditModalOpen(false);
                setSelectedOrder(null);
            } else {
                alert('Error al actualizar el pedido');
            }
        } catch (error) {
            console.error('Error saving order edit:', error);
            alert('Error al actualizar el pedido');
        } finally {
            setIsActionLoading(false);
        }
    };
    // Handle delete confirm
    const handleConfirmDelete = async () => {
        if (!selectedOrder) return;
        setIsActionLoading(true);
        try {
            const success = await onDelete(selectedOrder.id);
            if (success) {
                setDeleteModalOpen(false);
                setSelectedOrder(null);
            } else {
                alert('Error al eliminar el pedido');
            }
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('Error al eliminar el pedido');
        } finally {
            setIsActionLoading(false);
        }
    };
    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Bulk Actions (Admin only) */}
            {userRole === 'admin' && selectedOrders.length > 0 && (
                <div className="bg-gray-100 p-3 flex items-center">
                    <span className="text-sm mr-4">{selectedOrders.length} pedidos seleccionados</span>
                    <button
                        onClick={() => handleBulkAction('archivar')}
                        className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded mr-2"
                    >
                        Archivar
                    </button>
                    <button
                        onClick={() => handleBulkAction('enviar')}
                        className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded mr-2"
                    >
                        Marcar como enviado
                    </button>
                    <button
                        onClick={() => handleBulkAction('eliminar')}
                        className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-800 rounded"
                    >
                        Eliminar
                    </button>
                </div>
            )}
            {/* Orders Table */}
            <div className="overflow-x-auto">
                <table className="w-full whitespace-nowrap">
                    <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                        <tr>
                            {userRole === 'admin' && (
                                <th className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                                    />
                                </th>
                            )}
                            <th className="px-6 py-3 text-left">Referencia</th>
                            {userRole === 'admin' && <th className="px-6 py-3 text-left">Cliente</th>}
                            <th className="px-6 py-3 text-left">Total</th>
                            <th className="px-6 py-3 text-left">Método de pago</th>
                            <th className="px-6 py-3 text-left">Estado</th>
                            <th className="px-6 py-3 text-left">Fecha</th>
                            <th className="px-6 py-3 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order, index) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    {userRole === 'admin' && (
                                        <td className="px-4 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedOrders.includes(order.id)}
                                                onChange={() => handleSelectOrder(order.id)}
                                            />
                                        </td>
                                    )}
                                    {/* <td className="px-6 py-4">{index + 1}</td> */}
                                    <td className="px-6 py-4">{order.reference}</td>
                                    {userRole === 'admin' && <td className="px-6 py-4">{order.customer}</td>}
                                    <td className="px-6 py-4">{order.total}</td>
                                    <td className="px-6 py-4">{order.payment}</td>                                    <td className="px-6 py-4">
                                        {userRole === 'admin' ? (
                                            <div className="relative">
                                                <button
                                                    onClick={() => toggleStatusDropdown(order.id)}
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'Acceptado' ? 'bg-green-100 text-green-800' :
                                                            'bg-red-100 text-red-800'
                                                        } flex items-center`}
                                                >
                                                    {order.status}
                                                </button>
                                                {statusDropdown === order.id && (
                                                    <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg py-1">
                                                        <button
                                                            onClick={() => changeOrderStatus(order.id, 'Acceptado')}
                                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                                        >
                                                            Acceptado
                                                        </button>
                                                        <button
                                                            onClick={() => changeOrderStatus(order.id, 'Cancelados')}
                                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                                        >
                                                            Cancelados
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (<span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'Acceptado' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {order.status}
                                        </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">{order.date}</td>
                                    <td className="px-6 py-4 text-sm flex flex-row items-center space-x-4 justify-center">
                                        <button
                                            onClick={() => viewPdf("/uploads/invoices/invoice-" + order.reference + ".pdf")}
                                            className="text-green-600 hover:text-green-800 flex items-center"
                                            title="Ver Factura PDF"
                                        >
                                            <FaRegFilePdf size={20} />
                                        </button>
                                        <button
                                            className="text-[#00B0C8] hover:text-[#008A9B] mr-4 text-center"
                                            title="Ver detalles"
                                            onClick={() => handleViewOrder(order)}
                                        >
                                            <FiEye size={20} />
                                        </button>
                                        {userRole === 'admin' && (
                                            <>
                                                <button
                                                    className="text-yellow-600 hover:text-yellow-900 mr-4 text-center"
                                                    title="Editar pedido"
                                                    onClick={() => handleEditOrder(order)}
                                                >
                                                    <FiEdit size={20} />
                                                </button>
                                                <button
                                                    className="text-red-600 hover:text-red-900 text-center"
                                                    title="Eliminar pedido"
                                                    onClick={() => handleDeleteOrder(order)}
                                                >
                                                    <FiTrash2 size={20} />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={userRole === 'admin' ? 9 : 7} className="px-6 py-4 text-center text-gray-500">
                                    No se encontraron pedidos.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* Pagination */}
            {orders.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-200 sm:px-6">
                    <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.totalItems}
                        itemsPerPage={pagination.limit}
                        onPageChange={onPageChange}
                        onItemsPerPageChange={onLimitChange || ((newLimit) => {
                            console.log('Items per page changed to', newLimit);
                            // If onLimitChange is not provided, just log the change
                        })}
                        showingText="Mostrando {} de {} pedidos"
                    />
                </div>
            )}
            {/* Modals */}
            <OrderViewModal
                isOpen={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                orderId={selectedOrder?.id}
            />
            <OrderEditModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                onSave={handleSaveEdit}
                order={selectedOrder}
                isLoading={isActionLoading}
            />
            <OrderDeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                orderReference={selectedOrder?.reference}
                isLoading={isActionLoading}
            />
        </div>
    );
}
