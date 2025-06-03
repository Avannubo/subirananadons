'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function ResetPassword({ params }) {
    const router = useRouter();
    const [isValidToken, setIsValidToken] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const verifyToken = async () => {
            const { token } = params;
            if (!token) {
                toast.error('Token de recuperación no válido');
                router.push('/');
                return;
            }

            try {
                const response = await fetch('/api/auth/verify-reset-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message);
                }

                setIsValidToken(true);
            } catch (error) {
                toast.error('Este enlace ya ha expirado o ya ha sido utilizado. Por favor, solicita un nuevo enlace de recuperación.');
                setTimeout(() => router.push('/'), 3000);
            } finally {
                setIsLoading(false);
            }
        };

        verifyToken();
    }, [params, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: params.token,
                    password: formData.password
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message);
            }

            toast.success('Contraseña actualizada correctamente');
            setTimeout(() => router.push('/'), 2000);
        } catch (error) {
            toast.error(error.message || 'Error al actualizar la contraseña');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B0C8]"></div>
            </div>
        );
    }

    if (!isValidToken) {
        return null; // The useEffect will handle the redirection
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
                <div>
                    <h2 className="text-center text-3xl font-bold text-gray-900">
                        Restablecer contraseña
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Este es un enlace de un solo uso. Si necesitas restablecer tu contraseña nuevamente,
                        deberás solicitar un nuevo enlace.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Nueva contraseña
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                minLength={6}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirmar nueva contraseña
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#00B0C8] hover:bg-[#00a2b8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B0C8]"
                        >
                            Actualizar contraseña
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
