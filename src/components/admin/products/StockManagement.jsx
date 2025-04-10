'use client';
import { FiFilter, FiSearch, FiUpload, FiDownload, FiEdit } from 'react-icons/fi';
import { useState } from 'react';

export default function StockManagement({ products }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showLowStock, setShowLowStock] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [quantities, setQuantities] = useState({});

    // Filter products based on search and low stock preference
    const filteredProducts = products.filter(product => {
        const matchesSearch =
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.supplier && product.supplier.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStock = !showLowStock || product.available < product.stockLevel;

        return matchesSearch && matchesStock;
    });

    const handleQuantityChange = (id, field, value) => {
        setQuantities(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: parseInt(value) || 0
            }
        }));
    };

    const saveChanges = (id) => {
        // Implement your save logic here
        console.log(`Saving changes for ${id}:`, quantities[id]);
        setEditingId(null);
    };

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Header with title and actions */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Gestión de stock</h2>
                <div className="flex space-x-2">
                    <button className="flex items-center px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                        <FiUpload className="mr-2" />
                        Importar
                    </button>
                    <button className="flex items-center px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                        <FiDownload className="mr-2" />
                        Exportar
                    </button>
                </div>
            </div>

            {/* Search and filters */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="relative flex-grow">
                        <FiSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Búsqueda de productos (por nombre, referencia, proveedor)"
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={showLowStock}
                                onChange={() => setShowLowStock(!showLowStock)}
                                className="rounded border-gray-300 text-[#00B0C8] focus:ring-[#00B0C8]"
                            />
                            <span>Mostrar primero productos por debajo del nivel de stock</span>
                        </label>
                        <button className="flex items-center px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                            <FiFilter className="mr-2" />
                            Filtros avanzados
                        </button>
                    </div>
                </div>
            </div>

            {/* Stock table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referencia</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Físico</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reservado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disponible</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProducts.map((product) => (
                            <tr key={product.id} className={product.available < product.stockLevel ? 'bg-yellow-50' : ''}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {product.reference}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {product.supplier || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {product.status === 'active' ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {editingId === product.id ? (
                                        <input
                                            type="number"
                                            className="w-16 border rounded p-1"
                                            value={quantities[product.id]?.physical || product.physical}
                                            onChange={(e) => handleQuantityChange(product.id, 'physical', e.target.value)}
                                        />
                                    ) : (
                                        product.physical
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {editingId === product.id ? (
                                        <input
                                            type="number"
                                            className="w-16 border rounded p-1"
                                            value={quantities[product.id]?.reserved || product.reserved}
                                            onChange={(e) => handleQuantityChange(product.id, 'reserved', e.target.value)}
                                        />
                                    ) : (
                                        product.reserved
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {product.available}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {editingId === product.id ? (
                                        <button
                                            onClick={() => saveChanges(product.id)}
                                            className="text-[#00B0C8] hover:text-[#00B0C870]"
                                        >
                                            Guardar
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setEditingId(product.id)}
                                            className="flex items-center text-gray-600 hover:text-gray-900"
                                        >
                                            <FiEdit className="mr-1" />
                                            Editar cantidad
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}