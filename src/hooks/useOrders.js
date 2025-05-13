'use client';
import { useState, useEffect } from 'react';
/**
 * Hook to fetch and manage orders
 */
export function useOrders(userRole) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        limit: 5
    });
    // Fetch orders from the API
    const fetchOrders = async (page = 1, limit = 5) => {
        setLoading(true);
        try {
            console.log(`Fetching orders for role: ${userRole}, page: ${page}, limit: ${limit}`);
            const response = await fetch(`/api/orders?page=${page}&limit=${limit}`);
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error response from orders API:', errorData);
                throw new Error(errorData.message || 'Failed to fetch orders');
            }
            const data = await response.json();
            console.log('Orders API response:', data);
            if (data.success) {
                // Map orders to match our UI format
                const formattedOrders = data.orders.map(order => ({
                    id: order._id,
                    reference: order.orderNumber || 'No ref',
                    newCustomer: false, // This would need business logic to determine
                    delivery: order.shippingAddress?.country || 'España',
                    customer: order.shippingAddress ? `${order.shippingAddress.name || ''} ${order.shippingAddress.lastName || ''}`.trim() : 'Cliente',
                    total: order.totalAmount ? `${order.totalAmount.toFixed(2)} €` : '0.00 €',
                    payment: order.paymentMethod || 'Pending',
                    status: mapOrderStatus(order.status || 'pending'),
                    date: order.createdAt ? new Date(order.createdAt).toLocaleString('es-ES') : new Date().toLocaleString('es-ES'),
                    userId: order.user || '',
                    trackingNumber: order.trackingNumber || '',
                    notes: order.notes || ''
                }));
                console.log(`Formatted ${formattedOrders.length} orders for display`);
                setOrders(formattedOrders);
                setPagination(data.pagination);
            } else {
                throw new Error(data.message || 'Failed to fetch orders');
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };
    // Map database status to UI status
    const mapOrderStatus = (status) => {
        const statusMap = {
            'pending': 'Pendiente de pago',
            'processing': 'Pago aceptado',
            'shipped': 'Enviado',
            'delivered': 'Entregado',
            'cancelled': 'Cancelado'
        };
        return statusMap[status] || status;
    };
    // Map UI status back to database status
    const mapStatusToDb = (uiStatus) => {
        const reverseStatusMap = {
            'Pendiente de pago': 'pending',
            'Pago aceptado': 'processing',
            'Enviado': 'shipped',
            'Entregado': 'delivered',
            'Cancelado': 'cancelled'
        };
        return reverseStatusMap[uiStatus] || 'pending';
    };
    // Update order status
    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            // If the new status is already a DB status (not UI status)
            // we use it directly, otherwise we map it
            const dbStatus =
                ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(newStatus)
                    ? newStatus
                    : mapStatusToDb(newStatus);
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: dbStatus }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update order status');
            }
            // Update the local state
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId
                        ? {
                            ...order,
                            status: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(newStatus)
                                ? mapOrderStatus(newStatus)
                                : newStatus
                        }
                        : order
                )
            );
            return true;
        } catch (err) {
            console.error('Error updating order status:', err);
            setError(err.message);
            return false;
        }
    };
    // Update order details
    const updateOrderDetails = async (orderId, data) => {
        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update order');
            }
            const responseData = await response.json();
            // Update the local state
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId
                        ? {
                            ...order,
                            status: data.status ? mapOrderStatus(data.status) : order.status,
                            trackingNumber: data.trackingNumber || order.trackingNumber,
                            notes: data.notes !== undefined ? data.notes : order.notes
                        }
                        : order
                )
            );
            return true;
        } catch (err) {
            console.error('Error updating order:', err);
            setError(err.message);
            return false;
        }
    };
    // Delete an order
    const deleteOrder = async (orderId) => {
        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete order');
            }
            // Remove from local state
            setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
            setPagination(prev => ({
                ...prev,
                totalItems: prev.totalItems - 1,
                totalPages: Math.ceil((prev.totalItems - 1) / prev.limit)
            }));
            return true;
        } catch (err) {
            console.error('Error deleting order:', err);
            setError(err.message);
            return false;
        }
    };
    // Fetch orders on mount and when pagination changes
    useEffect(() => {
        fetchOrders(pagination.currentPage, pagination.limit);
    }, [pagination.currentPage, pagination.limit]);
    return {
        orders,
        loading,
        error,
        pagination,
        fetchOrders,
        updateOrderStatus,
        updateOrderDetails,
        deleteOrder,
        mapStatusToDb,
        mapOrderStatus,
        setCurrentPage: (page) => setPagination(prev => ({ ...prev, currentPage: page })),
        setLimit: (limit) => setPagination(prev => ({ ...prev, limit }))
    };
} 