export default function PagoTab() {
    const paymentModules = [
        { name: 'Pasarela Unificada de Redsys para Prestashop', currencies: ['EUR'], groups: ['Visitante', 'Invitado', 'Cliente'], countries: ['ES', 'FR', 'PT'], carriers: [47, 48] }
    ];

    const currencies = ['EUR'];
    const groups = ['Visitante', 'Invitado', 'Cliente'];
    const countries = ['España (ES)', 'Francia (FR)', 'Portugal (PT)'];

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Preferencias de Pago</h2>
            <p className="text-gray-600 mb-6">Aquí es donde decides que módulos de pago hay disponibles para las diferentes variaciones como moneda, grupo y país.</p>
            <p className="text-gray-600 mb-6">Una casilla marcada indica que quieres activar el módulo de pago. Si no está marcado significa que el módulo de pago está desactivado.</p>

            <div className="space-y-8">
                {paymentModules.map((module, index) => (
                    <div key={index} className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-lg font-medium mb-4">{module.name}</h3>

                        <div className="space-y-6">
                            <div>
                                <h4 className="text-md font-medium mb-3">Restricciones por moneda</h4>
                                <p className="text-sm text-gray-600 mb-3">Por favor, marca cada casilla de verificación de la moneda o monedas para las que quieres que el (los) módulo(s) de pago esté(n) disponible(s).</p>

                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Restricciones por moneda</th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">{module.name}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currencies.map((currency) => (
                                            <tr key={currency}>
                                                <td className="px-4 py-2">{currency} (EUR)</td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="checkbox"
                                                        defaultChecked={module.currencies.includes(currency)}
                                                        className="h-4 w-4 text-[#00B0C8] border-gray-300 rounded"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td className="px-4 py-2">Moneda del cliente</td>
                                            <td className="px-4 py-2">--</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-2">Moneda predeterminada de la tienda</td>
                                            <td className="px-4 py-2">--</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div>
                                <h4 className="text-md font-medium mb-3">Restricciones por grupo</h4>
                                <p className="text-sm text-gray-600 mb-3">Por favor, marca cada grupo de clientes para el cual quieres que esté disponible el/los módulos de pago.</p>

                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Restricciones por grupo</th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">{module.name}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {groups.map((group) => (
                                            <tr key={group}>
                                                <td className="px-4 py-2">{group}</td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="checkbox"
                                                        defaultChecked={module.groups.includes(group)}
                                                        className="h-4 w-4 text-[#00B0C8] border-gray-300 rounded"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div>
                                <h4 className="text-md font-medium mb-3">Restricciones por país</h4>
                                <p className="text-sm text-gray-600 mb-3">Por favor, marca cada casilla de verificación para el país o los países en los que quieres que estén disponibles los módulos de pago.</p>

                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Restricciones por país</th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">{module.name}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {countries.map((country) => {
                                            const countryCode = country.split(' ')[1].replace(/[()]/g, '');
                                            return (
                                                <tr key={countryCode}>
                                                    <td className="px-4 py-2">{country}</td>
                                                    <td className="px-4 py-2">
                                                        <input
                                                            type="checkbox"
                                                            defaultChecked={module.countries.includes(countryCode)}
                                                            className="h-4 w-4 text-[#00B0C8] border-gray-300 rounded"
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div>
                                <h4 className="text-md font-medium mb-3">Restricciones por transportista</h4>
                                <p className="text-sm text-gray-600 mb-3">Por favor, marca para cada módulo el/los transportista(s) que quieres activar.</p>

                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Restricciones por transportista</th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">{module.name}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="px-4 py-2">47 - MRW (gratuit a partir de 60€) Només península (¡Envío en 24h!)</td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="checkbox"
                                                    defaultChecked={module.carriers.includes(47)}
                                                    className="h-4 w-4 text-[#00B0C8] border-gray-300 rounded"
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-2">48 - Lliurament exclusiu llistes de naixement (Subirananadons se encarga de la entrega directa a los padres del bebé)</td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="checkbox"
                                                    defaultChecked={module.carriers.includes(48)}
                                                    className="h-4 w-4 text-[#00B0C8] border-gray-300 rounded"
                                                />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
