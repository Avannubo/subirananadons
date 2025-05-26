'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogTitle } from '@headlessui/react';
import { FiX, FiUser, FiMail, FiBell, FiCheck } from 'react-icons/fi';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useClientStats } from '@/contexts/ClientStatsContext';
export default function ClientModal({ isOpen, onClose, client, onSave }) {
    const { notifyChange } = useClientStats(); const [formData, setFormData] = useState({
        name: '',
        lastName: '',
        email: '',
        active: true,
        newsletter: false,
        partnerOffers: false,
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    // Initialize form data when client is provided

    useEffect(() => {
        if (client) {
            setFormData({
                name: client.name || '',
                lastName: client.lastName || '',
                email: client.email || '',
                active: client.active !== undefined ? client.active : true,
                newsletter: client.newsletter || false,
                partnerOffers: client.partnerOffers || false,
                password: '',
                confirmPassword: ''
            });
            // Set image preview if client has an image
            if (client.image) {
                setImagePreview(client.image);
            } else {
                setImagePreview(null);
            }
        } else {            // Reset form when adding new client
            setFormData({
                name: '',
                lastName: '',
                email: '',
                active: true,
                newsletter: false,
                partnerOffers: false,
                password: '',
                confirmPassword: ''
            });
            setImagePreview(null);
        }
        // Reset errors when form is reset
        setErrors({});
    }, [client]);



    // Handle form input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    // Form validation
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) {
            newErrors.name = 'El nombre es obligatorio';
        }
        if (!formData.lastName) {
            newErrors.lastName = 'Los apellidos son obligatorios';
        }
        if (!formData.email) {
            newErrors.email = 'El email es obligatorio';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'El formato del email no es válido';
        }

        // Only validate password if either password field is filled
        if (formData.password || formData.confirmPassword) {
            if (formData.password.length < 6) {
                newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
            }
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Las contraseñas no coinciden';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        try {
            // Save main client data
            await onSave(formData);
            // If password was provided, update it separately
            console.log('Client data saved:', client?._id);
            if (formData.password && client?._id) {
                const response = await fetch(`/api/users/${client._id}/password`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ password: formData.password }),
                });

                if (!response.ok) {
                    throw new Error('Failed to update password');
                }
            }

            toast.success(client ? 'Cliente actualizado correctamente' : 'Cliente añadido correctamente');
            // Notify the stats context that changes have been made
            await notifyChange();
            onClose();
        } catch (error) {
            console.error('Error saving client:', error);
            toast.error('Error al guardar el cliente');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                        <DialogTitle className="text-lg font-medium text-gray-800 flex items-center">
                            <FiUser className="mr-2 text-[#00B0C8]" />
                            {client ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}
                        </DialogTitle>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Left Column - Client Preview */}
                            <div className="md:col-span-1">
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col items-center">
                                    <h3 className="text-sm font-semibold text-gray-800 uppercase mb-4 flex items-center">
                                        <FiUser className="mr-2 text-[#00B0C8]" /> Perfil de Cliente
                                    </h3>
                                    <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden mb-4 flex items-center justify-center">
                                        {imagePreview ? (
                                            <Image
                                                src={imagePreview}
                                                alt="Client preview"
                                                width={128}
                                                height={128}
                                                className="object-cover w-full h-full"
                                            />
                                        ) : (
                                            <FiUser className="h-16 w-16 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="w-full mt-4">
                                        <div className="bg-white p-3 rounded-lg border border-gray-200 mb-2">
                                            <p className="text-sm font-medium text-gray-700">Estado:</p>
                                            <div className="flex items-center mt-1">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${formData.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {formData.active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                                            <p className="text-sm font-medium text-gray-700">Suscripciones:</p>
                                            <div className="flex flex-col space-y-1 mt-1">
                                                <span className={`flex items-center text-xs ${formData.newsletter ? 'text-green-600' : 'text-gray-500'}`}>
                                                    {formData.newsletter ? <FiCheck className="mr-1" /> : null}
                                                    Newsletter
                                                </span>
                                                <span className={`flex items-center text-xs ${formData.partnerOffers ? 'text-green-600' : 'text-gray-500'}`}>
                                                    {formData.partnerOffers ? <FiCheck className="mr-1" /> : null}
                                                    Ofertas de socios
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Right Column - Form Fields */}
                            <div className="md:col-span-2 space-y-6">
                                {/* Contact Information */}
                                <section className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-800 uppercase mb-2 flex items-center">
                                        <FiMail className="mr-2 text-[#00B0C8]" /> Información de Contacto
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                                Nombre <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className={`mt-1 block p-1 w-full rounded-md border-2 border-gray-300 focus:border-[#00B0C8] focus:ring-[#00B0C8] sm:text-sm ${errors.name ? 'border-red-500' : ''}`}
                                            />
                                            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                                                Apellidos <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                className={`mt-1 block p-1 w-full rounded-md border-2 border-gray-300 focus:border-[#00B0C8] focus:ring-[#00B0C8] sm:text-sm ${errors.lastName ? 'border-red-500' : ''}`}
                                            />
                                            {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`mt-1 block p-1 w-full rounded-md border-2 border-gray-300 focus:border-[#00B0C8] focus:ring-[#00B0C8] sm:text-sm ${errors.email ? 'border-red-500' : ''}`}
                                        />
                                        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                                    </div>                                </section>

                                {/* Password Change Section */}
                                <section className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-800 uppercase mb-2 flex items-center">
                                        <FiUser className="mr-2 text-[#00B0C8]" /> Cambiar Contraseña
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                                Nueva Contraseña
                                            </label>
                                            <input
                                                type="password"
                                                id="password"
                                                name="password"
                                                value={formData.password || ''}
                                                onChange={handleChange}
                                                className={`mt-1 block w-full rounded-md border-gray-300 border-2 p-1 focus:border-[#00B0C8] focus:ring-[#00B0C8] sm:text-sm ${errors.password ? 'border-red-500' : ''}`}
                                                placeholder="Dejar en blanco para mantener la actual"
                                            />
                                            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                                Confirmar Contraseña
                                            </label>
                                            <input
                                                type="password"
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                value={formData.confirmPassword || ''}
                                                onChange={handleChange}
                                                className={`mt-1 block w-full rounded-md border-gray-300 border-2 p-1 focus:border-[#00B0C8] focus:ring-[#00B0C8] sm:text-sm ${errors.confirmPassword ? 'border-red-500' : ''}`}
                                                placeholder="Dejar en blanco para mantener la actual"
                                            />
                                            {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
                                        </div>
                                    </div>
                                </section>

                                {/* Preferences */}
                                <section className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-800 uppercase mb-2 flex items-center">
                                        <FiBell className="mr-2 text-[#00B0C8]" /> Preferencias
                                    </h3>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <div className="flex items-center mb-3">
                                            <input
                                                id="active"
                                                name="active"
                                                type="checkbox"
                                                checked={formData.active}
                                                onChange={handleChange}
                                                className="h-4 w-4 text-[#00B0C8] focus:ring-[#00B0C8] border-gray-300 border-2  rounded"
                                            />
                                            <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                                                Cuenta activa
                                            </label>
                                        </div>
                                        <div className="flex items-center mb-3">
                                            <input
                                                id="newsletter"
                                                name="newsletter"
                                                type="checkbox"
                                                checked={formData.newsletter}
                                                onChange={handleChange}
                                                className="h-4 w-4 text-[#00B0C8] focus:ring-[#00B0C8] border-gray-300 border-2  rounded"
                                            />
                                            <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-700">
                                                Suscrito al newsletter
                                            </label>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                id="partnerOffers"
                                                name="partnerOffers"
                                                type="checkbox"
                                                checked={formData.partnerOffers}
                                                onChange={handleChange}
                                                className="h-4 w-4 text-[#00B0C8] focus:ring-[#00B0C8] border-gray-300 border-2  rounded"
                                            />
                                            <label htmlFor="partnerOffers" className="ml-2 block text-sm text-gray-700">
                                                Recibir ofertas de socios
                                            </label>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end space-x-3 border-t border-gray-200 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 border-2  rounded-md  text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B0C8]"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 border border-transparent rounded-md  text-sm font-medium text-white bg-[#00B0C8] hover:bg-[#00B0C890] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B0C8]"
                            >
                                {loading ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </form>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
} 