'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/Layouts/admin-layout';
import AuthCheck from '@/components/auth/AuthCheck';
import { FiStar, FiXCircle, FiCheck, FiAlertCircle } from 'react-icons/fi';
import ImageHoverPreview from '@/components/shared/ImageHoverPreview';
import { toast } from 'react-hot-toast';
import Pagination from '@/components/admin/shared/Pagination';
export default function FeaturedProductsPage() {
    const [allProducts, setAllProducts] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [totalItems, setTotalItems] = useState(0);
    const [totalFeaturedCount, setTotalFeaturedCount] = useState(0);
    // Fetch all featured products count on mount
    useEffect(() => {
        fetchFeaturedCount();
    }, []);
    // Fetch products whenever page, items per page, or filter changes
    useEffect(() => {
        fetchProducts();
    }, [currentPage, itemsPerPage, filter]);
    // Fetch total featured products count
    const fetchFeaturedCount = async () => {
        try {
            const response = await fetch('/api/products?limit=99999&preventSort=true');
            if (!response.ok) throw new Error('Failed to fetch featured count');
            const data = await response.json();
            if (data && Array.isArray(data.products)) {
                const featuredCount = data.products.filter(p => p.featured).length;
                setTotalFeaturedCount(featuredCount);
            }
        } catch (error) {
            console.error('Error fetching featured count:', error);
            toast.error('Error fetching featured count');
        }
    };
    // Fetch all products from API    
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                limit: '99999', // fetch all for client-side pagination
                preventSort: 'true'
            });
            if (filter === 'featured') {
                params.append('featured', 'true');
            }
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
                const sortedProducts = [...filtered].sort((a, b) => {
                    if (a.featured && !b.featured) return -1;
                    if (!a.featured && b.featured) return 1;
                    return getName(a).localeCompare(getName(b));
                });
                setAllProducts(sortedProducts);
                setTotalItems(sortedProducts.length);
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
    // Toggle featured status of a product
    const toggleFeatured = async (productId) => {
        try {
            const toastId = toast.loading('Actualitzant estat...');
            const response = await fetch('/api/products/toggle-featured', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productId }),
            });
            if (!response.ok) {
                let errorMsg = 'Error en actualitzar l\'estat';
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.message) errorMsg = errorData.message;
                } catch { }
                throw new Error(errorMsg);
            }
            const data = await response.json();
            setAllProducts(prevProducts =>
                prevProducts.map(product =>
                    product._id === productId
                        ? { ...product, featured: !product.featured }
                        : product
                )
            );
            fetchFeaturedCount();
            toast.success((data && data.message) || 'Estat actualitzat correctament', { id: toastId });
        } catch (error) {
            console.error('Error toggling featured status:', error);
            toast.error(`Error: ${error.message}`);
        }
    };
    // Effect to fetch products when search term changes
    useEffect(() => {
        if (searchTerm.length === 0 || searchTerm.length >= 2) {
            fetchProducts();
        }
    }, [searchTerm]);
    // Handle items per page change
    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };
    // Pagination logic (client-side)
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedProducts = allProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    return (
        <AuthCheck>
            <AdminLayout>
                <div className="py-6 min-h-[100vh]">
                    <h1 className="text-2xl font-bold mb-6">Gestió de Productes Destacats</h1>
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <p className="text-gray-600 mb-4">
                            Els productes destacats apareixen a la secció "Productes Destacats" a la pàgina d'inici i altres seccions destacades de la botiga.
                        </p>
                        <div className="flex justify-between items-center flex-wrap gap-4">
                            <div className="flex items-center space-x-2">
                                <div className="bg-blue-100 text-blue-800 p-3 rounded-lg font-medium text-sm flex items-center">
                                    <FiStar className="mr-1" />
                                    <span>Productes Destacats: {totalFeaturedCount}</span>
                                </div>
                            </div>
                            <div className="flex-1 flex space-x-2">
                                <div className="relative rounded-md w-full">
                                    <input
                                        type="text"
                                        placeholder="Cerca per nom, marca, categoria o referència"
                                        className="border border-gray-300 rounded-md w-full px-4 py-2 focus:outline-none focus:ring-[#36A9E1] focus:border-[#36A9E1]"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    {searchTerm && (
                                        <button
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                            onClick={() => setSearchTerm('')}
                                        >
                                            <FiXCircle />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    {loading ? (
                        <div className="bg-white rounded-lg shadow p-8 flex justify-center items-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#36A9E1]"></div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            {paginatedProducts.length === 0 ? (
                                <div className="p-8 text-center">
                                    <FiAlertCircle className="mx-auto text-gray-400 text-4xl mb-4" />
                                    <p className="text-gray-500 mb-2">No s'han trobat productes</p>
                                    <p className="text-gray-400 text-sm">
                                        {searchTerm
                                            ? 'Intenta amb una altra cerca o elimina els filtres'
                                            : (filter === 'featured'
                                                ? 'No hi ha productes destacats. Marca productes com a destacats utilitzant l\'opció "Tots els productes"'
                                                : 'No hi ha productes disponibles a la base de dades')}
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Imatge
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Producte
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Referència
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Preu
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Descompte
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Estat
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Destacat
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {paginatedProducts.map((product) => (
                                                <tr key={product._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="h-10 w-10 rounded overflow-hidden bg-gray-100">
                                                            {product.image ? (
                                                                <ImageHoverPreview
                                                                    src={product.image}
                                                                    alt={product.name}
                                                                    className="w-10 h-10 object-contain"
                                                                />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                                    Sense imatge
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {typeof product.name === 'object'
                                                                ? (product.name.ca || product.name.es || '-')
                                                                : (product.name || '-')}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500">{product.reference || '-'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className={`text-sm ${product.discount?.active ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                                            {product.price_incl_tax?.toFixed(2).replace('.', ',')} €
                                                        </div>
                                                        {product.discount?.active && product.discount.finalPrice && (
                                                            <div className="text-sm text-red-600 font-medium">
                                                                {product.discount.finalPrice.toFixed(2).replace('.', ',')} €
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {product.discount?.active ? (
                                                            <div>
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                    {product.discount.type === 'percentage'
                                                                        ? `${product.discount.value}%`
                                                                        : `${product.discount.value.toFixed(2).replace('.', ',')}€`}
                                                                </span>
                                                                {(product.discount.startDate || product.discount.endDate) && (
                                                                    <div className="text-xs text-gray-500 mt-1">
                                                                        {product.discount.startDate && (
                                                                            <div>Des de: {new Date(product.discount.startDate).toLocaleDateString()}</div>
                                                                        )}
                                                                        {product.discount.endDate && (
                                                                            <div>Fins: {new Date(product.discount.endDate).toLocaleDateString()}</div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-gray-500">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${product.status === 'active' ? 'bg-green-100 text-green-800' :
                                                            product.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                            }`}>
                                                            {product.status === 'active' ? 'Actiu' :
                                                                product.status === 'inactive' ? 'Inactiu' :
                                                                    'Descatalogat'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <button
                                                                onClick={() => toggleFeatured(product._id)}
                                                                className={`flex items-center px-3 py-1 rounded-full cursor-pointer text-sm ${product.featured
                                                                    ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                                    }`}
                                                            >
                                                                {product.featured ? (
                                                                    <>
                                                                        <FiCheck className="mr-1" /> Destacat
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <FiStar className="mr-1" /> Destacar
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            <div className="px-6 py-4">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    totalItems={totalItems}
                                    itemsPerPage={itemsPerPage}
                                    onPageChange={setCurrentPage}
                                    onItemsPerPageChange={handleItemsPerPageChange}
                                    showingText="Mostrant {} de {} productes"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </AdminLayout>
        </AuthCheck>
    );
}