// src/services/OrderService.js
/**
 * OrderService - handles order creation, invoice download, and email sending
 */
export const OrderService = {
    /**
     * Get the pending order from localStorage (global source of truth)
     * @returns {object|null}
     */
    getPendingOrder() {
        if (typeof window === 'undefined') return null;
        const pending = window.localStorage.getItem('orderpending');
        if (!pending) return null;
        try {
            return JSON.parse(pending);
        } catch (e) {
            return null;
        }
    },
    /**
     * Create order from orderPending object (from localStorage or passed in)
     * @param {object} orderPending
     * @returns {Promise<object>} API response data
     */
    async createOrder(orderPending) {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPending),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error al procesar el pedido');
        return data;
    },
    async downloadInvoice(orderPending, toast) {
        const order = orderPending || this.getPendingOrder();
        if (!order) return;
        const orderId = order._id || order.orderId;
        if (!orderId) return;
        toast.success('Generando Ticket...');
        try {
            const res = await fetch(`/api/orders/${orderId}/invoice`, {
                method: 'GET',
                headers: { 'Accept': 'application/pdf' }
            });
            if (!res.ok) throw new Error('No se pudo generar la Ticket');
            const blob = await res.blob();
            setInvoiceBlob(blob);
        } catch (err) {
            toast.error('Error al generar la Ticket');
        }
    },
    /**
     * Send order confirmation email for the pending order
     * @param {object} toast
     */
    async sendOrderEmailForPending(toast) {
        const order = this.getPendingOrder();
        if (!order) return;
        const loadingToastId = toast.loading('Enviando email...');
        try {
            const response = await fetch(`/api/orders/${order.orderId}/send-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: order.buyerDetails?.email,
                    orderNumber: order.orderNumber,
                    items: order.items
                })
            });
            if (!response.ok) throw new Error('Error al enviar el email');
            toast.dismiss(loadingToastId);
            toast.success('Email enviado correctamente');
        } catch (error) {
            console.error('Error sending email:', error);
            toast.dismiss(loadingToastId);
            toast.error('Error al enviar el email');
        }
    }
};
