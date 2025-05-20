/**
 * Service for handling Birth List operations
 */

/**
 * Fetch all birth lists for the current user
 * (or all lists for admin users)
 */
export const fetchBirthLists = async () => {
    try {
        // Add preventSort=true to ensure stable ordering managed by the client
        const response = await fetch('/api/birthlists?preventSort=true');

        if (!response.ok) {
            throw new Error('Failed to fetch birth lists');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching birth lists:', error);
        throw error;
    }
};

/**
 * Fetch a specific birth list by ID
 * @param {string} id - The birth list ID
 */
export const fetchBirthListById = async (id) => {
    try {
        const response = await fetch(`/api/birthlists/${id}`);

        if (!response.ok) {
            throw new Error('Failed to fetch birth list');
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching birth list ${id}:`, error);
        throw error;
    }
};

/**
 * Create a new birth list
 * @param {Object} birthListData - The birth list data
 */
export const createBirthList = async (birthListData) => {
    try {
        const response = await fetch('/api/birthlists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(birthListData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create birth list');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating birth list:', error);
        throw error;
    }
};

/**
 * Update an existing birth list
 * @param {string} id - The birth list ID
 * @param {Object} updateData - The data to update
 */
export const updateBirthList = async (id, updateData) => {
    try {
        const response = await fetch(`/api/birthlists/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update birth list');
        }

        return await response.json();
    } catch (error) {
        console.error(`Error updating birth list ${id}:`, error);
        throw error;
    }
};

/**
 * Delete a birth list
 * @param {string} id - The birth list ID to delete
 */
export const deleteBirthList = async (id) => {
    try {
        const response = await fetch(`/api/birthlists/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete birth list');
        }

        return await response.json();
    } catch (error) {
        console.error(`Error deleting birth list ${id}:`, error);
        throw error;
    }
};

/**
 * Fetch items (products) in a birth list
 * @param {string} id - The birth list ID
 */
export const fetchBirthListItems = async (id) => {
    try {
        const response = await fetch(`/api/birthlists/${id}/items`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                success: false,
                message: errorData.message || 'Failed to fetch birth list items'
            };
        }

        const data = await response.json();
        return {
            success: true,
            data: data.data || []
        };
    } catch (error) {
        console.error(`Error fetching items for birth list ${id}:`, error);
        return {
            success: false,
            message: 'Error fetching birth list items',
            error: error.message
        };
    }
};

/**
 * Add a product to a birth list
 * @param {string} listId - The birth list ID
 * @param {string} productId - The product ID to add
 * @param {number} quantity - Quantity of the product (default: 1)
 * @param {number} priority - Priority of the product (1-3, default: 2)
 */
export const addProductToBirthList = async (listId, productId, quantity = 1, priority = 2) => {
    try {
        const response = await fetch(`/api/birthlists/${listId}/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                product: productId,
                quantity,
                priority
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add product to birth list');
        }

        return await response.json();
    } catch (error) {
        console.error(`Error adding product to birth list ${listId}:`, error);
        throw error;
    }
};

/**
 * Update all items in a birth list
 * @param {string} listId - The birth list ID
 * @param {Array} items - Array of items to update
 */
export const updateBirthListItems = async (listId, items) => {
    try {
        const response = await fetch(`/api/birthlists/${listId}/items`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update birth list items');
        }

        return await response.json();
    } catch (error) {
        console.error(`Error updating items in birth list ${listId}:`, error);
        throw error;
    }
};

/**
 * Remove a product from a birth list
 * @param {string} listId - The birth list ID
 * @param {string} productId - The product ID to remove
 */
export const removeProductFromBirthList = async (listId, productId) => {
    try {
        const response = await fetch(`/api/birthlists/${listId}/items?productId=${productId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to remove product from birth list');
        }

        return await response.json();
    } catch (error) {
        console.error(`Error removing product from birth list ${listId}:`, error);
        throw error;
    }
};

/**
 * Format a birth list for display in UI
 * @param {Object} list - The raw birth list data from API
 */
export const formatBirthList = (list) => {
    return {
        id: list._id,
        reference: `LISTA${list._id.substring(list._id.length - 4).toUpperCase()}`,
        name: list.title,
        creator: list.user?.name || 'Usuario',
        creationDate: new Date(list.createdAt).toLocaleDateString('es-ES'),
        dueDate: new Date(list.dueDate).toLocaleDateString('es-ES'),
        products: list.items?.length || 0,
        purchased: list.items?.filter(item => item.reserved >= item.quantity).length || 0,
        progress: list.items?.length
            ? Math.round(
                (list.items.reduce((sum, item) => sum + Math.min(item.reserved, item.quantity), 0) /
                    list.items.reduce((sum, item) => sum + item.quantity, 0)) * 100
            )
            : 0,
        status: list.status,
        userId: list.user?._id || list.user,
        babyName: list.babyName,
        description: list.description,
        isPublic: list.isPublic,
        rawData: list // Include the raw data for access to all fields
    };
}; 