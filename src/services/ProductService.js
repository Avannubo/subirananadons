/**
 * ProductService - Handles all product-related API calls
 */

/**
 * Fetch products with optional filtering
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Results per page (default: 10)
 * @param {string} options.category - Category filter (comma-separated for multiple)
 * @param {string} options.status - Status filter (active, inactive, etc.)
 * @param {string} options.search - Search term
 * @param {string} options.brand - Brand filter
 * @param {boolean} options.lowStock - Whether to filter for low stock products
 * @param {boolean} options.preventSort - Whether to prevent sorting by updatedAt
 * @returns {Promise<Object>} - Products and pagination info
 */
export async function fetchProducts(options = {}) {
    const {
        page = 1,
        limit = 10,
        category,
        status = 'active',
        search,
        brand,
        lowStock,
        preventSort = false
    } = options;

    // Build query string from options
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);

    if (status) params.append('status', status);
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    if (brand) params.append('brand', brand);
    if (lowStock) params.append('lowStock', lowStock);
    if (preventSort) params.append('preventSort', 'true');

    try {
        // Make API request
        const response = await fetch(`/api/products?${params.toString()}`);
        let data = null;
        try {
            data = await response.json();
        } catch (parseError) {
            console.error('ProductService fetchProducts JSON parse error:', parseError);
            data = null;
        }

        if (!response.ok) {
            // Log error but do not throw, return default structure
            let errorMessage = `ProductService fetchProducts error: ${response.status} - ${response.statusText}`;
            try {
                const errorData = await response.json();
                if (errorData && errorData.error) {
                    errorMessage += ` | ${errorData.error}`;
                }
            } catch { }
            console.error(errorMessage);
            return {
                products: [],
                pagination: {
                    totalPages: 1,
                    totalItems: 0,
                    currentPage: 1,
                    itemsPerPage: 10
                }
            };
        }

        // Handle different response formats with default values
        if (Array.isArray(data)) {
            // If data is already an array of products, wrap it in the expected format
            return {
                products: data,
                pagination: {
                    totalPages: 1,
                    totalItems: data.length,
                    currentPage: 1,
                    itemsPerPage: data.length
                }
            };
        }

        // Ensure we have a products array even if the API returns null/undefined
        return {
            products: (data && data.products) || [],
            pagination: (data && data.pagination) || {
                totalPages: 1,
                totalItems: 0,
                currentPage: page,
                itemsPerPage: limit
            }
        };
    } catch (error) {
        console.error('ProductService fetchProducts error:', error);
        // Return default structure on error instead of throwing
        return {
            products: [],
            pagination: {
                totalPages: 1,
                totalItems: 0,
                currentPage: 1,
                itemsPerPage: 10
            }
        };
    }
}

/**
 * Format product data to be used in the shop
 * @param {Object} product - Raw product data from API
 * @returns {Object} - Formatted product data
 */
export function formatProduct(product) {
    // Used for product lists only, not for product detail page
    // Import translation utility
    const { getTranslatedField } = require('@/lib/getTranslatedField');
    const locale = typeof window !== 'undefined' ? (window.__NEXT_INTL_LOCALE || window.navigator.language || 'ca').split('-')[0] : 'ca';
    // Helper to ensure only strings are returned, including nested objects
    const ensureString = (val) => {
        if (!val) return '';
        if (typeof val === 'string') return val;
        if (typeof val === 'object') {
            // If it's a translation object
            if (val[locale] || val.es || val.ca) return val[locale] || val.es || val.ca;
            // If it's a populated object (brand/category)
            if (val.name) {
                if (typeof val.name === 'object') {
                    return val.name[locale] || val.name.es || val.name.ca || Object.values(val.name)[0] || '';
                }
                return val.name;
            }
            // If it's a brand object with logo, description, etc.
            if (val.logo || val.description || val.slug) {
                return val.name || val.slug || JSON.stringify(val);
            }
            // Fallback to first string value
            return Object.values(val).find(v => typeof v === 'string') || JSON.stringify(val);
        }
        return String(val);
    };
    return {
        id: product._id,
        name: ensureString(getTranslatedField(product, 'name', locale)) || ensureString(product.name),
        category: ensureString(getTranslatedField(product, 'category', locale)) || ensureString(product.category),
        price: `${product.price_incl_tax?.toFixed(2).replace('.', ',')} €`,
        priceValue: product.price_incl_tax,
        salesCount: product.salesCount || 0,
        imageUrl: product.image || '/assets/images/Screenshot_4.png',
        imageUrlHover: product.imageHover || product.image || '/assets/images/Screenshot_4.png',
        description: ensureString(getTranslatedField(product, 'description', locale)) || ensureString(product.description),
        reference: product.reference,
        brand: ensureString(getTranslatedField(product, 'brand', locale)) || ensureString(product.brand)
    };
}

/**
 * Fetch a single product by ID
 * @param {string} id - Product ID
 * @returns {Promise<Object>} - Product data
 */
export async function fetchProductById(id) {
    try {
        // Support both /product/[id] and /products/[id] for backward compatibility
        let response = await fetch(`/api/products/${id}`);
        // Return the raw product object, do not format
        const product = await response.json();
        return product;
    } catch (error) {
        console.error('ProductService fetchProductById error:', error);
        throw error;
    }
}

/**
 * Fetch featured products
 * @param {number} limit - Maximum number of products to fetch
 * @returns {Promise<Array>} - Array of formatted featured products
 */
export async function fetchFeaturedProducts(limit = 8) {
    try {
        const response = await fetch(`/api/products/featured?limit=${limit}`);

        if (!response.ok) {
            throw new Error(`Error fetching featured products: ${response.status}`);
        }

        const data = await response.json();
        return data.products || [];
    } catch (error) {
        console.error('ProductService fetchFeaturedProducts error:', error);
        return [];
    }
}

/**
 * Toggle product status between active and inactive
 * @param {string} productId - ID of the product to toggle
 * @returns {Promise<Object>} - Updated product data
 */
export async function toggleProductStatus(productId) {
    try {
        const response = await fetch('/api/products/toggle-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId }),
        });

        if (!response.ok) {
            throw new Error(`Error toggling product status: ${response.status}`);
        }

        const data = await response.json();
        return data.product;
    } catch (error) {
        console.error('ProductService toggleProductStatus error:', error);
        throw error;
    }
}