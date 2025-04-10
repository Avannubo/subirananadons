'use client'; // Mark as client component since we'll use interactivity

import { FiEdit, FiTrash2, FiEye, FiSearch, FiFilter } from 'react-icons/fi';

export default function ProductsTable({ products }) {
    return (
        <div className="bg-white rounded-lg shadow">
            {/* Table Header with Actions */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Productos</h2>
                <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-[#00B0C8] text-white rounded hover:bg-[#00B0C8]">
                        Añadir producto
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                        Seleccionar todos
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="p-4 border-b border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                    <FiSearch className="absolute left-3 top-3 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre"
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                    />
                </div>
                <div className="relative">
                    <FiSearch className="absolute left-3 top-3 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar ref."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                    />
                </div>
                <div className="relative">
                    <FiSearch className="absolute left-3 top-3 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar categoría"
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                    />
                </div>
                <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                    <FiFilter className="mr-2" />
                    Filtros
                </button>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ID
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Imagen
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nombre
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Referencia
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Categoría
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Precio (imp. excl.)
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Precio (imp. incl.)
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {product.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="h-10 w-10 rounded object-cover"
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {product.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {product.reference}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {product.category}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {product.price_excl_tax}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {product.price_incl_tax}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {product.status === 'active' ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
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
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination - You might want to make this a separate component */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Mostrando <span className="font-medium">1</span> a <span className="font-medium">10</span> de <span className="font-medium">20</span> resultados
                        </p>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                <span className="sr-only">Anterior</span>
                                &larr;
                            </button>
                            <button aria-current="page" className="z-10 bg-blue-50 border-[#00B0C8] text-[#00B0C8] relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                                1
                            </button>
                            <button className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                                2
                            </button>
                            <button className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                                3
                            </button>
                            <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                <span className="sr-only">Siguiente</span>
                                &rarr;
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
}