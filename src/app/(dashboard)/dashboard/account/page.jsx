import { AuthCheck } from '@/components/auth/AuthCheck';
import AdminLayout from '@/components/Layouts/admin-layout';

export default async function Page() {
    return (
        <AuthCheck>
            <AdminLayout>
                <div className="mx-auto p-6">
                    <h1 className="text-2xl font-bold mb-6">Mi Cuenta</h1>
                    <div className="bg-white rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-6 border-b pb-2">Tu información personal</h2>
                        <form className="space-y-6">
                            {/* Nombre */}
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    defaultValue="Marc"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Solo se permiten caracteres alfabéticos (letras) y el punto (.), seguidos de un espacio.
                                </p>
                            </div>
                            {/* Apellidos */}
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Apellidos
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    defaultValue="Marí"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Solo se permiten caracteres alfabéticos (letras) y el punto (.), seguidos de un espacio.
                                </p>
                            </div>
                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Dirección de correo electrónico
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    defaultValue="marc.mari@avannubo.com"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                                />
                            </div>
                            {/* Current Password */}
                            <div>
                                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        id="currentPassword"
                                        defaultValue="•••••••••••••••••••"
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-2 top-2 text-[#00B0C8] text-sm font-medium"
                                    >
                                        Cambiar
                                    </button>
                                </div>
                            </div>
                            {/* New Password */}
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Nueva contraseña
                                </label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    placeholder="Opcional"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                                />
                            </div>
                            {/* Birth Date */}
                            <div>
                                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha de nacimiento
                                </label>
                                <input
                                    type="text"
                                    id="birthDate"
                                    defaultValue="26/11/1991"
                                    placeholder="Ejemplo: 31/05/1970"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                                />
                                <p className="mt-1 text-xs text-gray-500">Opcional</p>
                            </div>
                            {/* Privacy Section */}
                            <div className="pt-4 border-t border-gray-200">
                                <div className="flex items-start mb-4">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="partnerOffers"
                                            name="partnerOffers"
                                            type="checkbox"
                                            className="focus:ring-[#00B0C860] h-4 w-4 text-[#00B0C8] border-gray-300 rounded"
                                        />
                                    </div>
                                    <label htmlFor="partnerOffers" className="ml-2 block text-sm text-gray-700">
                                        Recibir ofertas de nuestros socios
                                    </label>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-md mb-4">
                                    <p className="text-sm text-gray-600">
                                        The personal data you provide is used to answer queries, process orders or allow access to specific information.
                                        You have the right to modify and delete all the personal information found in the "My Account" page.
                                    </p>
                                </div>
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="newsletter"
                                            name="newsletter"
                                            type="checkbox"
                                            className="focus:ring-[rgba(0,177,200,0.66)] h-4 w-4 text-[#00B0C8] border-gray-300 rounded"
                                        />
                                    </div>
                                    <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-700">
                                        Suscribirse a nuestro boletín de noticias
                                        <span className="block text-xs text-gray-500 mt-1">
                                            Puede darse de baja en cualquier momento. Para ello, consulte nuestra información de contacto en el aviso legal.
                                        </span>
                                    </label>
                                </div>
                            </div>
                            {/* Submit Button */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#00B0C8] text-white rounded-md hover:bg-[#00B0C890] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B0C860]"
                                >
                                    Guardar cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </AdminLayout>
        </AuthCheck>
    );
}