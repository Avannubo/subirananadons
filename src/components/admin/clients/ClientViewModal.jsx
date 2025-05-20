'use client';
import { Dialog } from '@headlessui/react';
import { FiX, FiUser, FiMail, FiCalendar, FiShoppingBag, FiBell } from 'react-icons/fi';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function ClientViewModal({ isOpen, onClose, client }) {
    if (!client) return null;

    // Format date to local format
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden">
                    {/* Header with client name */}
                    <div className="flex justify-between items-center p-4 border-b border-gray-300 bg-gray-50">
                        <Dialog.Title className="text-lg font-medium text-gray-800 flex items-center">
                            <FiUser className="mr-2 text-[#00B0C8]" />
                            {client.name} {client.lastName}
                        </Dialog.Title>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
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
                                                <Image
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
                                        <p className="text-sm text-gray-500 mt-1">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${client.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {client.active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </p>
                                        <p className="text-sm text-gray-600 mt-2">
                                            Cliente desde {formatDate(client.registrationDate)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Right column - Detailed Information */}
                            <div className="md:col-span-2 space-y-6">
                                {/* Contact Information */}
                                <section className="border-b border-gray-200 pb-4 space-y-2">
                                    <h3 className="text-sm font-semibold text-gray-800 uppercase mb-3 flex items-center">
                                        <FiMail className="mr-2 text-[#00B0C8]" /> Información de Contacto
                                    </h3>
                                    <div className="space-y-2">
                                        <div className='bg-gray-50 p-2 rounded-lg border border-gray-200'>
                                            <span className="text-sm font-medium text-gray-500">Email:</span>
                                            <p className="text-sm text-gray-700">{client.email || 'N/A'}</p>
                                        </div>
                                        <div className='bg-gray-50 p-2 rounded-lg border border-gray-200'>
                                            <span className="text-sm font-medium text-gray-500">ID de cliente:</span>
                                            <p className="text-sm text-gray-700">{client.id || 'N/A'}</p>
                                        </div>
                                    </div>
                                </section>

                                {/* Preferences Information */}
                                <section className="border-b border-gray-200 pb-4">
                                    <h3 className="text-sm font-semibold text-gray-800 uppercase mb-3 flex items-center">
                                        <FiBell className="mr-2 text-[#00B0C8]" /> Preferencias
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                                            <span className="text-sm font-medium text-gray-500">Newsletter:</span>
                                            <p className={`text-sm ${client.newsletter ? 'text-green-600' : 'text-red-600'}`}>
                                                {client.newsletter ? 'Suscrito' : 'No suscrito'}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                                            <span className="text-sm font-medium text-gray-500">Ofertas de socios:</span>
                                            <p className={`text-sm ${client.partnerOffers ? 'text-green-600' : 'text-red-600'}`}>
                                                {client.partnerOffers ? 'Suscrito' : 'No suscrito'}
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                {/* Purchase Information */}
                                <section>
                                    <h3 className="text-sm font-semibold text-gray-800 uppercase mb-3 flex items-center">
                                        <FiShoppingBag className="mr-2 text-[#00B0C8]" /> Historial de Compras
                                    </h3>
                                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                                        <span className="text-sm font-medium text-gray-500">Total de compras:</span>
                                        <p className="text-base font-medium text-gray-800">
                                            {client.sales || 0} pedidos
                                        </p>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                        >
                            Cerrar
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
} 