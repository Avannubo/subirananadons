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
 * @returns {Promise<Object>} - Products and pagination info
 */
export async function fetchProducts(options = {}) {
    try {
        const {
            page = 1,
            limit = 10,
            category,
            status = 'active',
            search,
            brand,
            lowStock
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

        // Make API request
        const response = await fetch(`/api/products?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`Error fetching products: ${response.status}`);
        }

        const data = await response.json();

        return data;
    } catch (error) {
        console.error('ProductService fetchProducts error:', error);
        throw error;
    }
}

/**
 * Format product data to be used in the shop
 * @param {Object} product - Raw product data from API
 * @returns {Object} - Formatted product data
 */
export function formatProduct(product) {
    return {
        id: product._id,
        name: product.name,
        category: product.category,
        price: `${product.price_incl_tax.toFixed(2).replace('.', ',')} €`,
        priceValue: product.price_incl_tax,
        salesCount: product.salesCount || 0,
        imageUrl: product.image || '/assets/images/default-product.png',
        imageUrlHover: product.imageHover || product.image || '/assets/images/default-product.png',
        description: product.description || '',
        reference: product.reference,
        brand: product.brand || ''
    };
}

/**
 * Fetch a single product by ID
 * @param {string} id - Product ID
 * @returns {Promise<Object>} - Product data
 */
export async function fetchProductById(id) {
    try {
        const response = await fetch(`/api/products/${id}`);

        if (!response.ok) {
            throw new Error(`Error fetching product: ${response.status}`);
        }

        const product = await response.json();
        return product;
    } catch (error) {
        console.error('ProductService fetchProductById error:', error);
        throw error;
    }
} 