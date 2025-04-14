"use client"
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function AuthModal() {

    const [isOpen, setIsOpen] = useState(false);
    const [activeView, setActiveView] = useState('login'); // 'login' or 'register'
    const [message, setMessage] = useState({ text: '', type: '' }); // { text: string, type: 'success' | 'error' }
    const modalRef = useRef(null);
    const backdropRef = useRef(null);
    const router = useRouter();

    const openLogin = () => {
        const token = Cookies.get('token');
        console.log(token);//im getting undefined

        if (token) {
            router.push("/dashboard");
        } else {
            setActiveView('login');
            setIsOpen(true);
            setMessage({ text: '', type: '' });
        }
    };

    // const openRegister = () => {
    //     setActiveView('register');
    //     setIsOpen(true);
    //     setMessage({ text: '', type: '' });
    // };

    const closeModal = () => {
        setIsOpen(false);
        setMessage({ text: '', type: '' });
    };

    const toggleView = () => {
        setActiveView(activeView === 'login' ? 'register' : 'login');
        setMessage({ text: '', type: '' });
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                if (backdropRef.current) {
                    backdropRef.current.style.opacity = '1';
                }
                if (modalRef.current) {
                    modalRef.current.style.opacity = '1';
                    modalRef.current.style.transform = 'translateY(0)';
                }
            }, 10);
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData(e.currentTarget);
            const email = formData.get('email');
            const password = formData.get('password');

            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.status === 200) {
                setMessage({ text: '¡Inicio de sesión exitoso!', type: 'success' });
                closeModal();
                router.push('/dashboard');
            } else {
                setMessage({ text: 'Error al iniciar sesión. Por favor intenta nuevamente.', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Error al iniciar sesión. Por favor intenta nuevamente.', type: 'error' });
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData(e.currentTarget);
            const name = formData.get('name');
            const email = formData.get('email');
            const password = formData.get('password');
            const confirmPassword = formData.get('confirmPassword');

            if (password !== confirmPassword) {
                setMessage({ text: 'Las contraseñas no coinciden', type: 'error' });
                setTimeout(() => setMessage({ text: '', type: '' }), 5000); // Clear message after 5 seconds
                return;
            }

            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            if (response.status === 200) {
                setMessage({ text: '¡Registro exitoso! Por favor inicia sesión.', type: 'success' });
                setActiveView('login');
            } else {
                setMessage({ text: 'Error en el registro. Por favor intenta nuevamente.', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Error en el registro. Por favor intenta nuevamente.', type: 'error' });
        }
    };

    return (
        <div className="flex">
            {message.text && (
                <div
                    className={`fixed top-4 right-4 z-[99] flex items-center space-x-2 px-4 py-3 rounded shadow-lg animate-slide-in ${message.type === 'success'
                        ? 'bg-green-100 border border-green-400 text-green-700'
                        : 'bg-red-100 border border-red-400 text-red-700'
                        }`}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M18 10c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zm-8-3a1 1 0 00-.707.293l-3 3a1 1 0 001.414 1.414L10 9.414l2.293 2.293a1 1 0 001.414-1.414l-3-3A1 1 0 0010 7z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <span>{message.text}</span>
                </div>
            )}
            <div className="flex">
                {/* Login Button */}
                <button
                    onClick={openLogin}
                    className="flex flex-row items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:text-[#00B0C8] rounded-md transition-colors"
                >
                    <svg className="hover:text-[#00B0C8]" width="34px" height="34px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M5 21C5 17.134 8.13401 14 12 14C15.866 14 19 17.134 19 21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                            stroke="#353535"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>

                {/* Register Button */}
                {/* <button
                onClick={openRegister}
                className="flex flex-row items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:text-[#00B0C8] rounded-md transition-colors"
            >
                <span>Registrarse</span>
            </button> */}

                {/* Modal */}
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        {/* Backdrop */}
                        <div
                            ref={backdropRef}
                            className="fixed inset-0 bg-[#00000050] bg-opacity-50 transition-opacity duration-800 opacity-0"
                        // onClick={closeModal}
                        />

                        {/* Modal Content */}
                        <div
                            ref={modalRef}
                            className="relative bg-white rounded-lg w-full max-w-md mx-4 opacity-0 transform translate-y-4 transition-all duration-800"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold">
                                        {activeView === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                                    </h2>
                                    <button
                                        onClick={closeModal}
                                        className="text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Login Form */}
                                {activeView === 'login' && (
                                    <form className="space-y-4" onSubmit={handleLoginSubmit}>
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                                Dirección de correo electrónico
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B0C8] focus:border-transparent transition-all"
                                                placeholder="Tu correo electrónico"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                                Contraseña
                                            </label>
                                            <input
                                                type="password"
                                                id="password"
                                                name="password"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B0C8] focus:border-transparent transition-all"
                                                placeholder="Tu contraseña"
                                                required
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <input
                                                    id="remember-me"
                                                    name="remember-me"
                                                    type="checkbox"
                                                    className="h-4 w-4 text-[#00B0C8] focus:ring-[#00B0C8] border-gray-300 rounded transition-all"
                                                />
                                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                                    Recuérdame
                                                </label>
                                            </div>
                                            <a href="#" className="text-sm text-[#00B0C8] hover:text-[#00a2b8] transition-colors">
                                                Se te olvidó tu contraseña
                                            </a>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-[#00B0C8] text-white py-2 px-4 rounded-md hover:bg-[#00a2b8] transition-colors"
                                        >
                                            INICIAR SESIÓN
                                        </button>

                                        <div className="mt-4 text-center">
                                            <p className="text-sm text-gray-600">
                                                ¿No tienes cuenta?{' '}
                                                <button
                                                    type="button"
                                                    onClick={toggleView}
                                                    className="text-[#00B0C8] hover:text-[#00a2b8] transition-colors"
                                                >
                                                    Cree uno aquí
                                                </button>
                                            </p>
                                        </div>
                                    </form>
                                )}

                                {/* Register Form */}
                                {activeView === 'register' && (
                                    <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                                Nombre completo
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B0C8] focus:border-transparent transition-all"
                                                placeholder="Tu nombre completo"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">
                                                Dirección de correo electrónico
                                            </label>
                                            <input
                                                type="email"
                                                id="register-email"
                                                name="email"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B0C8] focus:border-transparent transition-all"
                                                placeholder="Tu correo electrónico"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
                                                Contraseña
                                            </label>
                                            <input
                                                type="password"
                                                id="register-password"
                                                name="password"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B0C8] focus:border-transparent transition-all"
                                                placeholder="Tu contraseña"
                                                required
                                                minLength={6}
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                                Confirmar Contraseña
                                            </label>
                                            <input
                                                type="password"
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B0C8] focus:border-transparent transition-all"
                                                placeholder="Confirma tu contraseña"
                                                required
                                                minLength={6}
                                            />
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                id="terms"
                                                name="terms"
                                                type="checkbox"
                                                className="h-4 w-4 text-[#00B0C8] focus:ring-[#00B0C8] border-gray-300 rounded transition-all"
                                                required
                                            />
                                            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                                                Acepto los <a href="#" className="text-[#00B0C8] hover:text-[#00a2b8] transition-colors">Términos y Condiciones</a>
                                            </label>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-[#00B0C8] text-white py-2 px-4 rounded-md hover:bg-[#00a2b8] transition-colors"
                                        >
                                            REGISTRARSE
                                        </button>

                                        <div className="mt-4 text-center">
                                            <p className="text-sm text-gray-600">
                                                ¿Ya tienes cuenta?{' '}
                                                <button
                                                    type="button"
                                                    onClick={toggleView}
                                                    className="text-[#00B0C8] hover:text-[#00a2b8] transition-colors"
                                                >
                                                    Inicia sesión
                                                </button>
                                            </p>
                                        </div>
                                    </form>
                                )}

                                {/* Social Login Section */}
                                <div className="mt-6">
                                    <p className="text-center text-sm font-bold text-gray-500 mb-3">
                                        {activeView === 'login' ? 'CONECTAR CON LAS REDES SOCIALES' : 'REGISTRARSE CON REDES SOCIALES'}
                                    </p>
                                    <div className="flex justify-center space-x-2">
                                        <button
                                            type="button"
                                            className="p-2 rounded-none bg-[#00B0C890] hover:bg-[#00B0C8] transition-colors"
                                        >
                                            <span className="sr-only">Facebook</span>
                                            <svg fill="#ffffff" width="14px" height="14px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M21.95 5.005l-3.306-.004c-3.206 0-5.277 2.124-5.277 5.415v2.495H10.05v4.515h3.317l-.004 9.575h4.641l.004-9.575h3.806l-.003-4.514h-3.803v-2.117c0-1.018.241-1.533 1.566-1.533l2.366-.001.01-4.256z"></path>
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            className="p-2 rounded-none bg-cyan-500 hover:bg-cyan-400 transition-colors"
                                        >
                                            <span className="sr-only">Twitter</span>
                                            <svg fill="#ffffff" width="14px" height="14px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M30.917 6.728c-1.026 0.465-2.217 0.805-3.464 0.961l-0.061 0.006c1.268-0.771 2.222-1.952 2.687-3.354l0.013-0.044c-1.124 0.667-2.431 1.179-3.82 1.464l-0.082 0.014c-1.123-1.199-2.717-1.946-4.485-1.946-3.391 0-6.14 2.749-6.14 6.14 0 0.496 0.059 0.979 0.17 1.441l-0.008-0.042c-5.113-0.254-9.613-2.68-12.629-6.366l-0.025-0.031c-0.522 0.873-0.831 1.926-0.831 3.052 0 0.013 0 0.026 0 0.039v-0.002c0 0.001 0 0.003 0 0.005 0 2.12 1.075 3.989 2.709 5.093l0.022 0.014c-1.026-0.034-1.979-0.315-2.811-0.785l0.031 0.016v0.075c0 0.001 0 0.002 0 0.002 0 2.961 2.095 5.434 4.884 6.014l0.040 0.007c-0.484 0.135-1.040 0.212-1.614 0.212-0.406 0-0.802-0.039-1.186-0.113l0.039 0.006c0.813 2.459 3.068 4.212 5.739 4.264l0.006 0c-2.072 1.638-4.721 2.627-7.602 2.627-0.005 0-0.009 0-0.014 0h0.001c-0.515-0.001-1.022-0.031-1.521-0.089l0.061 0.006c2.663 1.729 5.92 2.757 9.418 2.757 0.005 0 0.009 0 0.014 0h-0.001c0.037 0 0.082 0 0.126 0 9.578 0 17.343-7.765 17.343-17.343 0-0.039-0-0.077-0-0.116l0 0.006c0-0.262 0-0.524-0.019-0.786 1.21-0.878 2.229-1.931 3.042-3.136l0.028-0.044z"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 