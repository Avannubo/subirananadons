'use client';
import { Dialog } from '@headlessui/react';
import { FiX, FiUser, FiMail, FiShoppingBag } from 'react-icons/fi';
import { useState, useEffect } from 'react';
export default function ClientViewModal({ isOpen, onClose, client }) {
    const [orderCount, setOrderCount] = useState(0);
    useEffect(() => {
        if (!client) return;
        const fetchOrderCount = async () => {
            try {
                // Get all possible ID forms from the client object
                const userId = client._id || client.id; 
                if (!userId) {
                    console.error('[ClientViewModal] No valid user ID found:', client);
                    return;
                }
                const res = await fetch(`/api/orders/count`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: userId,
                        email: client.email,
                        client: {
                            id: userId,
                            email: client.email
                        }
                    })
                });
                if (!res.ok) {
                    throw new Error(`Failed to fetch order count: ${res.status} ${res.statusText}`);
                }
                const data = await res.json();
                //console.log('[ClientViewModal] Order count response:', data);
                setOrderCount(data.count || 0);
            } catch (err) {
                console.error('[ClientViewModal] Error fetching order count:', err);
                setOrderCount(0);
            }
        };
        fetchOrderCount();
    }, [client]);
    if (!client) return null;
    // Locale detection (default to 'ca')
    let locale = 'ca';
    if (typeof window !== 'undefined' && window.navigator) {
        const lang = window.navigator.language || window.navigator.userLanguage;
        if (lang && lang.toLowerCase().startsWith('es')) locale = 'es';
    }
    // Translations
    const translations = {
        ca: {
            active: 'Actiu',
            inactive: 'Inactiu',
            clientSince: 'Client des de',
            contact: 'Informació de Contacte',
            email: 'Email',
            clientId: 'ID de client',
            preferences: 'Preferències',
            newsletter: 'Newsletter',
            offers: 'Ofertes de socis',
            subscribed: 'Subscrito',
            notSubscribed: 'No subscrit',
            purchaseHistory: 'Historial de Compres',
            totalOrders: 'Total de compres',
            orders: 'comandes',
            close: 'Tancar',
        },
        es: {
            active: 'Activo',
            inactive: 'Inactivo',
            clientSince: 'Cliente desde',
            contact: 'Información de Contacto',
            email: 'Email',
            clientId: 'ID de cliente',
            preferences: 'Preferencias',
            newsletter: 'Newsletter',
            offers: 'Ofertas de socios',
            subscribed: 'Suscrito',
            notSubscribed: 'No suscrito',
            purchaseHistory: 'Historial de Compras',
            totalOrders: 'Total de compras',
            orders: 'pedidos',
            close: 'Cerrar',
        }
    };
    const t = translations[locale];
    // Format date to local format
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString(locale === 'ca' ? 'ca-ES' : 'es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };
    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden">
                    {/* Header with client name */}
                    <div className="flex justify-between items-center p-4 border-b border-gray-300 bg-gray-50">
                        <Dialog.Title className="text-lg font-medium text-gray-800 flex items-center">
                            <FiUser className="mr-2 text-[#36A9E1]" />
                            {client.name} {client.lastName}
                        </Dialog.Title>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 cursor-pointer"
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="p-6 max-h-[80vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Left column - Client Info */}
                            <div className="md:col-span-1 flex flex-col items-start">
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 w-full">
                                    <div className="flex justify-center mb-4">
                                        <div className="relative h-32 w-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                            {client.image ? (
                                                <img
                                                    src={client.image}
                                                    alt={`${client.name} ${client.lastName}`}
                                                    fill
                                                    style={{ objectFit: 'cover' }}
                                                    className="rounded-full"
                                                />
                                            ) : (
                                                <FiUser className="h-16 w-16 text-gray-400" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-xl font-semibold text-gray-800">
                                            {client.name} {client.lastName}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-2">
                                            {t.clientSince} {formatDate(client.registrationDate)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* Right column - Detailed Information */}
                            <div className="md:col-span-2 space-y-6">
                                {/* Contact Information */}
                                <section className="border-b border-gray-200 pb-4 space-y-2">
                                    <h3 className="text-sm font-semibold text-gray-800 uppercase mb-3 flex items-center">
                                        <FiMail className="mr-2 text-[#36A9E1]" /> {t.contact}
                                    </h3>
                                    <div className="space-y-2">
                                        <div className='bg-gray-50 p-2 rounded-lg border border-gray-200'>
                                            <span className="text-sm font-medium text-gray-500">{t.email}:</span>
                                            <p className="text-sm text-gray-700">{client.email || 'N/A'}</p>
                                        </div>
                                        <div className='bg-gray-50 p-2 rounded-lg border border-gray-200'>
                                            <span className="text-sm font-medium text-gray-500">{t.clientId}:</span>
                                            <p className="text-sm text-gray-700">{client.id || 'N/A'}</p>
                                        </div>
                                    </div>
                                </section>
                                <section>
                                    <h3 className="text-sm font-semibold text-gray-800 uppercase mb-3 flex items-center">
                                        <FiShoppingBag className="mr-2 text-[#36A9E1]" /> {t.purchaseHistory}
                                    </h3>
                                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                                        <span className="text-sm font-medium text-gray-500">{t.totalOrders}:</span>
                                        <p className="text-base font-medium text-gray-800">
                                            {orderCount} {t.orders}
                                        </p>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 cursor-pointer transition-colors"
                        >
                            {t.close}
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
} 