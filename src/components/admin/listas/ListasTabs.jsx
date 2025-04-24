'use client';
import { useState, useEffect } from 'react';
import ListasTable from '@/components/admin/listas/ListasTable';

// Sample lists data - In a real app, this would come from an API
const lists = [
    {
        id: 1,
        reference: 'LISTA001',
        name: "Lista de Lucas García",
        creator: "María García",
        creationDate: "15/03/2024",
        dueDate: "10/06/2024",
        products: 18,
        purchased: 12,
        progress: 65,
        status: "Activa",
        userId: "user123"
    },
    {
        id: 2,
        reference: 'LISTA002',
        name: "Lista de Emma Pérez",
        creator: "Juan Pérez",
        creationDate: "20/02/2024",
        dueDate: "15/05/2024",
        products: 24,
        purchased: 24,
        progress: 100,
        status: "Completada",
        userId: "user456"
    },
    {
        id: 3,
        reference: 'LISTA003',
        name: "Lista de Mateo Sánchez",
        creator: "Ana Sánchez",
        creationDate: "05/04/2024",
        dueDate: "01/07/2024",
        products: 15,
        purchased: 8,
        progress: 53,
        status: "Activa",
        userId: "user789"
    },
    {
        id: 4,
        reference: 'LISTA004',
        name: "Lista de Sofía Martínez",
        creator: "Carlos Martínez",
        creationDate: "10/01/2024",
        dueDate: "12/04/2024",
        products: 20,
        purchased: 5,
        progress: 25,
        status: "Cancelada",
        userId: "user101"
    },
    {
        id: 5,
        reference: 'LISTA005',
        name: "Lista de Leo Rodríguez",
        creator: "Laura Rodríguez",
        creationDate: "25/03/2024",
        dueDate: "30/06/2024",
        products: 12,
        purchased: 10,
        progress: 83,
        status: "Activa",
        userId: "user202"
    },
    {
        id: 6,
        reference: 'LISTA006',
        name: "Lista de Noa Gómez",
        creator: "Daniel Gómez",
        creationDate: "02/02/2024",
        dueDate: "20/05/2024",
        products: 16,
        purchased: 16,
        progress: 100,
        status: "Completada",
        userId: "user303"
    },
    {
        id: 7,
        reference: 'LISTA007',
        name: "Lista de Hugo López",
        creator: "Patricia López",
        creationDate: "18/02/2024",
        dueDate: "25/05/2024",
        products: 22,
        purchased: 3,
        progress: 14,
        status: "Cancelada",
        userId: "user404"
    },
    {
        id: 8,
        reference: 'LISTA008',
        name: "Lista de Lucía Fernández",
        creator: "Roberto Fernández",
        creationDate: "30/03/2024",
        dueDate: "15/07/2024",
        products: 25,
        purchased: 20,
        progress: 80,
        status: "Activa",
        userId: "user123"
    }
];

export default function ListasTabs({ userRole = 'user' }) {
    const [activeTab, setActiveTab] = useState('Todos');
    const [filters, setFilters] = useState({
        searchId: '',
        searchReference: '',
        searchName: '',
        searchCreator: '',
        dateFrom: '',
        dateTo: ''
    });

    // Determine which lists to show based on user role
    // Admin sees all lists, regular users only see their own
    const [displayLists, setDisplayLists] = useState([]);

    useEffect(() => {
        // In a real app, you would fetch lists from an API
        // For now, we're simulating user-specific lists
        if (userRole === 'admin') {
            setDisplayLists(lists);
        } else {
            // In a real app, you would filter by the actual user ID
            // For this demo, we're showing lists for userId "user123"
            const userLists = lists.filter(list => list.userId === 'user123');
            setDisplayLists(userLists);
        }
    }, [userRole]);

    const tabs = ['Todos', 'Activas', 'Completadas', 'Canceladas'];

    const filteredLists = displayLists.filter((list) => {
        if (activeTab === 'Todos') return true;
        if (activeTab === 'Activas') return list.status === 'Activa';
        if (activeTab === 'Completadas') return list.status === 'Completada';
        if (activeTab === 'Canceladas') return list.status === 'Cancelada';
        return false;
    });

    return (
        <div>
            {/* Tabs Navigation */}
            <div className="flex border-b border-b-gray-200 border-gray-200 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-medium text-sm ${activeTab === tab
                            ? 'border-b-2 border-[#00B0C8] text-[#00B0C8]'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab} {tab === 'Todos' ? `(${displayLists.length})` : `(${displayLists.filter(list => {
                            if (tab === 'Activas') return list.status === 'Activa';
                            if (tab === 'Completadas') return list.status === 'Completada';
                            if (tab === 'Canceladas') return list.status === 'Cancelada';
                            return false;
                        }).length})`}
                    </button>
                ))}
            </div>

            {/* Lists Table */}
            <ListasTable
                lists={filteredLists}
                filters={filters}
                setFilters={setFilters}
                userRole={userRole}
            />

            {displayLists.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-500">No tienes listas de regalos en este momento.</p>
                </div>
            )}
        </div>
    );
} 