'use client';
import { FiEdit, FiTrash2, FiEye } from 'react-icons/fi';

export default function OrdersTable({ orders = [], statusCounts, activeTab, setActiveTab }) {
    return (
        <div className="bg-white rounded-lg shadow">
            {/* Status Tabs */}
            {/* <div className="flex border-b border-gray-200">
                {[
                    { id: 'Todos', label: 'Todos' },
                    { id: 'pending', label: 'Pendientes' },
                    { id: 'paid', label: 'Pagados' },
                    { id: 'shipped', label: 'Enviados' },
                    { id: 'returned', label: 'Devueltos' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-3 text-sm font-medium ${activeTab === tab.id
                            ? 'border-b-2 border-[#00B0C8] text-[#00B0C8]'
                            : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab.label} ({statusCounts[tab.id]})
                    </button>
                ))}
            </div> */}
            {/* Orders Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referencia</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nuevo cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entrega</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pago</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.length > 0 ? (
                            orders.map(order => (
                                <tr key={order.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.reference}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.newCustomer ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {order.newCustomer ? 'Sí' : 'No'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.delivery}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.total}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.payment}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Pago aceptado' ? 'bg-green-100 text-green-800' :
                                                order.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                                    order.status === 'Enviado' ? 'bg-blue-100 text-[#00B0C8]' :
                                                        'bg-red-100 text-red-800'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button className="text-[#00B0C8] hover:text-[#00B0C870]">
                                                <FiEye />
                                            </button>
                                            <button className="text-yellow-600 hover:text-yellow-900">
                                                <FiEdit />
                                            </button>
                                            <button className="text-red-600 hover:text-red-900">
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10" className="px-6 py-4 text-center text-sm text-gray-500">
                                    No se encontraron pedidos
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
