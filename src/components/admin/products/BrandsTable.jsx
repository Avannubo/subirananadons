'use client';

import { useState, useEffect } from 'react';
import { FiFilter, FiSearch, FiUpload, FiDownload, FiEdit, FiTrash2, FiEye, FiPlus } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import ConfirmModal from '@/components/shared/ConfirmModal';
import BrandModal from './BrandModal';
import BrandViewModal from './BrandViewModal';
import Pagination from '@/components/admin/shared/Pagination';

export default function BrandsTable() {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showEnabledOnly, setShowEnabledOnly] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        limit: 5
    });
    const [allBrands, setAllBrands] = useState([]);
    const [useClientPagination, setUseClientPagination] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch brands from the API
    const fetchBrands = async (page = 1, limit = pagination.limit, search = searchTerm, enabledOnly = showEnabledOnly) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();

            // Add preventSort=true to ensure server doesn't apply its own sorting
            queryParams.append('preventSort', 'true');

            // Add pagination parameters for server-side pagination
            if (!useClientPagination) {
                queryParams.append('page', page);
                queryParams.append('limit', limit);
                if (search) queryParams.append('search', search);
                if (enabledOnly) queryParams.append('enabled', 'true');
            }

            const response = await fetch(`/api/brands?${queryParams.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to fetch brands');
            }

            const data = await response.json();

            // For now, we'll use client-side pagination
            if (Array.isArray(data)) {
                setAllBrands(data);
                applyClientPagination(data, page, limit, search, enabledOnly);
            } else if (data.brands && Array.isArray(data.brands)) {
                if (data.pagination) {
                    setUseClientPagination(false);

                    // Sort brands by _id to ensure stable order
                    const sortedBrands = [...data.brands].sort((a, b) => {
                        // Sort by _id which is tied to creation time and immutable
                        return a._id > b._id ? -1 : 1;
                    });

                    setBrands(sortedBrands);
                    setPagination({
                        currentPage: data.pagination.currentPage || page,
                        totalPages: data.pagination.totalPages || Math.ceil(data.brands.length / limit) || 1,
                        totalItems: data.pagination.totalItems || data.brands.length,
                        limit: limit
                    });
                } else {
                    setAllBrands(data.brands);
                    setUseClientPagination(true);
                    applyClientPagination(data.brands, page, limit, search, enabledOnly);
                }
            } else {
                const brandsArray = data.brands || data || [];
                setAllBrands(brandsArray);
                setUseClientPagination(true);
                applyClientPagination(brandsArray, page, limit, search, enabledOnly);
            }
        } catch (error) {
            console.error('Error fetching brands:', error);
            toast.error('Error carregant les marques');
            // Initialize with empty state to prevent UI errors
            setBrands([]);
            setAllBrands([]);
            setPagination({
                currentPage: 1,
                totalPages: 1,
                totalItems: 0,
                limit: pagination.limit
            });
        } finally {
            setLoading(false);
        }
    };

    // Apply client-side pagination
    const applyClientPagination = (brandsArray, page, limit, customSearchTerm = null, customShowEnabledOnly = null) => {
        // Sort brands by MongoDB _id to maintain a stable order
        brandsArray.sort((a, b) => {
            return a._id > b._id ? -1 : 1;
        });

        // Use the latest search/filter values if provided, otherwise from state
        const search = customSearchTerm !== null ? customSearchTerm : searchTerm;
        const enabledOnly = customShowEnabledOnly !== null ? customShowEnabledOnly : showEnabledOnly;

        const filteredBrands = brandsArray.filter((brand) => {
            const matchesSearch = !search ||
                (brand._id?.toString().toLowerCase().includes(search.toLowerCase())) ||
                (brand.id?.toString().toLowerCase().includes(search.toLowerCase())) ||
                (brand.name?.toLowerCase().includes(search.toLowerCase()));

            const matchesStatus = !enabledOnly || brand.enabled;
            return matchesSearch && matchesStatus;
        });

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedBrands = filteredBrands.slice(startIndex, endIndex);

        setBrands(paginatedBrands);
        setPagination({
            currentPage: page,
            totalPages: Math.ceil(filteredBrands.length / limit) || 1,
            totalItems: filteredBrands.length,
            limit: limit
        });
    };

    // Load brands on component mount
    useEffect(() => {
        fetchBrands(1);
    }, []);

    // Apply filters when search or filter changes
    useEffect(() => {
        if (useClientPagination && allBrands.length > 0) {
            applyClientPagination(allBrands, 1, pagination.limit, searchTerm, showEnabledOnly);
        } else if (!useClientPagination) {
            // For server-side pagination, refetch with search/filter
            fetchBrands(1, pagination.limit, searchTerm, showEnabledOnly);
        }
    }, [searchTerm, showEnabledOnly]);

    // Handle page change
    const handlePageChange = (page) => {
        if (useClientPagination) {
            applyClientPagination(allBrands, page, pagination.limit);
        } else {
            fetchBrands(page);
        }
    };

    // Handle items per page change
    const handleLimitChange = (valueOrEvent) => {
        // Handle both direct value (number) or event object
        let newLimit;
        if (typeof valueOrEvent === 'number') {
            newLimit = valueOrEvent;
        } else if (valueOrEvent && valueOrEvent.target && valueOrEvent.target.value) {
            newLimit = parseInt(valueOrEvent.target.value);
        } else {
            console.error('Invalid value passed to handleLimitChange:', valueOrEvent);
            return; // Exit if we can't determine the value
        }

        if (useClientPagination) {
            applyClientPagination(allBrands, 1, newLimit);
        } else {
            fetchBrands(1, newLimit);
        }
    };

    // Handle brand view
    const handleViewBrand = (brand) => {
        setSelectedBrand(brand);
        setShowViewModal(true);
    };

    // Handle brand edit
    const handleEditBrand = (brand) => {
        setSelectedBrand(brand);
        setIsEditing(true);
        setShowModal(true);
    };

    // Handle brand delete confirmation
    const handleDeleteConfirm = (brand) => {
        setSelectedBrand(brand);
        setShowConfirmModal(true);
    };

    // Handle brand deletion
    const handleDeleteBrand = async (brandId) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/brands/${brandId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error en eliminar la marca');
            }

            // Update the brands list by removing the deleted brand
            const updatedAllBrands = allBrands.filter(brand => (brand._id || brand.id) !== brandId);
            setAllBrands(updatedAllBrands);

            // Recalculate pagination with the updated brands list
            if (useClientPagination) {
                applyClientPagination(updatedAllBrands, pagination.currentPage, pagination.limit);
            } else {
                fetchBrands(pagination.currentPage);
            }

            setShowConfirmModal(false);
            toast.success('Marca eliminada correctament');
        } catch (error) {
            console.error('Error deleting brand:', error);
            toast.error(error.message || 'Error en eliminar la marca');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle adding new brand
    const handleAddBrand = () => {
        setSelectedBrand(null);
        setIsEditing(false);
        setShowModal(true);
    };

    // Handle form submission for add/edit
    const handleSaveBrand = async (formData) => {
        try {
            let response;

            // Add timestamps
            const now = new Date();
            const brandData = {
                ...formData,
                updatedAt: now
            };

            if (isEditing) {
                // Update existing brand
                response = await fetch(`/api/brands/${selectedBrand._id || selectedBrand.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(brandData),
                });
            } else {
                // Create new brand - add createdAt timestamp
                brandData.createdAt = now;

                response = await fetch('/api/brands', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(brandData),
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Operació fallida');
            }

            const savedBrand = await response.json();
            toast.success(isEditing ? 'Marca actualitzada correctament' : 'Marca afegida correctament');
            setShowModal(false);

            if (useClientPagination) {
                let updatedBrands;

                if (isEditing) {
                    // Find and update the brand in the array
                    updatedBrands = allBrands.map(b =>
                        (b._id || b.id) === (savedBrand._id || savedBrand.id) ? savedBrand : b
                    );
                } else {
                    // Add the new brand to the beginning of the array
                    updatedBrands = [savedBrand, ...allBrands];
                }

                setAllBrands(updatedBrands);
                // Always go to first page to see the newly added/edited brand
                applyClientPagination(updatedBrands, 1, pagination.limit);
            } else {
                // Always fetch the first page to see the newly added/edited brand
                fetchBrands(1);
            }
        } catch (error) {
            console.error('Error saving brand:', error);
            toast.error(error.message || 'Error en desar la marca');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Header with title and actions */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Marques</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={handleAddBrand}
                        className="px-3 py-1 bg-[#00B0C8] text-white rounded hover:bg-[#008A9B] flex items-center"
                    >
                        <FiPlus className="mr-1" />
                        Afegir marca
                    </button>
                    {/* <button className="flex items-center px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                        <FiUpload className="mr-2" />
                        Importa
                    </button>
                    <button className="flex items-center px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                        <FiDownload className="mr-2" />
                        Exporta
                    </button> */}
                </div>
            </div>

            {/* Search and filters */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="relative flex-grow">
                        <FiSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cerca marques"
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={showEnabledOnly}
                                onChange={() => setShowEnabledOnly(!showEnabledOnly)}
                                className="rounded border-gray-300 text-[#00B0C8] focus:ring-[#00B0C8]"
                            />
                            <span>Mostrar només actives</span>
                        </label>
                        {/* <button className="flex items-center px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                            <FiFilter className="mr-2" />
                            Filtres avançats
                        </button> */}
                    </div>
                </div>
            </div>

            {/* Brands table */}
            <div className="overflow-x-auto">
                {loading ? (
                    <div>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logotip</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enllaç</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estat</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {[1, 2, 3, 4, 5].map((item) => (
                                    <tr key={item}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-4 bg-gray-200 rounded w-4 animate-pulse"></div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logotip</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enllaç</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estat</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {brands.length > 0 ? (
                                brands.map((brand, index) => (
                                    <tr key={brand._id || brand.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {brand.logo ? (
                                                <img src={brand.logo} alt={brand.name} className="w-10 h-10 object-contain" />
                                            ) : (
                                                <span className="text-gray-400 italic text-sm">--</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 max-w-xs truncate" title={brand.name}>
                                            {brand.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <a className="text-[#00B0C8] hover:text-[#008A9B]" href={brand.website} target="_blank" rel="noopener noreferrer">
                                                {brand.website}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${brand.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                                                {brand.enabled ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    className="text-[#00B0C8] hover:text-[#008A9B]"
                                                    onClick={() => handleViewBrand(brand)}
                                                    title="Veure detalls"
                                                >
                                                    <FiEye size={20} />
                                                </button>
                                                <button
                                                    className="text-yellow-600 hover:text-yellow-900"
                                                    onClick={() => handleEditBrand(brand)}
                                                    title="Edita marca"
                                                >
                                                    <FiEdit size={20} />
                                                </button>
                                                <button
                                                    className="text-red-600 hover:text-red-900"
                                                    onClick={() => handleDeleteConfirm(brand)}
                                                    title="Elimina marca"
                                                >
                                                    <FiTrash2 size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                            <p className="text-gray-600 text-lg">No s'han trobat marques</p>
                                            <p className="text-gray-500 text-sm mt-1">Afegeix una nova marca o canvia els filtres</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {brands.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-200">
                    <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.totalItems}
                        itemsPerPage={pagination.limit}
                        onPageChange={handlePageChange}
                        onItemsPerPageChange={handleLimitChange}
                        showingText="Mostrant {} de {} marques"
                    />
                </div>
            )}

            {/* Brand View Modal */}
            {showViewModal && selectedBrand && (
                <BrandViewModal
                    isOpen={showViewModal}
                    onClose={() => setShowViewModal(false)}
                    brand={selectedBrand}
                />
            )}

            {/* Add/Edit Brand Modal */}
            {showModal && (
                <BrandModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    brand={selectedBrand}
                    isEditing={isEditing}
                    onSave={handleSaveBrand}
                />
            )}

            {/* Confirm Delete Modal */}
            {showConfirmModal && selectedBrand && (
                <ConfirmModal
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={() => handleDeleteBrand(selectedBrand._id || selectedBrand.id)}
                    title="Elimina marca"
                    message={`Estàs segur que vols eliminar la marca "${selectedBrand.name}"? Aquesta acció no es pot desfer.`}
                    confirmText="Elimina"
                    cancelText="Cancel·la"
                    isLoading={isLoading}
                />
            )}
        </div>
    );
}