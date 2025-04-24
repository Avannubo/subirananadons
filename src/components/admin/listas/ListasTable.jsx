'use client';
import { FiEdit, FiTrash2, FiEye, FiGift } from 'react-icons/fi';

export default function ListasTable({ lists, filters, setFilters, userRole = 'user' }) {
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    // Filter the lists based on search criteria
    const filteredLists = lists.filter((list) => {
        return (
            list.id.toString().includes(filters.searchId || '') &&
            list.reference.toLowerCase().includes((filters.searchReference || '').toLowerCase()) &&
            list.name.toLowerCase().includes((filters.searchName || '').toLowerCase()) &&
            list.creator.toLowerCase().includes((filters.searchCreator || '').toLowerCase())
        );
    });

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Search Filters for Admin Users */}
            {userRole === 'admin' && (
                <div className="p-4 bg-gray-50 border-b border-gray-400">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <input
                                type="text"
                                name="searchId"
                                value={filters.searchId || ''}
                                onChange={handleFilterChange}
                                placeholder="Buscar por ID"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                name="searchReference"
                                value={filters.searchReference || ''}
                                onChange={handleFilterChange}
                                placeholder="Buscar por referencia"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                name="searchName"
                                value={filters.searchName || ''}
                                onChange={handleFilterChange}
                                placeholder="Buscar por nombre"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                name="searchCreator"
                                value={filters.searchCreator || ''}
                                onChange={handleFilterChange}
                                placeholder="Buscar por creador"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Lists Table */}
            <div className="overflow-x-auto">
                <table className="w-full whitespace-nowrap">
                    <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3 text-left">ID</th>
                            <th className="px-6 py-3 text-left">Referencia</th>
                            <th className="px-6 py-3 text-left">Nombre</th>
                            {userRole === 'admin' && <th className="px-6 py-3 text-left">Creador</th>}
                            <th className="px-6 py-3 text-left">Fecha Creación</th>
                            <th className="px-6 py-3 text-left">Fecha Prevista</th>
                            <th className="px-6 py-3 text-left">Progreso</th>
                            <th className="px-6 py-3 text-left">Estado</th>
                            <th className="px-6 py-3 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredLists.length > 0 ? (
                            filteredLists.map((list) => (
                                <tr key={list.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">{list.id}</td>
                                    <td className="px-6 py-4">{list.reference}</td>
                                    <td className="px-6 py-4">{list.name}</td>
                                    {userRole === 'admin' && <td className="px-6 py-4">{list.creator}</td>}
                                    <td className="px-6 py-4">{list.creationDate}</td>
                                    <td className="px-6 py-4">{list.dueDate}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                                                <div
                                                    className={`h-2 rounded-full ${list.progress >= 100 ? 'bg-green-500' :
                                                        list.progress >= 75 ? 'bg-[#00B0C8]' :
                                                            list.progress >= 50 ? 'bg-yellow-500' :
                                                                'bg-red-500'
                                                        }`}
                                                    style={{ width: `${list.progress}%` }}
                                                />
                                            </div>
                                            <span className="text-xs">{list.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${list.status === 'Activa' ? 'bg-green-100 text-green-800' :
                                                list.status === 'Completada' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {list.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <button className="text-[#00B0C8] hover:text-[#008da0] mr-2">
                                            <FiEye className="inline mr-1" />
                                        </button>
                                        {userRole === 'admin' ? (
                                            <>
                                                <button className="text-blue-600 hover:text-blue-800 mr-2">
                                                    <FiEdit className="inline mr-1" />
                                                </button>
                                                <button className="text-red-500 hover:text-red-700">
                                                    <FiTrash2 className="inline mr-1" />
                                                </button>
                                            </>
                                        ) : (
                                            <button className="text-green-600 hover:text-green-800">
                                                <FiGift className="inline mr-1" /> Compartir
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={userRole === 'admin' ? 9 : 8} className="px-6 py-4 text-center text-gray-500">
                                    No se encontraron listas de regalos.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
} 