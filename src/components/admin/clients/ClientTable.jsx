'use client';
import { FiEdit, FiTrash2, FiEye } from 'react-icons/fi';

export default function ClientsTable({ clients, onEditClient, onDeleteClient, onViewClient }) {
    // console.log('ClientsTable rendered with clients:', clients);
    // Locale detection (default to 'ca')
    let locale = 'ca';
    if (typeof window !== 'undefined' && window.navigator) {
        const lang = window.navigator.language || window.navigator.userLanguage;
        if (lang && lang.toLowerCase().startsWith('es')) locale = 'es';
    }
    // Translations
    const translations = {
        ca: {
            id: 'ID',
            name: 'Nom',
            lastName: 'Cognoms',
            email: 'Email',
            sales: 'Vendes',
            active: 'Actiu',
            yes: 'Sí',
            no: 'No',
            actions: 'Accions',
            view: 'Veure detalls del client',
            edit: 'Editar client',
            delete: 'Eliminar client',
            notFound: 'No s\'han trobat clients',
        },
        es: {
            id: 'ID',
            name: 'Nombre',
            lastName: 'Apellidos',
            email: 'Email',
            sales: 'Ventas',
            active: 'Activado',
            yes: 'Sí',
            no: 'No',
            actions: 'Acciones',
            view: 'Ver detalles del cliente',
            edit: 'Editar cliente',
            delete: 'Eliminar cliente',
            notFound: 'No se encontraron clientes',
        }
    };
    const t = translations[locale];
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.id}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.name}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.lastName}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.email}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.sales}</th>
                        {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.active}</th> */}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.actions}</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {clients.length > 0 ? (
                        clients.map((client, index) => (
                            <tr key={client.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.lastName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {client.sales || '--'}
                                </td>
                                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${client.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {client.active ? t.yes : t.no}
                                    </span>
                                </td> */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                                    <button
                                        onClick={() => onViewClient(client)}
                                        className="text-[#00B0C8] hover:text-[#008A9B] cursor-pointer"
                                        title={t.view}
                                    >
                                        <FiEye size={20} />
                                    </button>
                                    <button
                                        onClick={() => onEditClient(client)}
                                        className="text-yellow-600 hover:text-yellow-900 cursor-pointer"
                                        title={t.edit}
                                    >
                                        <FiEdit size={20} />
                                    </button>
                                    <button
                                        onClick={() => onDeleteClient(client)}
                                        className="text-red-600 hover:text-red-900 cursor-pointer"
                                        title={t.delete}
                                    >
                                        <FiTrash2 size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                {t.notFound}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}