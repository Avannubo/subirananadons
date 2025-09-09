'use client'; // Mark as client component since we'll use interactivity
import { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiEye, FiSearch, FiFilter, FiPlus } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import ProductModal from './ProductModal';
import ProductViewModal from './ProductViewModal';
import ConfirmModal from '@/components/shared/ConfirmModal';
import Pagination from '@/components/admin/shared/Pagination';
export default function ProductsTable(props) {
    // Pagination handlers

    // Remove allProducts and filters, not needed for API-driven filtering
    // Next Intl: detect browser locale
    let locale = 'ca'; // default
    if (typeof window !== 'undefined' && window.navigator?.language) {
        locale = window.navigator.language.split('-')[0];
        if (!['ca', 'es'].includes(locale)) locale = 'es';
    }
    const [products, setProducts] = useState([]);
    const [sortOrder, setSortOrder] = useState('newest'); // default: newest first
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [hoveredImage, setHoveredImage] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    // Unified fetchProducts logic (instant search, translation support, client-side pagination)
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                limit: '99999',
                preventSort: 'true'
            });
            const response = await fetch(`/api/products?${params}`);
            if (!response.ok) throw new Error('Failed to fetch products');
            const data = await response.json();
            if (data && Array.isArray(data.products)) {
                // Search logic: support translation objects for name, brand, category
                const getName = (prod) => {
                    if (!prod.name) return '';
                    if (typeof prod.name === 'object') {
                        return prod.name.ca || prod.name.es || '';
                    }
                    return prod.name;
                };
                const getBrand = (prod) => {
                    if (!prod.brand) return '';
                    if (typeof prod.brand === 'object') {
                        return prod.brand.ca || prod.brand.es || '';
                    }
                    return prod.brand;
                };
                const getCategory = (prod) => {
                    if (!prod.category) return '';
                    if (typeof prod.category === 'object') {
                        return prod.category.ca || prod.category.es || '';
                    }
                    return prod.category;
                };
                const search = searchTerm.trim().toLowerCase();
                let filtered = data.products;
                if (search) {
                    filtered = data.products.filter(prod => {
                        const name = getName(prod).toLowerCase();
                        const brand = getBrand(prod).toLowerCase();
                        const category = getCategory(prod).toLowerCase();
                        const ref = (prod.reference || '').toLowerCase();
                        return (
                            name.includes(search) ||
                            brand.includes(search) ||
                            category.includes(search) ||
                            ref.includes(search)
                        );
                    });
                }
                // Sort client-side
                let sorted = [...filtered];
                if (sortOrder === 'newest') {
                    sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                } else if (sortOrder === 'oldest') {
                    sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                } else if (sortOrder === 'lastmodified') {
                    sorted.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                } else if (sortOrder === 'az') {
                    sorted.sort((a, b) => getName(a).localeCompare(getName(b)));
                } else if (sortOrder === 'za') {
                    sorted.sort((a, b) => getName(b).localeCompare(getName(a)));
                }
                // Pagination logic: always use sorted.length for totalItems and totalPages
                const total = sorted.length;
                setTotalItems(total);
                const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
                // Clamp currentPage to valid range
                let page = currentPage;
                if (page > totalPages) page = totalPages;
                if (page < 1) page = 1;
                const start = (page - 1) * itemsPerPage;
                const end = start + itemsPerPage;
                setProducts(sorted.slice(start, end));
                // If currentPage was clamped, update currentPage state
                if (page !== currentPage) {
                    setCurrentPage(page);
                }
            } else {
                toast.error('Error: Invalid data format');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Reset to first page when search/filter/sort changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sortOrder]);

    useEffect(() => {
        fetchProducts();
    }, [searchTerm, currentPage, itemsPerPage, sortOrder]);

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    // Handle sort order change
    const handleSortOrderChange = (e) => {
        setSortOrder(e.target.value);
        setCurrentPage(1);
    };

    // Update the sortOrder useEffect to trigger a refresh
    useEffect(() => {
        fetchProducts();
    }, [sortOrder]);
    // Removed applyClientPagination, all logic is API-driven
    // Load products on component mount or when category filter changes
    useEffect(() => {
        fetchProducts();
    }, [props.categoryFilter]);
    // Removed handleFilterChange, not needed
    // Removed filter-related useEffect
    // Filter products client-side (accepts custom filters for instant search, left-side/startsWith for name)
    // For category, always use CA if available, then ES, then fallback to string
    // Show category name if cat is an ObjectId string by looking up in categories prop
    const getCategoryString = (cat) => {
        if (!cat) return '';
        // Populated object with ca/es/name
        if (typeof cat === 'object' && (cat.ca || cat.es || cat.name)) {
            return cat.ca || cat.es || cat.name || '';
        }
        // Populated object with _id and name fields
        if (typeof cat === 'object' && cat._id && (cat.name || cat.ca || cat.es)) {
            return cat.ca || cat.es || cat.name || '';
        }
        // If cat is an object with $oid (MongoDB export)
        if (typeof cat === 'object' && cat.$oid) {
            const found = Array.isArray(props.categories) ? props.categories.find(c => c._id === cat.$oid || (c._id && c._id.$oid === cat.$oid)) : null;
            if (found) return found.ca || found.es || found.name || '';
            return cat.$oid;
        }
        // If cat is a string and looks like an ObjectId, try to find the category name
        if (typeof cat === 'string' && /^[a-fA-F0-9]{24}$/.test(cat) && Array.isArray(props.categories)) {
            const found = props.categories.find(c => c._id === cat || (c._id && c._id.$oid === cat));
            if (found) return found.ca || found.es || found.name || '';
        }
        // Otherwise just return the string
        return cat;
    };
    // Get brand display name from brand value (ObjectId, $oid, or object)
    const getBrandString = (brand) => {
        if (!brand) return '';
        // Populated object with name
        if (typeof brand === 'object' && brand.name) {
            return brand.name;
        }
        // Populated object with _id and name
        if (typeof brand === 'object' && brand._id && brand.name) {
            return brand.name;
        }
        // If brand is an object with $oid (MongoDB export)
        if (typeof brand === 'object' && brand.$oid) {
            const found = Array.isArray(props.brands) ? props.brands.find(b => b._id === brand.$oid || (b._id && b._id.$oid === brand.$oid)) : null;
            if (found) return found.name || '';
            return brand.$oid;
        }
        // If brand is a string and looks like an ObjectId, try to find the brand name
        if (typeof brand === 'string' && /^[a-fA-F0-9]{24}$/.test(brand) && Array.isArray(props.brands)) {
            const found = props.brands.find(b => b._id === brand || (b._id && b._id.$oid === brand));
            if (found) return found.name || '';
        }
        // Otherwise just return the string
        return brand;
    };
    // Always use Catalan for name and category columns
    const getCatalanString = (field) => {
        if (!field) return '';
        if (typeof field === 'string') return field;
        if (typeof field === 'object' && (field.ca || field.es)) {
            return field.ca || field.es || '';
        }
        return '';
    };
    // Removed filterProductsClientSide
    // Removed clearFilters
    // Handle product view
    const handleViewProduct = (product) => {
        // If product.category or product.brand is an ObjectId, try to populate from props
        let populatedProduct = { ...product };
        if (populatedProduct.category && typeof populatedProduct.category === 'string' && Array.isArray(props.categories)) {
            const foundCat = props.categories.find(c => c._id === populatedProduct.category || (c._id && c._id.$oid === populatedProduct.category));
            if (foundCat) populatedProduct.category = foundCat;
        }
        if (populatedProduct.brand && typeof populatedProduct.brand === 'string' && Array.isArray(props.brands)) {
            const foundBrand = props.brands.find(b => b._id === populatedProduct.brand || (b._id && b._id.$oid === populatedProduct.brand));
            if (foundBrand) populatedProduct.brand = foundBrand;
        }
        setSelectedProduct(populatedProduct);
        setShowViewModal(true);
    };
    // Handle product edit
    const handleEditProduct = (product) => {
        // If product.category or product.brand is an ObjectId, try to populate from props
        let populatedProduct = { ...product };
        if (populatedProduct.category && typeof populatedProduct.category === 'string' && Array.isArray(props.categories)) {
            const foundCat = props.categories.find(c => c._id === populatedProduct.category || (c._id && c._id.$oid === populatedProduct.category));
            if (foundCat) populatedProduct.category = foundCat;
        }
        if (populatedProduct.brand && typeof populatedProduct.brand === 'string' && Array.isArray(props.brands)) {
            const foundBrand = props.brands.find(b => b._id === populatedProduct.brand || (b._id && b._id.$oid === populatedProduct.brand));
            if (foundBrand) populatedProduct.brand = foundBrand;
        }
        setSelectedProduct(populatedProduct);
        setIsEditing(true);
        setShowModal(true);
    };
    // Handle product delete confirmation
    const handleDeleteConfirm = (product) => {
        setSelectedProduct(product);
        setShowConfirmModal(true);
    };
    // Delete product
    const handleDeleteProduct = async () => {
        if (!selectedProduct) return;
        try {
            const response = await fetch(`/api/products/${selectedProduct._id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete product');
            }
            toast.success('Product deleted successfully');
            setShowConfirmModal(false);
            // Refresh the product list while maintaining the current page if possible
            // If the deleted product was the last one on the page, go to the previous page
            const newPage = products.length === 1 && currentPage > 1
                ? currentPage - 1
                : currentPage;
            setCurrentPage(newPage);
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Error deleting product');
        }
    };
    // Handle items per page change
    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };
    // Handle adding new product
    const handleAddProduct = () => {
        setSelectedProduct(null);
        setIsEditing(false);
        setShowModal(true);
    };
    // Handle form submission for add/edit
    const handleSaveProduct = async (formData) => {
        // Client-side validation for obligatory fields
        const requiredFields = [
            { key: 'name', label: 'Nom' },
        ]
        const missingFields = requiredFields.filter(f => {
            const value = formData[f.key];
            if (f.key === 'name') {
                // name can be object or string
                if (!value || (typeof value === 'object' && !value.es && !value.ca) || (typeof value === 'string' && !value.trim())) return true;
            }
            return false;
        });
        if (missingFields.length > 0) {
            toast.error('Omple tots els camps obligatoris: ' + missingFields.map(f => f.label).join(', '));
            return;
        }
        try {
            // Defensive: always send category as an object with ca and es
            let processedCategory = formData.category;
            if (typeof processedCategory === 'string') {
                processedCategory = { es: processedCategory, ca: '' };
            } else if (!processedCategory || typeof processedCategory !== 'object') {
                processedCategory = { es: '', ca: '' };
            } else {
                processedCategory = {
                    es: processedCategory.es || '',
                    ca: processedCategory.ca || ''
                };
            }
            const processedData = {
                ...formData,
                category: processedCategory
            };
            let response;
            if (isEditing) {
                // Update existing product
                response = await fetch(`/api/products/${selectedProduct._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(processedData),
                });
            } else {
                // Create new product
                response = await fetch('/api/products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(processedData),
                });
            }
            if (!response.ok) {
                let errorMsg = 'Operation failed';
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorData.message || errorMsg;
                } catch (e) {
                    // If response is not JSON, fallback to status text
                    errorMsg = response.statusText || errorMsg;
                }
                throw new Error(errorMsg);
            }
            const savedProduct = await response.json();
            toast.success(isEditing ? 'Product updated successfully' : 'Product added successfully');
            setShowModal(false);
            // When adding a new product, go to first page to see it
            // When editing, stay on current page
            setCurrentPage(isEditing ? currentPage : 1);
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error(error.message || 'Error saving product');
        }
    };
    // Handle page change
    // Handle mouse over image
    const handleImageMouseEnter = (imageUrl) => {
        setHoveredImage(imageUrl);
    };
    // Handle mouse leave image
    const handleImageMouseLeave = () => {
        setHoveredImage(null);
    };
    // Handle mouse move to update tooltip position
    const handleMouseMove = (e) => {
        setMousePosition({
            x: e.clientX,
            y: e.clientY
        });
    };
    // Setup global mouse move event
    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);
    // Removed duplicate sortOrder useEffect
    // For debugging
    // useEffect(() => {
    //     console.log("Current pagination state:", pagination);
    //     console.log("Products count:", products.length);
    // }, [pagination, products]);
    return (
        <div className="bg-white rounded-lg shadow">
            {/* Table Header with Actions */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Productes</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={handleAddProduct}
                        className="px-3 py-1 bg-[#36A9E1] cursor-pointer text-white rounded hover:bg-[#008A9B] flex items-center"
                    >
                        <FiPlus className="mr-1" />
                        Afegir producte
                    </button>
                </div>
            </div>
            {/* Unified Search and Sort */}
            <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-full md:w-1/4">
                    <select
                        value={sortOrder}
                        onChange={handleSortOrderChange}
                        className="border border-gray-300 rounded w-full py-2 px-3 text-gray-700"
                    >
                        <option value="newest">Més nous primer</option>
                        <option value="oldest">Més antics primer</option>
                        <option value="az">Alfabètic A-Z</option>
                        <option value="za">Alfabètic Z-A</option>
                        <option value="lastmodified">Última modificació</option>
                    </select>
                </div>
                <div className="relative flex-1 w-full">
                    <FiSearch className="absolute left-3 top-3 text-gray-400" />
                    <input
                        type="search"
                        autoComplete="off"
                        placeholder="Cerca per nom, marca, categoria o referència"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                    />
                </div>
            </div>
            {/* Products Table */}
            <div className="overflow-x-auto">
                {loading ? (
                    <div>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th> */}
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referencia</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {[1, 2, 3, 4, 5].map((item) => (
                                    <tr key={item}>
                                        {/* <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-4 bg-gray-200 rounded w-4 animate-pulse"></div>
                                        </td> */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-2">
                                                <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse"></div>
                                                <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse"></div>
                                                <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th> */}
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Imatge
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nom
                                </th>
                                {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Referència
                                </th> */}
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Categoria
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Marca
                                </th>
                                {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Preu (imp. excl.)
                                </th> */}
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Preu
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estat
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Accions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.length > 0 ? (
                                products.map((product, index) => (
                                    <tr key={product._id}>
                                        {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {index + 1}
                                        </td> */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="relative">
                                                <img
                                                    src={product.image}
                                                    alt={typeof product.name === 'object' && product.name !== null ? product.name.es || product.name.ca || '' : product.name}
                                                    className="h-10 w-10 rounded object-cover cursor-pointer"
                                                    onMouseEnter={() => handleImageMouseEnter(typeof product.image === 'object' && product.image !== null ? product.image.es || product.image.ca || '' : product.image)}
                                                    onMouseLeave={handleImageMouseLeave}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 max-w-xs truncate" title={getCatalanString(product.name)}>
                                            {getCatalanString(product.name)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={getCatalanString(product.category)}>
                                            {getCatalanString(product.category)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={getBrandString(product.brand)}>
                                            {getBrandString(product.brand)}
                                        </td>
                                        {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {product.price_excl_tax.toFixed(2)} €
                                        </td> */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {product.discount?.active ? (
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-gray-400 line-through">
                                                        {product.price_incl_tax.toFixed(2)}€
                                                    </span>
                                                    <span className="text-sm font-medium text-red-600">
                                                        {product.discount.finalPrice?.toFixed(2)} € {product.discount.type === 'percentage' ? `(-${product.discount.value}%)` : ''}
                                                    </span>
                                                    {product.discount.startDate && product.discount.endDate && (
                                                        <span className="text-xs text-gray-500 mt-1">
                                                            {new Date(product.discount.startDate).toLocaleDateString()} {new Date(product.discount.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                                                            {' - '}
                                                            {new Date(product.discount.endDate).toLocaleDateString()} {new Date(product.discount.endDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-500">
                                                    {product.price_incl_tax.toFixed(2)} €
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.status === 'active' ? 'bg-green-100 text-green-800' :
                                                product.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {product.status === 'active' ? 'Actiu' :
                                                    product.status === 'inactive' ? 'Inactiu' :
                                                        'Descatalogat'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    className="text-[#36A9E1] hover:text-[#008A9B] cursor-pointer"
                                                    onClick={() => handleViewProduct(product)}
                                                    title="Ver detalles"
                                                >
                                                    <FiEye size={20} />
                                                </button>
                                                <button
                                                    className="text-yellow-600 hover:text-yellow-900 cursor-pointer"
                                                    onClick={() => handleEditProduct(product)}
                                                    title="Editar producto"
                                                >
                                                    <FiEdit size={20} />
                                                </button>
                                                <button
                                                    className="text-red-600 hover:text-red-900 cursor-pointer"
                                                    onClick={() => handleDeleteConfirm(product)}
                                                    title="Eliminar producto"
                                                >
                                                    <FiTrash2 size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="px-6 py-8 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                            <p className="text-gray-600 text-lg">No s'han trobat productes</p>
                                            <p className="text-gray-500 text-sm mt-1">Prova de canviar els filtres o afegeix un nou producte</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
            {/* Image Preview Tooltip */}
            {hoveredImage && (
                <div
                    className="fixed z-50 bg-white shadow-xl rounded-md border border-gray-200 p-1"
                    style={{
                        width: '250px',
                        height: '250px',
                        left: mousePosition.x + 20,
                        top: mousePosition.y - 125,
                        pointerEvents: 'none'
                    }}
                >
                    <img
                        src={hoveredImage}
                        alt="Preview"
                        className="w-full h-full object-contain"
                    />
                </div>
            )}
            {/* Pagination */}
            {products.length > 0 && (
                <div className="px-6 py-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={Math.max(1, Math.ceil(totalItems / itemsPerPage))}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={handleItemsPerPageChange}
                        showingText="Mostrant {} de {} productes"
                    />
                </div>
            )}
            {/* Add/Edit Product Modal */}
            {showModal && (
                <ProductModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    product={selectedProduct}
                    isEditing={isEditing}
                    onSave={handleSaveProduct}
                />
            )}
            {/* View Product Modal */}
            {showViewModal && (
                <ProductViewModal
                    isOpen={showViewModal}
                    onClose={() => setShowViewModal(false)}
                    product={selectedProduct}
                />
            )}
            {/* Confirm Delete Modal */}
            {showConfirmModal && (
                <ConfirmModal
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={handleDeleteProduct}
                    title="Eliminar producte"
                    message={`Estàs segur que vols eliminar aquest producte? Aquesta acció no es pot desfer.`}
                    confirmText="Eliminar"
                    cancelText="Cancel·lar"
                />
            )}
        </div>
    );
}