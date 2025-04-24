'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
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
        const toastId = toast.loading('Processing image...');

        // Set updating state to show loading UI
        setIsUpdating(true);

        try {
            // First, convert the selected image to base64
            const base64Image = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(selectedImage);
            });

            console.log('Image converted to base64, uploading to server...');

            // Upload using our server API endpoint (which handles Cloudinary authentication)
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: base64Image })
            });

            if (!response.ok) {
                // Get the error message
                let errorMessage = 'Failed to upload image';
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
                    console.log('Using base64 image as fallback in development');
                    toast.success('Using local image', { id: toastId });
                    setIsUpdating(false);
                    return base64Image;
                } else {
                    toast.error('Image upload failed', { id: toastId });
                    setIsUpdating(false);
                    return null;
                }
            }

            // If the request was successful, parse the response
            const data = await response.json();
            console.log('Server upload successful, Cloudinary URL:', data.url);
            toast.success('Image uploaded successfully!', { id: toastId });

            // Set the image preview directly from the Cloudinary URL to update UI immediately
            setImagePreview(data.url);

            // Record the time of the last update
            setLastUpdate(new Date().toISOString());

            // Return the secure URL from Cloudinary
            setIsUpdating(false);
            return data.url;
        } catch (error) {
            console.error('Error in image upload process:', error);
            toast.error('Image upload failed', { id: toastId });

            // In development, use the base64 image as fallback
            if (process.env.NODE_ENV === 'development') {
                console.log('Using base64 image as fallback due to error');
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
                    console.log('Using uploaded image URL:', uploadedImageUrl);
                    imageUrl = uploadedImageUrl;

                    // Update image in userData immediately for UI update
                    setUserData(prev => ({
                        ...prev,
                        image: uploadedImageUrl
                    }));
                } else {
                    console.log('Upload failed, keeping existing image:', imageUrl);
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

            console.log('Updating user profile with data:', updatedUserData);

            // Add password if being changed
            if (showPasswordChange && newPassword) {
                updatedUserData.password = newPassword;
            }

            // Update user profile
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedUserData)
            });

            let responseData;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                const text = await response.text();
                console.error('Non-JSON response:', text);
                throw new Error('Server returned non-JSON response');
            }

            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to update profile');
            }

            console.log('Profile update successful:', responseData);

            // Update session to keep that in sync
            await updateSession({
                ...session,
                user: {
                    ...session.user,
                    name: updatedUserData.name,
                    image: imageUrl
                }
            });

            // Update the global user context
            updateUser({
                name: updatedUserData.name,
                image: imageUrl
            });

            // Record time of last update
            setLastUpdate(new Date().toISOString());

            toast.success('Profile updated successfully');

            // Reset state after successful update
            if (showPasswordChange && newPassword) {
                setNewPassword('');
                setShowPasswordChange(false);
            }

            // Clear selected image after successful upload
            setSelectedImage(null);
            // Don't clear the image preview so the user can see their new image

            // Manually trigger a refresh of the user data across the application
            refreshUser();
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.message || 'Error updating profile');
        } finally {
            setLoading(false);
            setIsUpdating(false);
        }
    };

    return (
        <AuthCheck>
            <AdminLayout>
                <div className="mx-auto p-6">
                    <h1 className="text-2xl font-bold mb-6">Mi Cuenta</h1>
                    <div className="bg-white rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-6 border-b pb-2">Tu información personal</h2>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {/* Profile Image */}
                            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4 mb-6">
                                <div className="w-32 h-32 relative rounded-full overflow-hidden border-2 border-gray-200">
                                    {isUpdating && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                                        </div>
                                    )}
                                    <Image
                                        src={imagePreview || userData.image || '/assets/images/joie.png'}
                                        alt="Profile"
                                        width={128}
                                        height={128}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <label
                                        htmlFor="profileImage"
                                        className={`px-4 py-2 text-white rounded-md text-center ${isUpdating
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-[#00B0C8] hover:bg-[#00B0C890] cursor-pointer'
                                            }`}
                                    >
                                        {isUpdating ? 'Uploading...' : 'Change image'}
                                    </label>
                                    <input
                                        type="file"
                                        id="profileImage"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        disabled={isUpdating}
                                        className="hidden"
                                    />
                                    <p className="mt-2 text-xs text-gray-500">
                                        Formatos recomendados: JPG, PNG. Máximo 5MB.
                                    </p>
                                </div>
                            </div>

                            {/* Nombre */}
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre
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
                                    Solo se permiten caracteres alfabéticos (letras) y el punto (.), seguidos de un espacio.
                                </p>
                            </div>

                            {/* Apellidos */}
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Apellidos
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
                                    Solo se permiten caracteres alfabéticos (letras) y el punto (.), seguidos de un espacio.
                                </p>
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Dirección de correo electrónico
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
                                    Contraseña
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
                                        className="absolute right-2 top-2 text-[#00B0C8] text-sm font-medium"
                                    >
                                        Cambiar
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            {showPasswordChange && (
                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                        Nueva contraseña
                                    </label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Ingresa tu nueva contraseña"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                                        minLength={6}
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Mínimo 6 caracteres
                                    </p>
                                </div>
                            )}

                            {/* Birth Date */}
                            <div>
                                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha de nacimiento
                                </label>
                                <input
                                    type="text"
                                    id="birthDate"
                                    name="birthDate"
                                    value={userData.birthDate}
                                    onChange={handleInputChange}
                                    placeholder="Ejemplo: 31/05/1970"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                                />
                                <p className="mt-1 text-xs text-gray-500">Opcional</p>
                            </div>

                            {/* Privacy Section */}
                            <div className="pt-4 border-t border-gray-200">
                                <div className="flex items-start mb-4">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="partnerOffers"
                                            name="partnerOffers"
                                            type="checkbox"
                                            checked={userData.partnerOffers}
                                            onChange={handleInputChange}
                                            className="focus:ring-[#00B0C860] h-4 w-4 text-[#00B0C8] border-gray-300 rounded"
                                        />
                                    </div>
                                    <label htmlFor="partnerOffers" className="ml-2 block text-sm text-gray-700">
                                        Recibir ofertas de nuestros socios
                                    </label>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-md mb-4">
                                    <p className="text-sm text-gray-600">
                                        The personal data you provide is used to answer queries, process orders or allow access to specific information.
                                        You have the right to modify and delete all the personal information found in the "My Account" page.
                                    </p>
                                </div>
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="newsletter"
                                            name="newsletter"
                                            type="checkbox"
                                            checked={userData.newsletter}
                                            onChange={handleInputChange}
                                            className="focus:ring-[rgba(0,177,200,0.66)] h-4 w-4 text-[#00B0C8] border-gray-300 rounded"
                                        />
                                    </div>
                                    <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-700">
                                        Suscribirse a nuestro boletín de noticias
                                        <span className="block text-xs text-gray-500 mt-1">
                                            Puede darse de baja en cualquier momento. Para ello, consulte nuestra información de contacto en el aviso legal.
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading || isUpdating}
                                    className={`px-4 py-2 bg-[#00B0C8] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B0C860] ${(loading || isUpdating) ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#00B0C890]'
                                        }`}
                                >
                                    {loading ? 'Guardando...' : isUpdating ? 'Actualizando...' : 'Guardar cambios'}
                                </button>
                            </div>
                        </form>

                        {/* Add last update information if available */}
                        {lastUpdate && (
                            <p className="text-xs text-gray-500 mt-2">
                                Last updated: {new Date(lastUpdate).toLocaleString()}
                            </p>
                        )}
                    </div>
                </div>
            </AdminLayout>
        </AuthCheck>
    );
}