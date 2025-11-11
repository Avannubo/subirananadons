// State for bulk status selector
'use client';
import { FiEye, FiTrash2, FiEdit, FiDownload } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Pagination from '@/components/admin/shared/Pagination';
import OrderDeleteModal from '@/components/admin/orders/OrderDeleteModal';
import OrderEditModal from '@/components/admin/orders/OrderEditModal';
import OrderViewModal from '@/components/admin/orders/OrderViewModal';

// Helper to remove accents from a string
const removeAccents = (str) => {
    return str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';
};
export default function OrdersTable({
    orders,
    filters,
    userRole = 'user',
    onStatusChange,
    onDelete,
    pagination,
    onPageChange,
    onLimitChange,
}) {
    const [selectedOrders, setSelectedOrders] = useState([]);
    // Locale detection (default to 'ca')
    let locale = 'ca';
    if (typeof window !== 'undefined' && window.navigator) {
        const lang = window.navigator.language || window.navigator.userLanguage;
        if (lang && lang.toLowerCase().startsWith('es')) locale = 'es';
    }
    // Translations
    const translations = {
        ca: {
            selected: 'comandes seleccionades',
            archive: 'Arxivar',
            changeStatus: 'Canvia l\'estat a...',
            accepted: 'Acceptada',
            processing: 'Processant',
            shipped: 'Enviada',
            completed: 'Completada',
            cancelled: 'Cancel·lada',
            confirm: 'Confirma',
            delete: 'Elimina',
            reference: 'Referència',
            client: 'Client',
            total: 'Total',
            payment: 'Mètode de pagament',
            status: 'Estat',
            date: 'Data',
            actions: 'Accions',
            noOrders: 'No s\'han trobat comandes.',
            viewPDF: 'Veure tiquet PDF',
            viewDetails: 'Veure detalls',
            editOrder: 'Edita comanda',
            deleteOrder: 'Elimina comanda',
            confirmDelete: 'Estàs segur que vols eliminar',
            updateSuccess: 'Comanda actualitzada correctament',
            updateError: 'Error en actualitzar la comanda',
            deleteError: 'Error en eliminar la comanda',
            pleaseSelect: 'Si us plau, selecciona almenys una comanda',
            archiving: 'Arxivant',
            statusLabels: {
                acceptado: 'Acceptada',
                procesando: 'Processant',
                enviado: 'Enviada',
                completo: 'Completada',
                cancelado: 'Cancel·lada',
            },
        },
        es: {
            selected: 'pedidos seleccionados',
            archive: 'Archivar',
            changeStatus: 'Cambiar estado a...',
            accepted: 'Acceptado',
            processing: 'Procesando',
            shipped: 'Enviado',
            completed: 'Completo',
            cancelled: 'Cancelado',
            confirm: 'Confirmar',
            delete: 'Eliminar',
            reference: 'Referencia',
            client: 'Cliente',
            total: 'Total',
            payment: 'Método de pago',
            status: 'Estado',
            date: 'Fecha',
            actions: 'Acciones',
            noOrders: 'No se encontraron pedidos.',
            viewPDF: 'Ver Ticket PDF',
            viewDetails: 'Ver detalles',
            editOrder: 'Editar pedido',
            deleteOrder: 'Eliminar pedido',
            confirmDelete: '¿Estás seguro de que deseas eliminar',
            updateSuccess: 'Pedido actualizado correctamente',
            updateError: 'Error al actualizar el pedido',
            deleteError: 'Error al eliminar el pedido',
            pleaseSelect: 'Por favor, selecciona al menos un pedido',
            archiving: 'Archivando',
            statusLabels: {
                acceptado: 'Acceptado',
                procesando: 'Procesando',
                enviado: 'Enviado',
                completo: 'Completo',
                cancelado: 'Cancelado',
            },
        }
    };
    const t = translations[locale];
    const statusLabelMap = t.statusLabels;
    const [bulkStatusValue, setBulkStatusValue] = useState("");
    const [statusDropdown, setStatusDropdown] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isActionLoading, setIsActionLoading] = useState(false);
    useEffect(() => {
        //console.log(`OrdersTable received ${orders?.length || 0} orders for userRole ${userRole}`);
        //console.log('Orders data:', orders);
    }, [orders, userRole]);
    const handleDownloadPDF = async (order) => {
        try {
            const toastId = toast.loading('Generando PDF...');
            const response = await fetch(`/api/invoices/${order.id}/pdf`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/pdf'
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al generar el PDF');
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `TIQUET_${order.reference}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Factura descargada correctamente', { id: toastId });
        } catch (error) {
            console.error('Error downloading PDF:', error);
            toast.error('Error al descargar el PDF');
        }
    };
    // Download XML handler
    const handleDownloadXML = async (order) => {
        try {
            const toastId = toast.loading(locale === 'ca' ? 'Generant XML...' : 'Generando XML...');
            const response = await fetch(`/api/orders/${order.id}/xml`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/xml'
                }
            });
            if (!response.ok) {
                let errorData;
                try { errorData = await response.json(); } catch { errorData = {}; }
                throw new Error(errorData.message || (locale === 'ca' ? 'Error en generar l\'XML' : 'Error al generar el XML'));
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ORDER_${order.reference}.xml`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success(locale === 'ca' ? 'XML descarregat correctament' : 'XML descargado correctamente', { id: toastId });
        } catch (error) {
            console.error('Error downloading XML:', error);
            toast.error(locale === 'ca' ? 'Error en descarregar l\'XML' : 'Error al descargar el XML');
        }
    };
    // Filter the orders based on search criteria
    const filteredOrders = orders.filter((order) => {
        return (
            removeAccents(order.id?.toString() || '').includes(removeAccents(filters.searchId)) &&
            removeAccents(order.reference?.toLowerCase() || '').includes(removeAccents(filters.searchReference.toLowerCase())) &&
            removeAccents(order.customer?.toLowerCase() || '').includes(removeAccents(filters.searchCustomer.toLowerCase())) &&
            removeAccents(order.total || '').includes(removeAccents(filters.searchTotal)) &&
            removeAccents(order.payment?.toLowerCase() || '').includes(removeAccents(filters.searchPayment.toLowerCase()))
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
    const handleBulkAction = (action, value) => {
        if (selectedOrders.length === 0) {
            alert(t.pleaseSelect);
            return;
        }
        if (action === 'eliminar') {
            if (window.confirm(`${t.confirmDelete} ${selectedOrders.length} ${t.selected}?`)) {
                Promise.all(selectedOrders.map(id => onDelete(id)))
                    .then(() => setSelectedOrders([]));
            }
        } else if (action === 'archivar') {
            alert(`${t.archiving} ${selectedOrders.length} ${t.selected}`);
            setSelectedOrders([]);
        } else if (action === 'estado' && value) {
            Promise.all(selectedOrders.map(id => onStatusChange(id, value)))
                .then(() => {
                    setBulkStatusValue("");
                });
        }
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
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: formData.status,
                    notes: formData.notes,
                    trackingNumber: formData.trackingNumber
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                toast.success(t.updateSuccess);
                if (data.order) {
                    const updatedOrder = data.order;
                    if (Array.isArray(orders)) {
                        const idx = orders.findIndex(o => o.id === updatedOrder._id || o.id === updatedOrder.id);
                        if (idx !== -1) {
                            orders[idx] = {
                                ...orders[idx],
                                ...updatedOrder,
                                id: updatedOrder._id || updatedOrder.id
                            };
                        }
                    }
                }
                setEditModalOpen(false);
                setSelectedOrder(null);
            } else {
                alert(data.message || t.updateError);
            }
        } catch (error) {
            console.error('Error saving order edit:', error);
            alert(t.updateError);
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
                alert(t.deleteError);
            }
        } catch (error) {
            console.error('Error deleting order:', error);
            alert(t.deleteError);
        } finally {
            setIsActionLoading(false);
        }
    };
    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Bulk Actions (Admin only) */}
            {userRole === 'admin' && selectedOrders.length > 0 && (
                <div className="bg-gray-100 p-3 flex items-center flex-wrap gap-2">
                    <span className="text-sm mr-4">{selectedOrders.length} {t.selected}</span>
                    <button
                        onClick={() => handleBulkAction('archivar')}
                        className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded mr-2 cursor-pointer"
                    >
                        {t.archive}
                    </button>
                    {/* Bulk status change dropdown with confirm button */}
                    <select
                        className="px-3 py-1 text-sm rounded border border-gray-300 mr-2"
                        style={{ width: 'auto', minWidth: '180px', maxWidth: '100%', display: 'inline-block' }}
                        value={bulkStatusValue}
                        onChange={e => setBulkStatusValue(e.target.value)}
                    >
                        <option value="" disabled>{t.changeStatus}</option>
                        <option value="acceptado">{statusLabelMap.acceptado}</option>
                        <option value="procesando">{statusLabelMap.procesando}</option>
                        <option value="enviado">{statusLabelMap.enviado}</option>
                        <option value="completo">{statusLabelMap.completo}</option>
                        <option value="cancelado">{statusLabelMap.cancelado}</option>
                    </select>
                    <button
                        className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded mr-2 cursor-pointer"
                        disabled={!bulkStatusValue}
                        onClick={() => {
                            if (bulkStatusValue) handleBulkAction('estado', bulkStatusValue);
                        }}
                    >
                        {t.confirm}
                    </button>
                    <button
                        onClick={() => handleBulkAction('eliminar')}
                        className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-800 rounded cursor-pointer"
                    >
                        {t.delete}
                    </button>
                </div>
            )}
            {/* Orders Table */}
            <div className="overflow-x-auto">
                <table className="w-full whitespace-nowrap ">
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
                            <th className="px-6 py-3 text-left">{t.reference}</th>
                            {userRole === 'admin' && <th className="px-6 py-3 text-left">{t.client}</th>}
                            <th className="px-6 py-3 text-left">{t.total}</th>
                            {/* <th className="px-6 py-3 text-left">{t.payment}</th> */}
                            <th className="px-6 py-3 text-left">{t.status}</th>
                            <th className="px-6 py-3 text-left">{t.date}</th>
                            <th className="px-6 py-3 text-left">{t.actions}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {orders.length > 0 ? (
                            orders.map((order, index) => (
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
                                    <td className="px-6 py-4">{order.reference}</td>
                                    {userRole === 'admin' && <td className="px-6 py-4">{order.customer}</td>}
                                    <td className="px-6 py-4">{order.total}</td>
                                    {/* <td className="px-6 py-4">{order.payment}</td> */}
                                    <td className="px-6 py-4">
                                        {(() => {
                                            const rawStatus = (order.status || '').toLowerCase().trim();
                                            const statusMap = {
                                                'pending': 'procesando',
                                                'processing': 'procesando',
                                                'accepted': 'acceptado',
                                                'shipped': 'enviado',
                                                'completed': 'completo',
                                                'cancelled': 'cancelado',
                                                'canceled': 'cancelado',
                                                'acceptado': 'acceptado',
                                                'procesando': 'procesando',
                                                'enviado': 'enviado',
                                                'completo': 'completo',
                                                'cancelado': 'cancelado',
                                            };
                                            const status = statusMap[rawStatus] || 'procesando';
                                            const statusColorMap = {
                                                'acceptado': 'bg-green-100 text-green-800',
                                                'procesando': 'bg-yellow-100 text-yellow-800',
                                                'enviado': 'bg-blue-100 text-blue-800',
                                                'completo': 'bg-gray-100 text-gray-800',
                                                'cancelado': 'bg-red-100 text-red-800',
                                            };
                                            const colorClass = statusColorMap[status] || 'bg-gray-100 text-gray-800';
                                            const label = statusLabelMap[status] || status;
                                            return (
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                                                    {label}
                                                </span>
                                            );
                                        })()}
                                    </td>
                                    <td className="px-6 py-4">{order.date}</td>
                                    <td className="px-6 py-4 text-sm flex flex-row items-center space-x-4 justify-start">
                                        <button
                                            onClick={() => handleDownloadPDF(order)}
                                            className="text-green-600 hover:text-green-800 flex items-center cursor-pointer"
                                            title={t.viewPDF}
                                        >
                                            <FiDownload size={22} />
                                        </button>
                                        <button
                                            onClick={() => handleDownloadXML(order)}
                                            className="text-blue-600 hover:text-blue-800 flex items-center cursor-pointer"
                                            title={locale === 'ca' ? 'Descarregar XML' : 'Descargar XML'}
                                        >
                                            <span className='text-lg font-bold '>XML</span> {/* <FiDownload size={22} style={{ transform: 'rotate(-90deg)' }} /> */}
                                        </button>
                                        <button
                                            className="text-[#36A9E1] hover:text-[#008A9B] mr-4 text-center cursor-pointer"
                                            title={t.viewDetails}
                                            onClick={() => handleViewOrder(order)}
                                        >
                                            <FiEye size={22} />
                                        </button>
                                        {userRole === 'admin' && (
                                            <>
                                                <button
                                                    className="text-yellow-600 hover:text-yellow-900 mr-4 text-center cursor-pointer"
                                                    title={t.editOrder}
                                                    onClick={() => handleEditOrder(order)}
                                                >
                                                    <FiEdit size={22} />
                                                </button>
                                                <button
                                                    className="text-red-600 hover:text-red-900 text-center cursor-pointer"
                                                    title={t.deleteOrder}
                                                    onClick={() => handleDeleteOrder(order)}
                                                >
                                                    <FiTrash2 size={22} />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={userRole === 'admin' ? 9 : 7} className="px-6 py-4 text-center text-gray-500">
                                    {t.noOrders}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* Pagination */}
            {orders.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-200 sm:px-6 md:mb-0 mb-20">
                    <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.totalItems}
                        itemsPerPage={pagination.limit}
                        onPageChange={onPageChange}
                        onItemsPerPageChange={onLimitChange || ((newLimit) => {
                            //console.log('Items per page changed to', newLimit);
                        })}
                        showingText={locale === 'ca' ? 'Mostrant {} de {} comandes' : 'Mostrando {} de {} pedidos'}
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
