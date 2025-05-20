// Fetch orders with pagination and filtering
const fetchOrders = async (page = 1, limit = 5, filters = {}, options = {}) => {
    setLoading(true);
    setError(null);

    try {
        let endpoint = '/api/orders';

        // Build query parameters
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        // Add filters
        if (filters.status && filters.status !== 'all') {
            params.append('status', filters.status);
        }

        if (filters.dateFrom) {
            params.append('dateFrom', filters.dateFrom);
        }

        if (filters.dateTo) {
            params.append('dateTo', filters.dateTo);
        }

        // Add stable sort parameter to prevent reordering on updates
        params.append('sortBy', 'id');
        params.append('sortDirection', 'desc');

        // Make API request
        const response = await fetch(`${endpoint}?${params.toString()}`);

        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }

        const data = await response.json();

        // Ensure data format is consistent
        const formattedOrders = data.orders.map(order => ({
            id: order.id || order._id,
            reference: order.reference || `ORD-${order.id || order._id}`,
            customer: order.customer?.name || 'Guest',
            status: order.status || 'pending',
            total: typeof order.total === 'number' ? `${order.total.toFixed(2)} €` : order.total || '0.00 €',
            payment: order.paymentMethod || 'N/A',
            date: formatDate(order.createdAt) || 'N/A',
            rawData: order
        }));

        // Sort consistently by creation date to maintain stable order
        formattedOrders.sort((a, b) => {
            // Parse dates from strings or use fallback
            const dateA = a.date ? new Date(a.date) : new Date(0);
            const dateB = b.date ? new Date(b.date) : new Date(0);

            // Sort by date (newest first)
            return dateB - dateA;
        });

        // Update state
        setOrders(formattedOrders);
        setPagination({
            currentPage: data.pagination.currentPage,
            totalPages: data.pagination.totalPages,
            totalItems: data.pagination.totalItems,
            limit: limit
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to fetch orders');
        setOrders([]);
    } finally {
        setLoading(false);
    }
}; 