/**
 * CategoryService - Handles all category-related API calls
 */

/**
 * Fetch categories with optional filtering
 * @param {Object} options - Query options
 * @param {string|null} options.parent - Parent category ID (null for root)
 * @param {boolean} options.includeChildren - Whether to include children recursively
 * @returns {Promise<Array>} - Array of categories
 */
export async function fetchCategories(options = {}) {
    const {
        parent = null,
        includeChildren = false
    } = options;

    const params = new URLSearchParams();
    if (parent !== undefined && parent !== null) {
        params.append('parent', parent);
    }
    if (includeChildren) {
        params.append('includeChildren', 'true');
    }

    const response = await fetch(`/api/categories?${params.toString()}`);
    if (!response.ok) {
        throw new Error(`Error fetching categories: ${response.status}`);
    }
    return await response.json();
}
