'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import AuthCheck from '@/components/auth/AuthCheck';
import AdminLayout from '@/components/Layouts/admin-layout';
import { useUser } from '@/contexts/UserContext';
export default function Page() {
    const { data: session, update: updateSession } = useSession();
    const { user: globalUser, updateUser, refreshUser } = useUser();
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        birthDate: '',
        image: '',
        newsletter: false,
        partnerOffers: false
    });
    const [newPassword, setNewPassword] = useState('');
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);

    // Localization: prefer browser locale when in dashboard (client-side)
    const getBrowserLang = () => {
        if (typeof window === 'undefined') return 'es';
        const nav = window.navigator.language || window.navigator.userLanguage || 'es';
        return nav.split('-')[0];
    };
    const lang = getBrowserLang() === 'ca' ? 'ca' : 'es';
    const L = {
        ca: {
            title: 'El meu compte',
            subtitle: 'Edita la teva Informació',
            firstName: 'Nom',
            lastName: 'Cognoms',
            nameHelp: "Només es permeten caràcters alfabètics (lletres) i el punt (.), seguits d'un espai.",
            email: 'Correu electrònic',
            password: 'Contrasenya',
            change: 'Canvia',
            newPassword: 'Nova contrasenya',
            newPasswordPlaceholder: 'Introdueix la teva nova contrasenya',
            min6: 'Mínim 6 caràcters',
            saving: 'Guardant...',
            updating: 'Actualitzant...',
            saveChanges: 'Desa els canvis',
            lastUpdateText: 'Última actualització:',
            imgProcessing: "Processant la imatge...",
            usingLocalImage: "S'està utilitzant la imatge local",
            uploadFailed: "No s'ha pogut pujar la imatge",
            uploadSuccess: 'Imatge pujada correctament!',
            profileUpdated: 'Perfil actualitzat correctament. Se tancarà la sessió.',
            updateError: 'Error en actualitzar el perfil'
        },
        es: {
            title: 'Mi cuenta',
            subtitle: 'Edita tu Información',
            firstName: 'Nombre',
            lastName: 'Apellidos',
            nameHelp: 'Sólo se permiten caracteres alfabéticos (letras) y el punto (.), seguidos de un espacio.',
            email: 'Correo electrónico',
            password: 'Contraseña',
            change: 'Cambiar',
            newPassword: 'Nueva contraseña',
            newPasswordPlaceholder: 'Introduce tu nueva contraseña',
            min6: 'Mínimo 6 caracteres',
            saving: 'Guardando...',
            updating: 'Actualizando...',
            saveChanges: 'Guardar cambios',
            lastUpdateText: 'Última actualización:',
            imgProcessing: 'Procesando la imagen...',
            usingLocalImage: 'Se está utilizando la imagen local',
            uploadFailed: 'No se pudo subir la imagen',
            uploadSuccess: 'Imagen subida correctamente!',
            profileUpdated: 'Perfil actualizado correctamente. Se cerrará la sesión.',
            updateError: 'Error al actualizar el perfil'
        }
    };
    const t = (key) => (L[lang] && L[lang][key]) || L['es'][key] || key;
    useEffect(() => {
        if (session?.user) {
            const nameParts = session.user.name?.split(' ') || ['', ''];
            setUserData({
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
                email: session.user.email || '',
                birthDate: session.user.birthDate || '',
                image: session.user.image || '',
                newsletter: session.user.newsletter || false,
                partnerOffers: session.user.partnerOffers || false
            });
        }
    }, [session]);
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            const fileReader = new FileReader();
            fileReader.onload = () => {
                setImagePreview(fileReader.result);
            };
            fileReader.readAsDataURL(file);
        }
    };
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setUserData({
            ...userData,
            [name]: type === 'checkbox' ? checked : value
        });
    };
    const uploadImage = async () => {
        if (!selectedImage) return null;
        // Create a loading toast that can be updated
        const toastId = toast.loading(t('imgProcessing'));
        // Set updating state to show loading UI
        setIsUpdating(true);
        try {
            // First, convert the selected image to base64
            const base64Image = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(selectedImage);
            });
            // Upload using our server API endpoint (which handles Cloudinary authentication)
            const response = await fetch('/api/cloudinary/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: base64Image })
            });
            if (!response.ok) {
                // Get the error message
                let errorMessage = 'No s\'ha pogut pujar la imatge';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    const errorText = await response.text();
                    console.error('Server error response (non-JSON):', errorText);
                }
                console.error('Server upload failed:', errorMessage);
                // When server-side upload fails, fall back to using the base64 image directly
                // but only in development to avoid database bloat in production
                if (process.env.NODE_ENV === 'development') {
                    //console.log('Using base64 image as fallback in development');
                    toast.success(t('usingLocalImage'), { id: toastId });
                    setIsUpdating(false);
                    return base64Image;
                } else {
                    toast.error(t('uploadFailed'), { id: toastId });
                    setIsUpdating(false);
                    return null;
                }
            }
            // If the request was successful, parse the response
            const data = await response.json();
            //console.log('Server upload successful, Cloudinary URL:', data.url);
            toast.success(t('uploadSuccess'), { id: toastId });
            // Set the image preview directly from the Cloudinary URL to update UI immediately
            setImagePreview(data.url);
            // Record the time of the last update
            setLastUpdate(new Date().toISOString());
            // Return the secure URL from Cloudinary
            setIsUpdating(false);
            return data.url;
        } catch (error) {
            console.error('Error in image upload process:', error);
            toast.error(t('uploadFailed'), { id: toastId });
            // In development, use the base64 image as fallback
            if (process.env.NODE_ENV === 'development') {
                //console.log('Using base64 image as fallback due to error');
                setIsUpdating(false);
                return imagePreview;
            }
            setIsUpdating(false);
            return null;
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setIsUpdating(true);
        try {
            let imageUrl = userData.image;
            // Only attempt to upload if a new image is selected
            if (selectedImage) {
                const uploadedImageUrl = await uploadImage();
                // Only update the image URL if upload was successful
                if (uploadedImageUrl) {
                    imageUrl = uploadedImageUrl;
                    setUserData(prev => ({ ...prev, image: uploadedImageUrl }));
                }
            }
            // Prepare user data
            const updatedUserData = {
                name: `${userData.firstName} ${userData.lastName}`.trim(),
                email: userData.email,
                birthDate: userData.birthDate,
                image: imageUrl,
                newsletter: userData.newsletter,
                partnerOffers: userData.partnerOffers
            };
            if (showPasswordChange && newPassword) {
                updatedUserData.password = newPassword;
            }
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedUserData)
            });
            let responseData;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                const text = await response.text();
                throw new Error('Server returned non-JSON response');
            }
            if (!response.ok) {
                throw new Error(responseData.message || 'Error en actualitzar el perfil');
            }
            setLastUpdate(new Date().toISOString());
            toast.success(t('profileUpdated'));
            // Reset state after successful update
            if (showPasswordChange && newPassword) {
                setNewPassword('');
                setShowPasswordChange(false);
            }
            setSelectedImage(null);
            // Log out the user to force re-login with new session
            if (typeof window !== 'undefined') {
                // Use next-auth signOut
                const { signOut } = await import('next-auth/react');
                signOut({ callbackUrl: '/' });
            }
        } catch (error) {
            toast.error(error.message || t('updateError'));
        } finally {
            setLoading(false);
            setIsUpdating(false);
        }
    };
    return (
        <AuthCheck>
            <AdminLayout>
                <div className="md:mx-auto md:p-6 md:min-h-[90vh]">
                    <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
                    <div className="bg-white rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-6 border-b border-gray-300 pb-2">{t('subtitle')}</h2>
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {/* Nombre */}
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('firstName')}
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={userData.firstName}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    {t('nameHelp')}
                                </p>
                            </div>
                            {/* Apellidos */}
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('lastName')}
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={userData.lastName}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    {t('nameHelp')}
                                </p>
                            </div>
                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('email')}
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={userData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                                />
                            </div>
                            {/* Current Password */}
                            <div>
                                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('password')}
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
                                        onClick={() => setShowPasswordChange(!showPasswordChange)}
                                        className="absolute right-2 top-2 text-[#36A9E1] text-sm font-medium"
                                    >
                                        {t('change')}
                                    </button>
                                </div>
                            </div>
                            {/* New Password */}
                            {showPasswordChange && (
                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('newPassword')}
                                    </label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder={t('newPasswordPlaceholder')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                                        minLength={6}
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        {t('min6')}
                                    </p>
                                </div>
                            )}
                            {/* Submit Button */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading || isUpdating}
                                    className={`px-4 py-2 bg-[#36A9E1] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B0C860] ${(loading || isUpdating) ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#00B0C890]'
                                        }`}
                                >
                                    {loading ? t('saving') : isUpdating ? t('updating') : t('saveChanges')}
                                </button>
                            </div>
                        </form>
                        {/* Add last update information if available */}
                        {lastUpdate && (
                            <p className="text-xs text-gray-500 mt-2">
                                {t('lastUpdateText')} {new Date(lastUpdate).toLocaleString()}
                            </p>
                        )}
                    </div>
                </div>
            </AdminLayout>
        </AuthCheck>
    );
}