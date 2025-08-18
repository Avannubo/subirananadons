import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import ImageSelector from '@/components/admin/shared/ImageSelector';
import { useTranslations } from 'next-intl';
export default function BannerTab() {
    const t = useTranslations('BannerTab');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState('');
    const [showImageSelector, setShowImageSelector] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState('');
    const [uploadedImages, setUploadedImages] = useState([]);
    useEffect(() => {
        fetch('/api/portimg')
            .then(res => res.json())
            .then(data => setUploadedImages(Array.isArray(data) ? data : []));
    }, [uploadedUrl]);
    // Handle when an image is selected from the ImageSelector
    useEffect(() => {
        if (selectedImageUrl) {
            setPreview(selectedImageUrl); // Show the selected image in the preview box
        }
    }, [selectedImageUrl]);
    const handleImageChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onload = () => setPreview(reader.result);
            reader.readAsDataURL(file);
            setSelectedImageUrl(''); // Clear any selected image URL when a new file is chosen
        }
    };
    const uploadImage = async () => {
        if (!image) return null; // <-- use 'image', not 'selectedImage'
        setIsUploading(true);
        try {
            const base64Image = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(image); // <-- use 'image'
            });
            const response = await fetch('/api/cloudinary/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64Image })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error uploading image');
            }
            const data = await response.json();
            return data.url;
        } catch (error) {
            toast.error(t('uploadError'));
            return null;
        } finally {
            setIsUploading(false);
        }
    };
    const handleUpload = async () => {
        setIsUploading(true);
        try {
            let imageUrl = selectedImageUrl;
            // Only upload if a new file was selected (not using ImageSelector)
            if (image && !selectedImageUrl) {
                const uploadedUrl = await uploadImage();
                if (!uploadedUrl) {
                    throw new Error(t('uploadError'));
                }
                imageUrl = uploadedUrl;
            }
            if (!imageUrl) {
                throw new Error(t('noImageSelected'));
            }
            // Save URL to DB
            const saveRes = await fetch('/api/portimg', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl })
            });
            if (!saveRes.ok) {
                throw new Error(t('saveError'));
            }
            setUploadedUrl(imageUrl);
            setSelectedImageUrl(''); // Reset after saving
            setPreview(''); // Clear preview
            setImage(null); // Clear file input
            toast.success(t('saveSuccess'));
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsUploading(false);
        }
    };
    const setActivePortada = async (imgId) => {
        try {
            // Set all images to active: false, then set selected to true
            const res = await fetch('/api/portimg', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _id: imgId, active: true })
            });
            // if (!res.ok) throw new Error(t('updateBannerError'));
            setUploadedImages(images => images.map(img => ({ ...img, active: img._id === imgId })));
            // alert('Portada actualizada');
            toast.success(t('bannerUpdated'));
        } catch (err) {
            alert(err.message);
        }
    };
    // Delete image
    const deleteImage = async (imgId) => {
        if (!window.confirm(t('confirmDelete'))) return;
        try {
            const res = await fetch('/api/portimg', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _id: imgId })
            });
            if (!res.ok) throw new Error(t('deleteError'));
            setUploadedImages(images => images.filter(img => img._id !== imgId));
            toast.success(t('deleteSuccess'));
        } catch (err) {
            alert(err.message);
        }
    };
    return (
        <div className="p-4  rounded-lg">
            <h2 className="font-bold mb-4 text-lg text-gray-800">{t('uploadTitle')}</h2>
            <div className="flex flex-col items-center space-y-4">
                {/* Skeleton loader for uploading state */}
                {isUploading ? (
                    <div className="w-full animate-pulse">
                        <div className="w-full p-2 h-44 rounded-lg border border-dashed border-gray-300 overflow-hidden bg-white flex items-center justify-center">
                            <div className="h-24 w-40 bg-gray-200 rounded-lg" />
                        </div>
                        <div className="flex flex-row items-center space-x-2 w-full max-w-md mt-4">
                            <div className="h-10 w-1/2 bg-gray-200 rounded-md" />
                            <div className="h-10 w-1/2 bg-gray-200 rounded-md" />
                        </div>
                        <div className="h-10 w-full max-w-md bg-gray-200 rounded-md mt-4" />
                    </div>
                ) : (
                    <>
                        <div className="w-full p-2 h-44 relative rounded-lg border border-dashed border-gray-300 overflow-hidden bg-white">
                            {preview ? (
                                <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
                                    </svg>
                                    <span>{t('noImageSelected')}</span>
                                </div>
                            )}
                            {isUploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 z-10">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col w-full gap-2">
                            <div className="flex flex-row gap-2 w-full">
                                <label htmlFor="portimg-upload" className={`w-full px-4 py-2 text-center text-white rounded-md cursor-pointer ${isUploading ? 'bg-gray-400' : 'bg-[#00B0C8] hover:bg-[#008A9B]'}`}>
                                    {isUploading ? t('uploading') : t('selectImage')}
                                </label>
                                <input id="portimg-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={isUploading} />
                                <button
                                    onClick={() => setShowImageSelector(true)}
                                    disabled={isUploading}
                                    className={`w-full px-4 py-2 whitespace-nowrap rounded-md text-white ${isUploading ? 'bg-gray-400' : 'bg-[#00B0C8] hover:bg-[#008A9B]'}`}
                                >
                                    {t('selectExisting')}
                                </button>
                            </div>
                            <button
                                onClick={handleUpload}
                                disabled={(!image && !selectedImageUrl) || isUploading}
                                className={`w-full px-4 py-2 rounded-md text-white ${(!image && !selectedImageUrl) || isUploading ? 'bg-gray-400' : 'bg-[#00B0C8] hover:bg-[#008A9B]'}`}
                            >
                                {isUploading ? t('saving') : t('saveImage')}
                            </button>
                        </div>
                        {showImageSelector && (
                            <ImageSelector
                                onSelect={(url) => {
                                    setSelectedImageUrl(url);
                                    setShowImageSelector(false);
                                }}
                                onClose={() => setShowImageSelector(false)}
                            />
                        )}
                        {/* Rest of your component remains the same */}
                        {/* Skeleton banners if no images uploaded */}
                        {uploadedImages.length === 0 && !isUploading && (
                            <div className="w-full mt-6">
                                <h3 className="font-semibold mb-2 text-gray-700">{t('uploadedImages')}</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow flex flex-col items-center animate-pulse">
                                            <div className="object-cover w-full h-32 mb-2 bg-gray-200" />
                                            <div className='flex flex-col gap-2 w-full px-2'>
                                                <div className="w-full py-2 rounded text-xs bg-gray-200 text-gray-400 h-6" />
                                                <div className="w-full py-2 rounded text-xs bg-gray-200 text-gray-400 h-6" />
                                            </div>
                                            <div className='flex flex-col gap-2 w-full px-2 mt-2'>
                                                <div className="w-full py-2 rounded text-xs bg-gray-200 text-gray-400 h-6" />
                                                <div className="w-full py-2 rounded text-xs bg-gray-200 text-gray-400 h-6" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {uploadedImages.length > 0 && (
                            <div className="w-full mt-6">
                                <h3 className="font-semibold mb-2 text-gray-700">{t('uploadedImages')}</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {uploadedImages.map(img => (
                                        <div key={img._id} className={`border border-gray-200 rounded-lg overflow-hidden bg-white shadow flex flex-col items-center ${img.active ? 'ring-2 ring-[#00B0C8]' : ''}`}>
                                            <img src={img.imageUrl} alt="uploaded" className="object-cover w-full h-32 mb-2" />
                                            <div className='flex flex-row items-center '>
                                                <button
                                                    onClick={() => setActivePortada(img._id)}
                                                    className={`px-3 m-2 py-1 rounded text-xs ${img.active ? 'bg-[#00B0C8] text-white' : 'bg-gray-200 text-gray-700 hover:bg-[#00B0C8] hover:text-white'}`}
                                                    disabled={img.active}
                                                >
                                                    {img.active ? t('bannerActive') : t('setAsBanner')}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setActivePortada(null);
                                                        // Remove active status from this image in DB
                                                        fetch('/api/portimg', {
                                                            method: 'PUT',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ _id: img._id, active: false })
                                                        })
                                                            .then(res => {
                                                                // if (!res.ok) throw new Error('No se pudo quitar el banner');
                                                                setUploadedImages(images => images.map(im => im._id === img._id ? { ...im, active: false } : im));
                                                                toast.success('Banner quitado');
                                                            })
                                                            .catch(err => toast.error(err.message));
                                                    }
                                                    }
                                                    className="px-3 py-1 rounded text-xs bg-gray-200 text-gray-700 hover:bg-red-200"
                                                    disabled={!img.active}
                                                >
                                                    {t('removeBanner')}
                                                </button>
                                            </div>

                                            <div className='space-x-2'>
                                                <a href={img.imageUrl} target="_blank" rel="noopener noreferrer" className="text-[#007d8d] break-all px-3 py-1 rounded text-xs bg-[#007d8d30] hover:bg-[#007d8d40] ">{t('view')}</a>
                                                <button
                                                    onClick={() => deleteImage(img._id)}
                                                    className="px-3 py-1 mb-2 rounded text-xs bg-red-100 text-red-700 hover:bg-red-200"
                                                >
                                                    {t('delete')}
                                                </button>

                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}