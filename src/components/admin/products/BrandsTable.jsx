'use client';

import { FiFilter, FiSearch, FiUpload, FiDownload, FiEdit } from 'react-icons/fi';
import { useState } from 'react';

export default function BrandsTable({ brands }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showEnabledOnly, setShowEnabledOnly] = useState(false);

    const filteredBrands = brands.filter((brand) => {
        const matchesSearch =
            brand.id.toString().includes(searchTerm) ||
            brand.name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = !showEnabledOnly || brand.enabled;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Header with title and actions */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Marcas ({filteredBrands.length})</h2>
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
                            placeholder="Buscar marcas (por ID o nombre)"
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
                            <span>Mostrar solo marcas activas</span>
                        </label>
                        <button className="flex items-center px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                            <FiFilter className="mr-2" />
                            Filtros avanzados
                        </button>
                    </div>
                </div>
            </div>

            {/* Info text */}
            {/* <div className="p-4 border-b border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-600">
                    La visualización de tus marcas está activada en tu tienda. Dirígete a{' '}
                    <span className="underline">Parámetros de la Tienda &gt; Configuración</span> para editar la configuración.
                </p>
            </div> */}

            {/* Brands table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logotipo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Direcciones</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productos</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredBrands.map((brand) => (
                            <tr key={brand.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {brand.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {brand.logo ? (
                                        <img src={brand.logo} alt={brand.name} className="w-10 h-10 object-contain" />
                                    ) : (
                                        <span className="text-gray-400 italic text-sm">--</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{brand.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {brand.addresses || '--'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {brand.products}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${brand.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                                        {brand.enabled ? 'Activado' : 'Desactivado'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button className="flex items-center text-gray-600 hover:text-gray-900">
                                        <FiEdit className="mr-1" />
                                        Editar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}