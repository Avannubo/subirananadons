export default function TransportistasTab() {
    const transportistas = [
        {
            id: 47,
            nombre: 'MRW (gratuit a partir de 60€) Només península',
            logo: '',
            retraso: '¡Envío en 24h!',
            estado: true,
            envioGratis: true,
            posicion: 1
        },
        {
            id: 48,
            nombre: 'Lliurament exclusiu llistes de naixement',
            logo: '',
            retraso: 'Subirananadons se encarga de la entrega directa a los padres del bebé',
            estado: true,
            envioGratis: false,
            posicion: 2
        }
    ];

    return (
        <div className="space-y-12 ">

            <div className="overflow-x-auto">
                <h2 className="text-xl font-semibold mb-4">Transportistas</h2>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logotipo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retraso</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Envío gratis</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posición</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {transportistas.map((t) => (
                            <tr key={t.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t.nombre}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {t.logo ? <img src={t.logo} alt="Logo" className="h-10" /> : '--'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.retraso}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${t.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {t.estado ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${t.envioGratis ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {t.envioGratis ? 'Sí' : 'No'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.posicion}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button className="text-[#00B0C8] hover:text-[#00b1c8ad] mr-3">Editar</button>
                                    <button className="text-red-600 hover:text-red-900">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div>
                <h2 className="text-xl font-semibold mb-4">Preferencias</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className=" p-4 rounded-lg">
                        <h3 className="text-lg font-medium mb-3">Manipulación</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gastos de manipulación y gestión</label>
                                <div className="flex">
                                    <input
                                        type="number"
                                        className="border border-gray-200 rounded-l px-3 py-2 w-full"
                                        defaultValue="2.00"
                                        step="0.01"
                                    />
                                    <span className="bg-gray-200 px-3 py-2 rounded-r text-nowrap">€ (impuestos excl.)</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Envío gratuito a partir de</label>
                                <div className="flex">
                                    <input
                                        type="number"
                                        className="border border-gray-200 rounded-l px-3 py-2 w-full"
                                        defaultValue="0.000000"
                                        step="0.000001"
                                    />
                                    <span className="bg-gray-200 px-3 py-2 rounded-r">€</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Envío gratuito a partir de</label>
                                <div className="flex">
                                    <input
                                        type="number"
                                        className="border border-gray-200 rounded-l px-3 py-2 w-full"
                                        defaultValue="0"
                                    />
                                    <span className="bg-gray-200 px-3 py-2 rounded-r">kg</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className=" p-4 rounded-lg">
                        <h3 className="text-lg font-medium mb-3">Opciones del transportista</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Transportista predeterminado</label>
                                <select className="border border-gray-200 rounded w-full px-3 py-2">
                                    <option>MRW (gratuit a partir de 60€) Només península</option>
                                    <option>Lliurament exclusiu llistes de naixement</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Transportista por defecto de tu tienda.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
                                <select className="border border-gray-200 rounded w-full px-3 py-2">
                                    <option>Precio</option>
                                    <option>Nombre</option>
                                    <option>Posición</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Esto solo será visible en el Front Office.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
                                <select className="border border-gray-200 rounded w-full px-3 py-2">
                                    <option>Ascendente</option>
                                    <option>Descendente</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Esto solo será visible en el Front Office.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}