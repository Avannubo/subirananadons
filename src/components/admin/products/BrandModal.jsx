'use client';

import { useState, useEffect, useRef } from 'react';
import { FiX, FiUpload, FiImage } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import ImageSelector from '@/components/admin/shared/ImageSelector';

export default function BrandModal({ isOpen, onClose, brand, isEditing, onSave }) {
    const [formData, setFormData] = useState({
        name: '',
        logo: '',
        enabled: true,
        // description: '',
        website: '',
    });
    const [slug, setSlug] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showImageSelector, setShowImageSelector] = useState(false);
    const fileInputRef = useRef(null);

    // Initialize form with brand data when editing
    useEffect(() => {
        if (isEditing && brand) {
            setFormData({
                name: brand.name || '',
                logo: brand.logo || '',
                enabled: brand.enabled !== undefined ? brand.enabled : true,
                // description: brand.description || '',
                website: brand.website || '',
            });
            setSlug(brand.slug || '');
            setImagePreview(brand.logo || null);
        } else {
            // Reset form when adding new
            setFormData({
                name: '',
                logo: '',
                enabled: true,
                // description: '',
                website: '',
            });
            setSlug('');
            setImagePreview(null);
        }
    }, [isEditing, brand]);

    // Handle form field changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    // Generate slug from name
    const generateSlug = () => {
        if (formData.name) {
            const newSlug = formData.name
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
            setSlug(newSlug);
        }
    };

    // Handle image upload
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        handleFile(file);
    };

    // Handle drag events
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    // Process the selected file
    const handleFile = (file) => {
        if (file) {
            // Check file type and size
            if (!file.type.match('image.*')) {
                toast.error('Si us plau, selecciona una imatge vàlida');
                return;
            }

            // Check file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('La imatge és massa gran. La mida màxima és 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target.result;
                setImagePreview(imageUrl);
                setFormData(prev => ({ ...prev, logo: imageUrl }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Trigger file input click
    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    // Remove image
    const handleRemoveImage = (e) => {
        e.stopPropagation();
        setImagePreview(null);
        setFormData(prev => ({ ...prev, logo: '' }));
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('El nom de la marca és obligatori');
            return;
        }

        // Generate slug if empty
        let brandData = { ...formData };
        if (!slug) {
            const generatedSlug = formData.name
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
            brandData.slug = generatedSlug;
        } else {
            brandData.slug = slug;
        }

        // Call the onSave function with the complete data
        onSave(brandData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-start pt-10 p-4 overflow-y-auto">
            <div className="bg-white rounded-md shadow w-full max-w-lg">
                <div className="flex justify-between items-center p-4 border-b border-gray-300">
                    <h2 className="text-xl font-medium">
                        {isEditing ? 'Editar marca' : 'Afegir nova marca'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Nom <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border border-gray-300 rounded focus:ring-[#00B0C8] focus:border-[#00B0C8]"
                            />
                        </div>

                        <div>
                            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                                Slug
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    id="slug"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-[#00B0C8] focus:border-[#00B0C8]"
                                />
                                <button
                                    type="button"
                                    onClick={generateSlug}
                                    className="px-3 py-2 bg-gray-100 border border-gray-300 rounded text-sm"
                                >
                                    Genera
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">S'utilitza a les URLs. Es generarà automàticament si es deixa en blanc.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Logotip
                            </label>
                            <div className="flex flex-col items-center gap-2">
                                <div
                                    className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer h-40 flex flex-col items-center justify-center ${isDragging
                                        ? 'border-[#00B0C8] bg-blue-50'
                                        : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    onClick={handleImageClick}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />

                                    {imagePreview ? (
                                        <div className="relative h-full w-full flex items-center justify-center">
                                            <img
                                                src={imagePreview}
                                                alt="Previsualització del logotip"
                                                className="max-h-full max-w-full object-contain"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
                                                <FiX size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <FiImage className="w-10 h-10 text-gray-400 mb-2" />
                                            <span className="text-sm text-gray-500">
                                                Arrossega i deixa anar una imatge o fes clic per seleccionar
                                            </span>
                                            <span className="text-xs text-gray-400 mt-1">
                                                PNG, JPG, GIF fins a 5MB
                                            </span>
                                        </>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowImageSelector(true)}
                                    className="w-full px-4 py-2 text-white text-sm rounded-md bg-[#00B0C8] hover:bg-[#008A9B]"
                                >
                                    Selecciona existent
                                </button>
                            </div>
                            {showImageSelector && (
                                <ImageSelector
                                    onSelect={(url) => {
                                        setFormData(prev => ({ ...prev, logo: url }));
                                        setImagePreview(url);
                                        setShowImageSelector(false);
                                    }}
                                    onClose={() => setShowImageSelector(false)}
                                />
                            )}
                        </div>

                        {/*
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Descripció
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows="3"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-[#00B0C8] focus:border-[#00B0C8]"
                            ></textarea>
                        </div>
                        */}

                        <div>
                            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                                Lloc web
                            </label>
                            <input
                                type="url"
                                id="website"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-[#00B0C8] focus:border-[#00B0C8]"
                            />
                        </div>


                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="enabled"
                                name="enabled"
                                checked={formData.enabled}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-gray-300 text-[#00B0C8] focus:ring-[#00B0C8]"
                            />
                            <label htmlFor="enabled" className="ml-2 block text-sm font-medium text-gray-700">
                                Marca activa
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-300">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Cancel·la
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 border border-transparent rounded text-sm font-medium text-white bg-[#00B0C8] hover:bg-[#008A9B]"
                        >
                            {isEditing ? 'Actualitza' : 'Crea'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}