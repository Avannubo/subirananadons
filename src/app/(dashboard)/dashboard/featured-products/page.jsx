'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/Layouts/admin-layout';
import AuthCheck from '@/components/auth/AuthCheck';
import { FiStar, FiXCircle, FiCheck, FiAlertCircle } from 'react-icons/fi';
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
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
                preventSort: 'true'
            });

            if (searchTerm) {
                params.append('search', searchTerm);
            }

            if (filter === 'featured') {
                params.append('featured', 'true');
            }

            const response = await fetch(`/api/products?${params}`);
            if (!response.ok) throw new Error('Failed to fetch products');
            const data = await response.json();

            if (data && Array.isArray(data.products)) {
                const sortedProducts = [...data.products].sort((a, b) => {
                    if (a.featured && !b.featured) return -1;
                    if (!a.featured && b.featured) return 1;
                    return a.name.localeCompare(b.name);
                });

                setAllProducts(sortedProducts);
                setTotalItems(data.total || sortedProducts.length);
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
            const toastId = toast.loading('Actualizando estado...');
            const response = await fetch('/api/products/toggle-featured', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar el estado');
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
            toast.success(data.message || 'Estado actualizado correctamente', { id: toastId });
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

    // Pagination logic    
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedProducts = allProducts;

    return (
        <AuthCheck>
            <AdminLayout>
                <div className="py-6 min-h-[100vh]">
                    <h1 className="text-2xl font-bold mb-6">Gestión de Productos Destacados</h1>
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <p className="text-gray-600 mb-4">
                            Los productos destacados aparecen en la sección "Productos Destacados" en la página de inicio y otras secciones destacadas de la tienda.
                        </p>
                        <div className="flex justify-between items-center flex-wrap gap-4">
                            <div className="flex items-center space-x-2">                                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium text-sm flex items-center">
                                <FiStar className="mr-1" />
                                <span>Productos Destacados: {totalFeaturedCount}</span>
                            </div>
                                <button
                                    onClick={fetchProducts}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full font-medium text-sm"
                                >
                                    Actualizar
                                </button>
                            </div>
                            <div className="flex space-x-2">
                                <div className="relative rounded-md">
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre o referencia"
                                        className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    {searchTerm && (
                                        <button
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            onClick={() => setSearchTerm('')}
                                        >
                                            <FiXCircle />
                                        </button>
                                    )}
                                </div>
                                <select
                                    className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                >
                                    <option value="all">Todos los productos</option>
                                    <option value="featured">Solo destacados</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    {loading ? (
                        <div className="bg-white rounded-lg shadow p-8 flex justify-center items-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00B0C8]"></div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            {paginatedProducts.length === 0 ? (
                                <div className="p-8 text-center">
                                    <FiAlertCircle className="mx-auto text-gray-400 text-4xl mb-4" />
                                    <p className="text-gray-500 mb-2">No se encontraron productos</p>
                                    <p className="text-gray-400 text-sm">
                                        {searchTerm
                                            ? 'Intenta con otra búsqueda o elimina los filtros'
                                            : filter === 'featured'
                                                ? 'No hay productos destacados. Marca productos como destacados utilizando la opción "Todos los productos"'
                                                : 'No hay productos disponibles en la base de datos'
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Imagen
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Producto
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Referencia
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Precio
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Estado
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Destacado
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {paginatedProducts.map((product) => (
                                                <tr key={product._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="h-10 w-10 rounded overflow-hidden bg-gray-100">
                                                            {product.image ? (
                                                                <img
                                                                    src={product.image}
                                                                    alt={product.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                                    No img
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500">{product.reference || '-'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {product.price_incl_tax?.toFixed(2).replace('.', ',')} €
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${product.status === 'active' ? 'bg-green-100 text-green-800' :
                                                            product.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                            }`}>
                                                            {product.status === 'active' ? 'Activo' :
                                                                product.status === 'inactive' ? 'Inactivo' :
                                                                    'Descontinuado'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <button
                                                                onClick={() => toggleFeatured(product._id)}
                                                                className={`flex items-center px-3 py-1 rounded-full text-sm ${product.featured
                                                                    ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                                    }`}
                                                            >
                                                                {product.featured ? (
                                                                    <>
                                                                        <FiCheck className="mr-1" /> Destacado
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
                            )}                            <div className="px-6 py-4">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    totalItems={totalItems}
                                    itemsPerPage={itemsPerPage}
                                    onPageChange={setCurrentPage}
                                    onItemsPerPageChange={handleItemsPerPageChange}
                                    showingText="Mostrando {} de {} productos"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </AdminLayout>
        </AuthCheck>
    );
}