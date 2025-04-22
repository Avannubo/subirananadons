"use client"
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { LogOut, UserRound } from 'lucide-react';
export default function AuthModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeView, setActiveView] = useState('login');
    const [message, setMessage] = useState({ text: '', type: '' });
    const modalRef = useRef(null);
    const backdropRef = useRef(null);
    const router = useRouter();
    const { data: session, status } = useSession();
    const openLogin = () => {
        if (session) {
            router.push("/dashboard");
        } else {
            setActiveView('login');
            setIsOpen(true);
            setMessage({ text: '', type: '' });
        }
    };
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
    useEffect(() => {
        console.log('Session Status:', status);
        console.log('Session Data:', session);
    }, [session, status]);
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData(e.currentTarget);
            const email = formData.get('email');
            const password = formData.get('password');

            console.log('Attempting login with email:', email);

            const result = await signIn('credentials', {
                redirect: false,
                email,
                password,
            });

            console.log('Login result:', result);

            if (result?.error) {
                let errorMessage = 'Error al iniciar sesión. ';
                console.error('Login error:', result.error);
                switch (result.error) {
                    case 'No user found with this email':
                        errorMessage += 'El correo electrónico no está registrado.';
                        break;
                    case 'Invalid password':
                        errorMessage += 'La contraseña es incorrecta.';
                        break;
                    default:
                        errorMessage += 'Por favor verifica tus credenciales.';
                }
                setMessage({ text: errorMessage, type: 'error' });
                return;
            }

            setMessage({ text: '¡Inicio de sesión exitoso!', type: 'success' });
            console.log('Login successful, redirecting to dashboard...');

            setTimeout(() => {
                closeModal();
                router.push('/dashboard');
            }, 1000);

        } catch (error) {
            console.error('Login error:', error);
            setMessage({
                text: 'Error al iniciar sesión. Por favor intenta nuevamente.',
                type: 'error'
            });
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

            console.log('Attempting registration with:', { name, email });

            if (password !== confirmPassword) {
                console.log('Password mismatch');
                setMessage({ text: 'Las contraseñas no coinciden', type: 'error' });
                return;
            }

            console.log('Sending registration request...');
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();
            console.log('Registration response:', data);

            if (!response.ok) {
                console.error('Registration failed:', data);
                setMessage({
                    text: data.message || 'Error en el registro. Por favor intenta nuevamente.',
                    type: 'error'
                });
                return;
            }

            setMessage({
                text: '¡Registro exitoso! Iniciando sesión...',
                type: 'success'
            });

            console.log('Registration successful, attempting automatic login...');
            const signInResult = await signIn('credentials', {
                redirect: false,
                email,
                password,
            });

            console.log('Auto-login result:', signInResult);

            if (signInResult?.error) {
                console.error('Auto-login failed:', signInResult.error);
                setMessage({
                    text: 'Registro exitoso pero error al iniciar sesión. Por favor inicia sesión manualmente.',
                    type: 'error'
                });
                return;
            }

            console.log('Auto-login successful, redirecting to dashboard...');
            setTimeout(() => {
                closeModal();
                router.push('/dashboard');
            }, 1000);

        } catch (error) {
            console.error('Registration error:', error);
            setMessage({
                text: 'Error en el registro. Por favor intenta nuevamente.',
                type: 'error'
            });
        }
    };
    // Handle social login (Google, GitHub) with error handling and redirect
  //  const handleSocialLogin = async (provider) => {
   //     try {
   //         await signIn(provider, { callbackUrl: '/dashboard' });
   //     } catch (error) {
   //         setMessage({ text: `Error al iniciar sesión con ${provider}`, type: 'error' });
   //     }
   // };
    return (
        <div className="flex">
            {message.text && (
                <div className={`fixed top-4 right-4 z-[99] flex items-center space-x-2 px-4 py-3 rounded shadow-lg animate-slide-in ${message.type === 'success'
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
                {session ? (
                    <button
                        onClick={() => signOut()}
                        className="flex flex-row items-center space-x-2 py-2 text-sm  text-gray-700 "
                    >
                        <LogOut />
                    </button>
                ) : (
                    <button
                        onClick={openLogin}
                        className="flex flex-row items-center space-x-2  py-2 text-sm text-gray-700 rounded-md transition-colors"
                    >
                        <UserRound />
                    </button>
                )}
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div
                            ref={backdropRef}
                            className="fixed inset-0 bg-[#00000050] bg-opacity-50 transition-opacity duration-800 opacity-0"
                        />
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
                                            <button
                                                type="button"
                                                onClick={() => signIn('email')}
                                                className="text-sm text-[#00B0C8] hover:text-[#00a2b8] transition-colors"
                                            >
                                                Se te olvidó tu contraseña
                                            </button>
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
                                <div className="mt-6">
                                    <p className="text-center text-sm font-bold text-gray-500 mb-3">
                                        {activeView === 'login' ? 'CONECTAR CON LAS REDES SOCIALES' : 'REGISTRARSE CON REDES SOCIALES'}
                                    </p>
                                    <div className="flex justify-center space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => handleSocialLogin('google')}
                                            className="p-2 rounded-none bg-[#00B0C890] hover:bg-[#00B0C8] transition-colors"
                                        >
                                            <span className="sr-only">Google</span>
                                            <svg width="14px" height="14px" viewBox="0 0 24 24" fill="#ffffff">
                                                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleSocialLogin('github')}
                                            className="p-2 rounded-none bg-gray-800 hover:bg-gray-700 transition-colors"
                                        >
                                            <span className="sr-only">GitHub</span>
                                            <svg width="14px" height="14px" viewBox="0 0 24 24" fill="#ffffff">
                                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
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