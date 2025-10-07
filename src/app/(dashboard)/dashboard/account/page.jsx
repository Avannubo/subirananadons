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
        const toastId = toast.loading('Processant la imatge...');
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
                    toast.success('S\'està utilitzant la imatge local', { id: toastId });
                    setIsUpdating(false);
                    return base64Image;
                } else {
                    toast.error('No s\'ha pogut pujar la imatge', { id: toastId });
                    setIsUpdating(false);
                    return null;
                }
            }
            // If the request was successful, parse the response
            const data = await response.json();
            //console.log('Server upload successful, Cloudinary URL:', data.url);
            toast.success('Imatge pujada correctament!', { id: toastId });
            // Set the image preview directly from the Cloudinary URL to update UI immediately
            setImagePreview(data.url);
            // Record the time of the last update
            setLastUpdate(new Date().toISOString());
            // Return the secure URL from Cloudinary
            setIsUpdating(false);
            return data.url;
        } catch (error) {
            console.error('Error in image upload process:', error);
            toast.error('No s\'ha pogut pujar la imatge', { id: toastId });
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
            toast.success('Perfil actualitzat correctament. Se tancarà la sessió.');
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
            toast.error(error.message || 'Error en actualitzar el perfil');
        } finally {
            setLoading(false);
            setIsUpdating(false);
        }
    };
    return (
        <AuthCheck>
            <AdminLayout>
                <div className="md:mx-auto md:p-6 md:min-h-[90vh]">
                    <h1 className="text-2xl font-bold mb-6">El meu compte</h1>
                    <div className="bg-white rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-6 border-b border-gray-300 pb-2">Edita tu Informació</h2>
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {/* Nombre */}
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Nom
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
                                    Només es permeten caràcters alfabètics (lletres) i el punt (.), seguits d'un espai.
                                </p>
                            </div>
                            {/* Apellidos */}
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Cognoms
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
                                    Només es permeten caràcters alfabètics (lletres) i el punt (.), seguits d'un espai.
                                </p>
                            </div>
                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Correu electrònic
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
                                    Contrasenya
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
                                        Canvia
                                    </button>
                                </div>
                            </div>
                            {/* New Password */}
                            {showPasswordChange && (
                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                        Nova contrasenya
                                    </label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Introdueix la teva nova contrasenya"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                                        minLength={6}
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Mínim 6 caràcters
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
                                    {loading ? 'Guardant...' : isUpdating ? 'Actualitzant...' : 'Desa els canvis'}
                                </button>
                            </div>
                        </form>
                        {/* Add last update information if available */}
                        {lastUpdate && (
                            <p className="text-xs text-gray-500 mt-2">
                                Última actualització: {new Date(lastUpdate).toLocaleString()}
                            </p>
                        )}
                    </div>
                </div>
            </AdminLayout>
        </AuthCheck>
    );
}