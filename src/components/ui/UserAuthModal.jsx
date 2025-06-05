"use client"
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { LogOut, UserRound } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'react-hot-toast';
export default function AuthModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeView, setActiveView] = useState('login');
    const modalRef = useRef(null);
    const backdropRef = useRef(null);
    const router = useRouter();
    const { data: session, status } = useSession();
    const { user, loading: userLoading, refreshUser } = useUser();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const [resetEmail, setResetEmail] = useState('');
    const openLogin = () => {
        if (session) {
            router.push("/dashboard/orders");
        } else {
            setActiveView('login');
            setIsOpen(true);
        }
    };
    const closeModal = () => {
        setIsOpen(false);
    }; const toggleView = (view) => {
        if (view) {
            setActiveView(view);
        } else {
            setActiveView(activeView === 'login' ? 'register' : 'login');
        }
        setResetEmail(''); // Clear reset email when switching views
    }; const handleForgotPassword = async (e) => {
        e.preventDefault();

        if (!resetEmail) {
            toast.error('Por favor, introduce tu correo electrónico');
            return;
        }

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: resetEmail }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al enviar el email de recuperación');
            }

            toast.success('Si el correo existe en nuestra base de datos, recibirás un email con instrucciones para restablecer tu contraseña', { duration: 5000 });
            setResetEmail('');
            toggleView('login');
        } catch (error) {
            console.error('Forgot password error:', error);
            toast.error(error.message || 'Error al enviar el email de recuperación');
        }
    };
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
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
    // useEffect(() => {
    //     console.log('Session Status:', status);
    //     console.log('Session Data:', session);
    // }, [session, status]);
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
                console.log('Login error:', result.error);
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
                toast.error(errorMessage);
                return;
            }
            toast.success('¡Inicio de sesión exitoso!');
            console.log('Login successful, redirecting to dashboard...');
            setTimeout(() => {
                closeModal();
                router.push('/dashboard/orders');
            }, 1000);
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Error al iniciar sesión. Por favor intenta nuevamente.');
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
            const terms = formData.get('terms');

            // Input validation
            if (!name || !email || !password || !confirmPassword) {
                toast.error('Por favor, completa todos los campos');
                return;
            }

            if (!terms) {
                toast.error('Debes aceptar los términos y condiciones');
                return;
            }

            if (password !== confirmPassword) {
                toast.error('Las contraseñas no coinciden');
                return;
            }

            if (password.length < 6) {
                toast.error('La contraseña debe tener al menos 6 caracteres');
                return;
            }

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.message.includes('duplicate key error')) {
                    toast.error('Este correo electrónico ya está registrado');
                } else {
                    toast.error(data.message || 'Error en el registro');
                }
                return;
            }

            toast.success('¡Registro exitoso! Iniciando sesión...');

            // Auto login after successful registration
            const signInResult = await signIn('credentials', {
                redirect: false,
                email,
                password,
            });

            if (signInResult?.error) {
                toast.error('Registro exitoso pero error al iniciar sesión. Por favor inicia sesión manualmente.');
                toggleView('login');
            } else {
                setTimeout(() => {
                    closeModal();
                    router.push('/dashboard/account');
                }, 1000);
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast.error('Error en el registro. Por favor intenta nuevamente.');
        }
    };
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    return (
        <div className="flex">
            <div className="flex">
                {session ? (
                    <div className="relative">
                        <button onClick={toggleMenu} className="flex items-center space-x-2">
                            {/* <Image
                                src={getUserImage()}
                                alt="Profile Picture"
                                width={500}
                                height={500}
                                className="rounded-full h-10 w-10 object-cover"
                            /> */}
                            <UserRound className="m-2" />
                        </button>
                        {isMenuOpen && (
                            <div ref={menuRef} className="absolute right-0 mt-2 w-28 bg-white rounded-md shadow-lg overflow-hidden">
                                <button
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => {
                                        router.push('/dashboard/account');
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    Profile
                                </button>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={openLogin}
                        className="flex flex-row items-center space-x-2   text-sm text-gray-700 rounded-md transition-colors" //py-2
                    >
                        <UserRound />
                    </button>
                )}
                {isOpen && (
                    <div className="fixed inset-0  flex items-center justify-center" >
                        <div
                            ref={backdropRef}
                            className="fixed inset-0 bg-[#00000050] bg-opacity-50 transition-opacity duration-800 opacity-0"
                        />
                        <div
                            ref={modalRef}
                            className="relative bg-white rounded-lg w-full max-w-md mx-4 opacity-0 transform translate-y-4 transition-all duration-800"
                        >
                            <div className="p-6">                                <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold">
                                    {activeView === 'login' ? 'Iniciar Sesión' :
                                        activeView === 'register' ? 'Crear Cuenta' :
                                            'Recuperar Contraseña'}
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
                                                onClick={() => toggleView('recover')}
                                                className="text-sm text-[#00B0C8] hover:text-[#00a2b8] transition-colors"
                                            >
                                                ¿Olvidaste tu contraseña?
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
                                                    onClick={() => toggleView('register')}
                                                    className="text-[#00B0C8] hover:text-[#00a2b8] transition-colors"
                                                >
                                                    Cree uno aquí
                                                </button>
                                            </p>
                                        </div>
                                    </form>
                                )}
                                {activeView === 'recover' && (
                                    <form className="space-y-4" onSubmit={handleForgotPassword}>
                                        <div>
                                            <label htmlFor="recovery-email" className="block text-sm font-medium text-gray-700 mb-1">
                                                Dirección de correo electrónico
                                            </label>
                                            <input
                                                type="email"
                                                id="recovery-email"
                                                value={resetEmail}
                                                onChange={(e) => setResetEmail(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B0C8] focus:border-transparent transition-all"
                                                placeholder="Ingresa tu correo electrónico"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full bg-[#00B0C8] text-white py-2 px-4 rounded-md hover:bg-[#00a2b8] transition-colors"
                                        >
                                            ENVIAR EMAIL DE RECUPERACIÓN
                                        </button>
                                        <div className="mt-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => toggleView('login')}
                                                className="text-[#00B0C8] hover:text-[#00a2b8] transition-colors"
                                            >
                                                Volver al inicio de sesión
                                            </button>
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
                                                    onClick={() => toggleView('login')}
                                                    className="text-[#00B0C8] hover:text-[#00a2b8] transition-colors"
                                                >
                                                    Inicia sesión
                                                </button>
                                            </p>
                                        </div>
                                    </form>

                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}