'use client';
import { FiEdit, FiTrash2, FiEye } from 'react-icons/fi';

export default function OrdersTable({ orders, filters, setFilters, userRole = 'user' }) {
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    // Filter the orders based on search criteria
    const filteredOrders = orders.filter((order) => {
        return (
            order.id.toString().includes(filters.searchId) &&
            order.reference.toLowerCase().includes(filters.searchReference.toLowerCase()) &&
            order.customer.toLowerCase().includes(filters.searchCustomer.toLowerCase()) &&
            order.total.includes(filters.searchTotal) &&
            order.payment.toLowerCase().includes(filters.searchPayment.toLowerCase())
        );
    });

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Search Filters for Admin Users */}
            {userRole === 'admin' && (
                <div className="p-4 bg-gray-50 border-b">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                            <input
                                type="text"
                                name="searchId"
                                value={filters.searchId}
                                onChange={handleFilterChange}
                                placeholder="Buscar por ID"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                name="searchReference"
                                value={filters.searchReference}
                                onChange={handleFilterChange}
                                placeholder="Buscar por referencia"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                name="searchCustomer"
                                value={filters.searchCustomer}
                                onChange={handleFilterChange}
                                placeholder="Buscar por cliente"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                name="searchTotal"
                                value={filters.searchTotal}
                                onChange={handleFilterChange}
                                placeholder="Buscar por total"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                name="searchPayment"
                                value={filters.searchPayment}
                                onChange={handleFilterChange}
                                placeholder="Buscar por método de pago"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Orders Table */}
            <div className="overflow-x-auto">
                <table className="w-full whitespace-nowrap">
                    <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3 text-left">ID</th>
                            <th className="px-6 py-3 text-left">Referencia</th>
                            {userRole === 'admin' && <th className="px-6 py-3 text-left">Cliente</th>}
                            <th className="px-6 py-3 text-left">Total</th>
                            <th className="px-6 py-3 text-left">Método de pago</th>
                            <th className="px-6 py-3 text-left">Estado</th>
                            <th className="px-6 py-3 text-left">Fecha</th>
                            <th className="px-6 py-3 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">{order.id}</td>
                                    <td className="px-6 py-4">{order.reference}</td>
                                    {userRole === 'admin' && <td className="px-6 py-4">{order.customer}</td>}
                                    <td className="px-6 py-4">{order.total}</td>
                                    <td className="px-6 py-4">{order.payment}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'Pago aceptado' ? 'bg-green-100 text-green-800' :
                                                order.status === 'Pendiente de pago' ? 'bg-yellow-100 text-yellow-800' :
                                                    order.status === 'Enviado' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{order.date}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <button className="text-[#00B0C8] hover:text-[#008da0] mr-2">Ver</button>
                                        {userRole === 'admin' && (
                                            <>
                                                <button className="text-blue-600 hover:text-blue-800 mr-2">Editar</button>
                                                <button className="text-red-500 hover:text-red-700">Eliminar</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={userRole === 'admin' ? 8 : 7} className="px-6 py-4 text-center text-gray-500">
                                    No se encontraron pedidos.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
