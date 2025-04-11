import AdminLayout from '@/app/(dashboard)/dashboard/admin-layout';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers'
export default async function GiftListsPage() {
    const cookieStore = cookies()
    const token = await cookieStore.has('token');
    if (!token) {
        redirect('/');
    }
    return (
        <AdminLayout>
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-6">Gestión de Listas de Regalos</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Configuration Card 1 */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">Configuración General</h2>
                        <ul className="space-y-3">
                            <li className="flex justify-between items-center">
                                <span>Modo Vista Previa</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked={false} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00B0C8]"></div>
                                </label>
                            </li>
                            <li className="flex justify-between items-center">
                                <span>Mostrar Bloque Lateral</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked={true} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00B0C8]"></div>
                                </label>
                            </li>
                        </ul>
                    </div>
                    {/* Configuration Card 2 */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">Configuración de Emails</h2>
                        <ul className="space-y-3">
                            <li className="flex justify-between items-center">
                                <span>Email al comprar regalo</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked={true} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00B0C8]"></div>
                                </label>
                            </li>
                            <li className="flex justify-between items-center">
                                <span>Email al crear lista</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked={true} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00B0C8]"></div>
                                </label>
                            </li>
                            <li className="flex justify-between items-center">
                                <span>Incluir imágenes en PDF</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked={false} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00B0C8]"></div>
                                </label>
                            </li>
                        </ul>
                    </div>
                    {/* Configuration Card 3 */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">Diseño y Visualización</h2>
                        <ul className="space-y-3">
                            <li className="flex justify-between items-center">
                                <span>Mostrar en página de inicio</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked={true} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00B0C8]"></div>
                                </label>
                            </li>
                            <li className="flex justify-between items-center">
                                <span>Ancho de columna</span>
                                <select className="border rounded px-2 py-1 text-sm border-gray-200">
                                    <option>Ancho completo</option>
                                    <option>3-Un cuarto (3/4)</option>
                                    <option>2-Un tercio (2/3)</option>
                                    <option>La mitad (1/2)</option>
                                    <option>Un tercio (1/3)</option>
                                    <option>Un cuarto (1/4)</option>
                                </select>
                            </li>
                            <li className="flex justify-between items-center">
                                <span>Tema de diseño</span>
                                <select className="border rounded px-2 py-1 text-sm border-gray-200">
                                    <option>Modern 1</option>
                                    <option>Por defecto PS 1.5</option>
                                    <option>Classic</option>
                                </select>
                            </li>
                        </ul>
                    </div>
                </div>
                {/* Advanced Options Section */}
                <div className="mt-8 bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Opciones Avanzadas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Option 1 */}
                        <div className="border rounded-lg p-4 border-gray-200">
                            <h3 className="font-medium">Imagen de bienvenida</h3>
                            <p className="text-sm text-gray-600 mb-3">Configuración de la imagen mostrada en las listas</p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Opción seleccionada</span>
                                <select className="border rounded px-2 py-1 text-sm border-gray-200">
                                    <option>Ninguna</option>
                                    <option>Subida por clientes</option>
                                    <option>Subida por administrador</option>
                                </select>
                            </div>
                        </div>
                        {/* Option 2 */}
                        <div className="border rounded-lg p-4 border-gray-200">
                            <h3 className="font-medium">Dirección del propietario</h3>
                            <p className="text-sm text-gray-600 mb-3">Permitir ver direcciones de los propietarios</p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Activar/Desactivar</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked={true} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00B0C8]"></div>
                                </label>
                            </div>
                        </div>
                        {/* Option 3 */}
                        <div className="border rounded-lg p-4 border-gray-200">
                            <h3 className="font-medium">Creación de listas</h3>
                            <p className="text-sm text-gray-600 mb-3">Permitir creación sin aprobación</p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Activar/Desactivar</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked={true} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00B0C8]"></div>
                                </label>
                            </div>
                        </div>
                        {/* Option 4 */}
                        <div className="border rounded-lg p-4 border-gray-200">
                            <h3 className="font-medium">Mostrar en factura</h3>
                            <p className="text-sm text-gray-600 mb-3">Mostrar información en PDF y Back Office</p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Activar/Desactivar</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked={true} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00B0C8]"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Button Design Section */}
                {/* <div className="mt-8 bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Diseño del Botón 'Agregar a la lista'</h2>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Mostrar botón</label>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked={true} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00B0C8]"></div>
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Tipo de botón</label>
                                <select className="border rounded w-full border-gray-200 p-2">
                                    <option>Solo texto</option>
                                    <option>Solo icono</option>
                                    <option>Texto e icono</option>
                                </select>
                            </div>
                        </div>
                        <div className="border-t border-gray-200 pt-4">
                            <h3 className="font-medium mb-3">Personalización de diseño</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Clase CSS</label>
                                    <input type="text" className="border rounded w-full border-gray-200 p-2" placeholder="Dejar en blanco para desactivar" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Color de fondo</label>
                                        <input type="color" className="w-full h-10" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Color de texto</label>
                                        <input type="color" className="w-full h-10" />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tamaño de fuente (px)</label>
                                    <input type="number" className="border rounded w-full border-gray-200 p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Grosor de fuente</label>
                                    <input type="number" className="border rounded w-full border-gray-200 p-2" placeholder="300, 400, 600..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Margen</label>
                                    <input type="text" className="border rounded w-full border-gray-200 p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Relleno</label>
                                    <input type="text" className="border rounded w-full border-gray-200 p-2" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <h4 className="text-sm font-medium mb-2">Efecto Hover</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Color de fondo (hover)</label>
                                        <input type="color" className="w-full h-10" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Color de texto (hover)</label>
                                        <input type="color" className="w-full h-10" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> */}
                {/* Behavior Configuration Section */}
                <div className="mt-8 bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Configuración de Comportamiento</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
                            <div>
                                <h3 className="font-medium">Lista publicada automáticamente</h3>
                                <p className="text-sm text-gray-600">Las nuevas listas se publican sin necesidad de aprobación</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked={true} />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00B0C8]"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
                            <div>
                                <h3 className="font-medium">Duplicar una lista</h3>
                                <p className="text-sm text-gray-600">Permitir a los usuarios duplicar listas existentes</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked={true} />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00B0C8]"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
                            <div>
                                <h3 className="font-medium">Búsqueda predictiva</h3>
                                <p className="text-sm text-gray-600">Habilitar búsqueda predictiva en el Back Office</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked={true} />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00B0C8]"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
                            <div>
                                <h3 className="font-medium">Modo cuadrícula</h3>
                                <p className="text-sm text-gray-600">Mostrar elementos en cuadrícula en Front Office</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked={true} />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00B0C8]"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-gray-200 rounded bg-yellow-50">
                            <div>
                                <h3 className="font-medium">Carritos mixtos entre listas</h3>
                                <p className="text-sm text-gray-600">Permitir mezclar regalos de diferentes listas (no recomendado)</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked={false} />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00B0C8]"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-gray-200 rounded bg-yellow-50">
                            <div>
                                <h3 className="font-medium">Carritos mixtos - agregar primero</h3>
                                <p className="text-sm text-gray-600">Primero agregar al carrito, luego ofrecer el regalo (no recomendado)</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked={false} />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00B0C8]"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}