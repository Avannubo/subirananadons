"use client"
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { LogOut, UserRound } from 'lucide-react';
import { toast } from 'react-hot-toast';
export default function AuthModal({ title }) {
    const t = useTranslations('UserAuthModal');
    const [isOpen, setIsOpen] = useState(false);
    const [activeView, setActiveView] = useState('login');
    const modalRef = useRef(null);
    const backdropRef = useRef(null);
    const router = useRouter();
    const { data: session, status } = useSession();
    const menuRef = useRef(null);
    const [resetEmail, setResetEmail] = useState('');
    const openLogin = () => {
        if (session) {
            router.push("/dashboard");
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
    };
    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!resetEmail) {
            toast.error(t('forgotEmailError'));
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
                throw new Error(data.message || t('forgotEmailSendError'));
            }
            toast.success(t('forgotEmailSuccess'), { duration: 5000 });
            setResetEmail('');
            toggleView('login');
        } catch (error) {
            console.error('Forgot password error:', error);
            toast.error(error.message || t('forgotEmailSendError'));
        }
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
            //console.log('Attempting login with email:', email);
            const result = await signIn('credentials', {
                redirect: false,
                email,
                password,
            }); 
            if (result?.error) {
                let errorMessage = t('loginError') + ' '; 
                if (result.error === 'Account not active') {
                    errorMessage = t('loginAccountNotActive') || 'Tu cuenta no está activa. Contacta con el propietario de la tienda.';
                } else {
                    switch (result.error) {
                        case 'No user found with this email':
                            errorMessage += t('loginEmailNotFound');
                            break;
                        case 'Invalid password':
                            errorMessage += t('loginPasswordIncorrect');
                            break;
                        default:
                            errorMessage += t('loginCheckCredentials');
                    }
                }
                toast.error(errorMessage);
                return;
            }
            toast.success(t('loginSuccess')); 
            setTimeout(() => {
                closeModal();
                router.push('/dashboard');
            }, 1000);
        } catch (error) {
            console.error('Login error:', error);
            toast.error(t('loginErrorGeneric'));
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
                toast.error(t('registerFieldsError'));
                return;
            }
            if (!terms) {
                toast.error(t('registerTermsError'));
                return;
            }
            if (password !== confirmPassword) {
                toast.error(t('registerPasswordMismatch'));
                return;
            }
            if (password.length < 6) {
                toast.error(t('registerPasswordLength'));
                return;
            }
            // Set user as active on creation
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password, IsActive: true }),
            });
            const data = await response.json();
            if (!response.ok) {
                if (data.message.includes('duplicate key error')) {
                    toast.error(t('registerEmailDuplicate'));
                } else {
                    toast.error(data.message || t('registerErrorGeneric'));
                }
                return;
            }
            toast.success(t('registerSuccess'));
            // Auto login after successful registration
            const signInResult = await signIn('credentials', {
                redirect: false,
                email,
                password,
            });
            if (signInResult?.error) {
                if (signInResult.error === 'Account not active') {
                    toast.error(t('loginAccountNotActive') || 'Tu cuenta no está activa. Contacta con el propietario de la tienda.');
                } else {
                    toast.error(t('registerLoginError'));
                }
                toggleView('login');
            } else {
                setTimeout(() => {
                    closeModal();
                    router.push('/dashboard/account');
                }, 1000);
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast.error(t('registerErrorGeneric'));
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
        <div className="">
            {title ? (
                <button
                    onClick={openLogin}
                    className="py-2.5 w-full cursor-pointer font-medium text-[#353535] hover:text-[#3f93ba] hover:bg-gray-50 px-4 rounded transition-colors uppercase flex items-center"
                >
                    <UserRound className="mr-3" size={20} />
                    {title.toUpperCase()}
                </button>
            ) : (
                <button
                    onClick={openLogin}
                    id='login-button'
                    className="p-2  transition-colors flex items-center justify-center cursor-pointer text-gray-700 hover:text-[#3f93ba]"
                    aria-label="Abrir modal de autenticación"
                >
                    <UserRound size={24} />
                </button>
            )}
            {isOpen && (
                <div className="fixed w-screen h-screen inset-0 flex items-center justify-center z-[9999] pointer-events-none">
                    {/* Backdrop - covers entire screen */}
                    <div
                        ref={backdropRef}
                        className="fixed inset-0 bg-[#00000050] bg-opacity-50 transition-opacity duration-800 opacity-0 pointer-events-auto"
                    />
                    {/* Modal container - centered */}
                    <div
                        ref={modalRef}
                        className="relative bg-white rounded-lg w-full max-w-md mx-4 opacity-0 transform translate-y-4 transition-all duration-800 pointer-events-auto"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold">
                                    {activeView === 'login' ? t('loginTitle') :
                                        activeView === 'register' ? t('registerTitle') :
                                            t('recoverTitle')}
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
                                            {t('emailLabel')}
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#36A9E1] focus:border-transparent transition-all"
                                            placeholder={t('emailPlaceholder')}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('passwordLabel')}
                                        </label>
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#36A9E1] focus:border-transparent transition-all"
                                            placeholder={t('passwordPlaceholder')}
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={() => toggleView('recover')}
                                            className="text-sm text-[#36A9E1] hover:text-[#00a2b8] transition-colors"
                                        >
                                            {t('forgotPasswordBtn')}
                                        </button>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-[#36A9E1] text-white py-2 px-4 rounded-md hover:bg-[#00a2b8] transition-colors"
                                    >
                                        {t('loginBtn')}
                                    </button>
                                    <div className="mt-4 text-center">
                                        <p className="text-sm text-gray-600">
                                            {t('noAccount')}{' '}
                                            <button
                                                type="button"
                                                onClick={() => toggleView('register')}
                                                className="text-[#36A9E1] hover:text-[#00a2b8] transition-colors"
                                            >
                                                {t('createAccountBtn')}
                                            </button>
                                        </p>
                                    </div>
                                </form>
                            )}
                            {activeView === 'recover' && (
                                <form className="space-y-4" onSubmit={handleForgotPassword}>
                                    <div>
                                        <label htmlFor="recovery-email" className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('emailLabel')}
                                        </label>
                                        <input
                                            type="email"
                                            id="recovery-email"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#36A9E1] focus:border-transparent transition-all"
                                            placeholder={t('emailPlaceholder')}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-[#36A9E1] text-white py-2 px-4 rounded-md hover:bg-[#00a2b8] transition-colors"
                                    >
                                        {t('sendRecoveryEmailBtn')}
                                    </button>
                                    <div className="mt-4 text-center">
                                        <button
                                            type="button"
                                            onClick={() => toggleView('login')}
                                            className="text-[#36A9E1] hover:text-[#00a2b8] transition-colors"
                                        >
                                            {t('backToLoginBtn')}
                                        </button>
                                    </div>
                                </form>
                            )}
                            {activeView === 'register' && (
                                <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('nameLabel')}
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#36A9E1] focus:border-transparent transition-all"
                                            placeholder={t('namePlaceholder')}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('emailLabel')}
                                        </label>
                                        <input
                                            type="email"
                                            id="register-email"
                                            name="email"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#36A9E1] focus:border-transparent transition-all"
                                            placeholder={t('emailPlaceholder')}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('passwordLabel')}
                                        </label>
                                        <input
                                            type="password"
                                            id="register-password"
                                            name="password"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#36A9E1] focus:border-transparent transition-all"
                                            placeholder={t('passwordPlaceholder')}
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('confirmPasswordLabel')}
                                        </label>
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#36A9E1] focus:border-transparent transition-all"
                                            placeholder={t('confirmPasswordPlaceholder')}
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            id="terms"
                                            name="terms"
                                            type="checkbox"
                                            className="h-4 w-4 text-[#36A9E1] focus:ring-[#36A9E1] border-gray-300 rounded transition-all"
                                            required
                                        />
                                        <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                                            {t('acceptTerms')} <a href="/terms" className="text-[#36A9E1] hover:text-[#00a2b8] transition-colors">{t('termsLink')}</a>
                                        </label>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-[#36A9E1] text-white py-2 px-4 rounded-md hover:bg-[#00a2b8] transition-colors"
                                    >
                                        {t('registerBtn')}
                                    </button>
                                    <div className="mt-4 text-center">
                                        <p className="text-sm text-gray-600">
                                            {t('alreadyHaveAccount')}{' '}
                                            <button
                                                type="button"
                                                onClick={() => toggleView('login')}
                                                className="text-[#36A9E1] hover:text-[#00a2b8] transition-colors"
                                            >
                                                {t('loginBtnShort')}
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
    );
}