'use client';
import { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiRefreshCw, FiPlus, FiDownload } from 'react-icons/fi';
import ClientsTable from '@/components/admin/clients/ClientTable';
import ClientModal from '@/components/admin/clients/ClientModal';
import ClientViewModal from '@/components/admin/clients/ClientViewModal';
import ConfirmDeleteModal from '@/components/admin/clients/ConfirmDeleteModal';
import { toast } from 'react-hot-toast';
import { useClientStats } from '@/contexts/ClientStatsContext';
import TabNavigation from '@/components/admin/shared/TabNavigation';
import Pagination from '@/components/admin/shared/Pagination';

export default function ClientsTabs() {
    const { refreshStats } = useClientStats();
    const [activeTab, setActiveTab] = useState('Todos');
    const [filters, setFilters] = useState({
        searchId: '',
        searchName: '',
        searchLastName: '',
        searchEmail: '',
        searchSales: '',
        registrationDateFrom: '',
        registrationDateTo: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [showClientModal, setShowClientModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [clients, setClients] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        limit: 5
    });

    const tabs = ['Todos', 'Activos', 'Inactivos', 'Newsletter', 'Ofertas'];

    // Load clients when component mounts
    useEffect(() => {
        fetchClients();
    }, [activeTab, pagination.currentPage]);

    // Calculate status counts
    const statusCounts = {
        Todos: clients.length,
        Activos: clients.filter(c => c.active).length,
        Inactivos: clients.filter(c => !c.active).length,
        Newsletter: clients.filter(c => c.newsletter).length,
        Ofertas: clients.filter(c => c.partnerOffers).length
    };

    // Fetch clients from API
    const fetchClients = async () => {
        try {
            setIsLoading(true);
            const queryParams = new URLSearchParams();

            // Add pagination parameters
            queryParams.append('page', pagination.currentPage);
            queryParams.append('limit', pagination.limit);

            // Add search filters
            if (filters.searchId) queryParams.append('searchId', filters.searchId);
            if (filters.searchName) queryParams.append('searchName', filters.searchName);
            if (filters.searchLastName) queryParams.append('searchLastName', filters.searchLastName);
            if (filters.searchEmail) queryParams.append('searchEmail', filters.searchEmail);

            // Add tab filters
            if (activeTab === 'Activos') queryParams.append('active', 'true');
            if (activeTab === 'Inactivos') queryParams.append('active', 'false');
            if (activeTab === 'Newsletter') queryParams.append('newsletter', 'true');
            if (activeTab === 'Ofertas') queryParams.append('partnerOffers', 'true');

            const url = `/api/clients?${queryParams.toString()}`;
            console.log('Fetching clients with URL:', url);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Error fetching clients');
            }

            const data = await response.json();
            console.log('API response:', data);

            if (data.success) {
                setClients(data.clients || []);
                setPagination(data.pagination || {
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: data.clients?.length || 0,
                    limit: 5
                });
            } else {
                throw new Error(data.message || 'Failed to fetch clients');
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
            toast.error('Error al cargar los clientes');
        } finally {
            setIsLoading(false);
        }
    };

    // Filter clients - now handled on the server side through API calls
    const filteredClients = clients;

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Apply filters
    const applyFilters = () => {
        setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
        fetchClients();
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            searchId: '',
            searchName: '',
            searchLastName: '',
            searchEmail: '',
            searchSales: '',
            registrationDateFrom: '',
            registrationDateTo: ''
        });

        // Reset page and fetch
        setPagination(prev => ({ ...prev, currentPage: 1 }));
        fetchClients();
    };

    // Refresh data
    const refreshData = async () => {
        await fetchClients();
        await refreshStats();
        toast.success('Datos actualizados correctamente');
    };

    // Handle client view
    const handleViewClient = (client) => {
        setSelectedClient(client);
        setShowViewModal(true);
    };

    // Handle client edit
    const handleEditClient = (client) => {
        setSelectedClient(client);
        setShowClientModal(true);
    };

    // Handle new client
    const handleAddNewClient = () => {
        setSelectedClient(null);
        setShowClientModal(true);
    };

    // Handle client delete
    const handleDeleteClient = (client) => {
        setSelectedClient(client);
        setShowDeleteModal(true);
    };

    // Save client (new or edit)
    const handleSaveClient = async (formData) => {
        try {
            let response;

            if (selectedClient) {
                // Edit existing client
                response = await fetch(`/api/clients/${selectedClient.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });
            } else {
                // Add new client
                response = await fetch('/api/clients', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Operation failed');
            }

            // Refresh the client list
            fetchClients();

            return data.client;
        } catch (error) {
            console.error('Error saving client:', error);
            throw error;
        }
    };

    // Confirm client deletion
    const confirmDeleteClient = async () => {
        if (!selectedClient) return;

        setIsDeleting(true);

        try {
            const response = await fetch(`/api/clients/${selectedClient.id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete client');
            }

            // Close modal and refresh data
            setShowDeleteModal(false);
            fetchClients();
            toast.success('Cliente eliminado correctamente');
        } catch (error) {
            toast.error('Error al eliminar el cliente');
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    // Handle pagination change
    const handlePageChange = (newPage) => {
        setPagination(prev => ({
            ...prev,
            currentPage: newPage
        }));
    };

    // Export clients to CSV
    const exportToCSV = () => {
        // Create CSV content
        const headers = ['ID', 'Nombre', 'Apellidos', 'Email', 'Ventas', 'Fecha de registro', 'Activo', 'Newsletter', 'Ofertas'];

        const csvContent = [
            headers.join(','),
            ...clients.map(client => [
                client.id,
                client.name,
                client.lastName,
                client.email,
                client.sales,
                client.registrationDate,
                client.active ? 'Sí' : 'No',
                client.newsletter ? 'Sí' : 'No',
                client.partnerOffers ? 'Sí' : 'No'
            ].join(','))
        ].join('\n');

        // Create a blob and download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.setAttribute('href', url);
        link.setAttribute('download', `clientes_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Clientes exportados correctamente');
    };

    return (
        <>
            <TabNavigation
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center">
                        <h2 className="text-lg font-medium">Administración de clientes ({pagination.totalItems})</h2>
                        <button
                            className="ml-2 text-gray-500 hover:text-gray-700 h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                            onClick={refreshData}
                            disabled={isLoading}
                            title="Actualizar datos"
                        >
                            <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                    <div className="flex  space-x-2">
                        <button
                            className="flex items-center px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
                            onClick={exportToCSV}
                            title="Exportar a CSV"
                        >
                            <FiDownload className="mr-1" /> Exportar
                        </button>
                        <button
                            className="flex items-center px-3 py-2 bg-[#00B0C8] text-white rounded text-sm hover:bg-[#00B0C890] transition-colors"
                            onClick={handleAddNewClient}
                            title="Añadir nuevo cliente"
                        >
                            <FiPlus className="mr-1" /> Nuevo Cliente
                        </button>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="p-4 border-b border-gray-200 grid md:grid-cols-4 gap-4">
                    <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar ID"
                                name="searchId"
                                value={filters.searchId}
                                onChange={handleFilterChange}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                            />
                        </div>
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar Nombre"
                                name="searchName"
                                value={filters.searchName}
                                onChange={handleFilterChange}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                            />
                        </div>
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar Apellidos"
                                name="searchLastName"
                                value={filters.searchLastName}
                                onChange={handleFilterChange}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                            />
                        </div>
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar Email"
                                name="searchEmail"
                                value={filters.searchEmail}
                                onChange={handleFilterChange}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                            />
                        </div>
                    </div>

                    <div className="flex sm:flex-row flex-col justify-start gap-2">
                        <button
                            className="flex items-center justify-center px-4 py-2 bg-[#00B0C8] text-white rounded hover:bg-[#00B0C890]"
                            onClick={applyFilters}
                            title="Aplicar filtros"
                        >
                            <FiFilter className="mr-2" />
                            Filtrar
                        </button>
                        <button
                            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                            onClick={clearFilters}
                            title="Limpiar filtros"
                        >
                            Limpiar
                        </button>
                    </div>
                </div>

                {/* Client data table */}
                {isLoading ? (
                    <div className="py-20 text-center">
                        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-t-2 border-[#00B0C8]"></div>
                        <p className="mt-3 text-gray-600">Cargando clientes...</p>
                    </div>
                ) : (
                    <>
                        <ClientsTable
                            clients={filteredClients}
                            onEditClient={handleEditClient}
                            onDeleteClient={handleDeleteClient}
                            onViewClient={handleViewClient}
                        />

                        {/* Pagination */}
                        {!isLoading && pagination.totalPages > 0 && (
                            <div className="p-4 border-t border-gray-200">
                                <Pagination
                                    currentPage={pagination.currentPage}
                                    totalPages={pagination.totalPages}
                                    totalItems={pagination.totalItems}
                                    itemsPerPage={pagination.limit}
                                    onPageChange={handlePageChange}
                                    onItemsPerPageChange={(newLimit) => {
                                        setPagination(prev => ({
                                            ...prev,
                                            limit: newLimit,
                                            currentPage: 1
                                        }));
                                        fetchClients();
                                    }}
                                    showingText="Mostrando {} de {} clientes"
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Client Modal for Add/Edit */}
            {showClientModal && (
                <ClientModal
                    isOpen={showClientModal}
                    onClose={() => setShowClientModal(false)}
                    client={selectedClient}
                    onSave={handleSaveClient}
                />
            )}

            {/* Client View Modal */}
            {showViewModal && (
                <ClientViewModal
                    isOpen={showViewModal}
                    onClose={() => setShowViewModal(false)}
                    client={selectedClient}
                />
            )}

            {/* Confirmation Modal for Delete */}
            {showDeleteModal && (
                <ConfirmDeleteModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={confirmDeleteClient}
                    client={selectedClient}
                    isDeleting={isDeleting}
                />
            )}
        </>
    );
}