'use client';
import { useState } from 'react';
import { FiSearch, FiFilter, FiRefreshCw } from 'react-icons/fi';
import ClientsTable from '@/components/admin/clients/ClientTable';

export default function ClientsTabs() {
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

    const tabs = ['Todos', 'Activos', 'Inactivos', 'Newsletter', 'Ofertas'];

    // Sample data
    const clients = [
        { id: 1, name: 'John', lastName: 'Doe', email: 'john.doe@example.com', sales: 5, registrationDate: '2023-01-15', active: true, newsletter: true, partnerOffers: false },
        { id: 2, name: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', sales: 3, registrationDate: '2023-02-10', active: false, newsletter: false, partnerOffers: true },
        { id: 3, name: 'Alice', lastName: 'Johnson', email: 'alice.johnson@example.com', sales: 8, registrationDate: '2023-03-05', active: true, newsletter: true, partnerOffers: true },
        { id: 4, name: 'Bob', lastName: 'Brown', email: 'bob.brown@example.com', sales: 2, registrationDate: '2023-04-20', active: false, newsletter: false, partnerOffers: false },
        { id: 5, name: 'Charlie', lastName: 'Davis', email: 'charlie.davis@example.com', sales: 10, registrationDate: '2023-05-30', active: true, newsletter: true, partnerOffers: true }
    ];

    const statusCounts = {
        Todos: clients.length,
        Activos: clients.filter(c => c.active).length,
        Inactivos: clients.filter(c => !c.active).length,
        Newsletter: clients.filter(c => c.newsletter).length,
        Ofertas: clients.filter(c => c.partnerOffers).length
    };

    const filteredClients = clients.filter(client => {  
        // First filter by active tab
        if (activeTab === 'Activos' && !client.active) return false;
        if (activeTab === 'Inactivos' && client.active) return false;
        if (activeTab === 'Newsletter' && !client.newsletter) return false;
        if (activeTab === 'Ofertas' && !client.partnerOffers) return false;

        // Then filter by search criteria
        const matchesId = filters.searchId ? client.id.toString().includes(filters.searchId) : true;
        const matchesName = filters.searchName ? client.name.toLowerCase().includes(filters.searchName.toLowerCase()) : true;
        const matchesLastName = filters.searchLastName ? client.lastName.toLowerCase().includes(filters.searchLastName.toLowerCase()) : true;
        const matchesEmail = filters.searchEmail ? client.email.toLowerCase().includes(filters.searchEmail.toLowerCase()) : true;
        const matchesSales = filters.searchSales ? client.sales.toString().includes(filters.searchSales) : true;

        // Date filtering
        const clientDate = new Date(client.registrationDate);
        const fromDate = filters.registrationDateFrom ? new Date(filters.registrationDateFrom) : null;
        const toDate = filters.registrationDateTo ? new Date(filters.registrationDateTo) : null;

        const matchesFromDate = fromDate ? clientDate >= fromDate : true;
        const matchesToDate = toDate ? clientDate <= toDate : true;

        return matchesId && matchesName && matchesLastName && matchesEmail && matchesSales && matchesFromDate && matchesToDate;
    });

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
    };

    return (
        <>
            <div className="flex border-b border-gray-200 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-3 text-sm font-medium ${activeTab === tab
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab} ({statusCounts[tab]})
                    </button>
                ))}
            </div>
       
            <div className="bg-white rounded-lg shadow">
            
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center">
                    <h2 className="text-lg font-medium">Administración de clientes ({clients.length})</h2>
                    <button className="ml-2 text-gray-500 hover:text-gray-700">
                        <FiRefreshCw />
                    </button>
                </div>
                <div className="flex space-x-2">
                    <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                        Ajustes
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                        Acciones Agrupadas
                    </button>
                </div>
            </div>

            

            {/* Search and Filters */}
            <div className="p-4 border-b border-gray-200 flex flex-row justify-start items-start space-x-4">
                <div className=" flex flex-row justify-center space-x-2">
                    <div className="relative ">
                        <FiSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar ID"
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                            value={filters.searchId}
                            onChange={(e) => setFilters({ ...filters, searchId: e.target.value })}
                        />
                    </div>
                    <div className="relative ">
                        <FiSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar Nombre"
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                            value={filters.searchId}
                            onChange={(e) => setFilters({ ...filters, searchId: e.target.value })}
                        />
                    </div>
                    <div className="relative ">
                        <FiSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar Email"
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                            value={filters.searchId}
                            onChange={(e) => setFilters({ ...filters, searchId: e.target.value })}
                        />
                    </div>

                    {/* Other search inputs */}
                </div>
                <div className=" flex justify-center gap-4">
                    {/* Date filters */}
                    <div className="flex items-end space-x-2">
                        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            <FiFilter className="mr-2" />
                            Buscar
                        </button>
                        <button
                            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                            onClick={clearFilters}
                        >
                            Limpiar
                        </button>
                    </div>
                </div>
            </div>

            <ClientsTable clients={filteredClients} />
        </div>
        </>
        
    );
}