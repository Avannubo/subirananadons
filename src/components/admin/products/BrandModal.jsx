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
        website: '',
        discount: {
            active: false,
            type: 'percentage',
            value: 0,
            startDate: '',
            endDate: '',
            minPurchaseAmount: '',
            minQuantity: ''
        }
    });
    const [slug, setSlug] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showImageSelector, setShowImageSelector] = useState(false);
    const fileInputRef = useRef(null);
    // Initialize form with brand data when editing
    useEffect(() => {
        if (isEditing && brand) {
            const discountData = brand.discount ? {
                active: brand.discount.active,  // Ensure boolean
                type: brand.discount.type || 'percentage',
                value: Number(brand.discount.value) || 0,  // Ensure number
                startDate: brand.discount.startDate ? new Date(brand.discount.startDate).toISOString().slice(0, 16) : '',
                endDate: brand.discount.endDate ? new Date(brand.discount.endDate).toISOString().slice(0, 16) : '',
                minPurchaseAmount: brand.discount.minPurchaseAmount || '',
                minQuantity: brand.discount.minQuantity || ''
            } : {
                active: false,
                type: 'percentage',
                value: 0,
                startDate: '',
                endDate: '',
                minPurchaseAmount: '',
                minQuantity: ''
            };
            setFormData({
                name: brand.name || '',
                logo: brand.logo || '',
                enabled: brand.enabled !== undefined ? brand.enabled : true,
                website: brand.website || '',
                discount: discountData
            });
            setSlug(brand.slug || '');
            setImagePreview(brand.logo || null);
        } else {
            // Reset form when adding new
            setFormData({
                name: '',
                logo: '',
                enabled: true,
                website: '',
                discount: {
                    active: false,
                    type: 'percentage',
                    value: 0,
                    startDate: '',
                    endDate: '',
                    minPurchaseAmount: '',
                    minQuantity: ''
                }
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
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error('El nom de la marca és obligatori');
            return;
        }
        // Validate discount data if active
        if (formData.discount.active) {
            if (!formData.discount.value || formData.discount.value <= 0) {
                toast.error('El valor del descompte ha de ser superior a 0');
                return;
            }
            if (formData.discount.type === 'percentage' && formData.discount.value > 100) {
                toast.error('El percentatge de descompte no pot ser superior a 100%');
                return;
            }
            const startDate = new Date(formData.discount.startDate);
            const endDate = new Date(formData.discount.endDate);
            if (startDate >= endDate) {
                toast.error('La data de fi ha de ser posterior a la data d\'inici');
                return;
            }
            if (formData.discount.minPurchaseAmount && formData.discount.minPurchaseAmount < 0) {
                toast.error('L\'import mínim de compra no pot ser negatiu');
                return;
            }
            if (formData.discount.minQuantity && formData.discount.minQuantity < 0) {
                toast.error('La quantitat mínima no pot ser negativa');
                return;
            }
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
        try {
            // Step 1: Save the brand data first
            await onSave(brandData);
            // If editing and brand exists
            if (isEditing && brand && brand._id) {
                // Get all active products for this brand using the method from fetchBrandsWithProducts
                const productCountResponse = await fetch(`/api/products?brand=${brand._id}&status=active&limit=9999`);
                if (!productCountResponse.ok) {
                    throw new Error('Error en obtenir els productes de la marca');
                }
                const productData = await productCountResponse.json();
                const products = productData.products;
                if (products && products.length > 0) {
                    toast.loading(`Actualitzant ${products.length} productes...`, { id: 'updating-products' });
                    // Update all active products with the new brand discount info
                    const updatePromises = products.map(product =>
                        fetch(`/api/products/${product._id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                discount: {
                                    active: brandData.discount.active,
                                    type: brandData.discount.type,
                                    value: brandData.discount.value,
                                    startDate: brandData.discount.startDate,
                                    endDate: brandData.discount.endDate,
                                    minPurchaseAmount: brandData.discount.minPurchaseAmount,
                                    minQuantity: brandData.discount.minQuantity
                                }
                            })
                        })
                    );
                    // Wait for all product updates to complete
                    await Promise.all(updatePromises);
                    toast.success(`Descompte actualitzat per a ${products.length} productes actius`, { id: 'updating-products' });
                }
            }
            // Step 4: Close the modal
            onClose();
        } catch (error) {
            console.error('Error saving brand with discount:', error);
            toast.error(error.message || 'Error en actualitzar la marca i els seus descomptes');
        }
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
                                className="w-full p-2 border border-gray-300 rounded focus:ring-[#36A9E1] focus:border-[#36A9E1]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Logotip
                            </label>
                            <div className="flex flex-col items-center gap-2">
                                <div
                                    className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer h-40 flex flex-col items-center justify-center ${isDragging
                                        ? 'border-[#36A9E1] bg-blue-50'
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
                                    className="w-full px-4 py-2 text-white text-sm rounded-md bg-[#36A9E1] hover:bg-[#008A9B]"
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
                                className="w-full p-2 border border-gray-300 rounded focus:ring-[#36A9E1] focus:border-[#36A9E1]"
                            />
                        </div>
                        {/* Discount Section */}
                        <div className="border-t border-gray-200 pt-4 mt-4">
                            <h3 className="text-lg font-medium mb-4">Descompte de Marca</h3>
                            <div className="space-y-4">
                                <div className="flex items-center mb-4">
                                    <input
                                        type="checkbox"
                                        id="discount-active"
                                        checked={formData.discount.active}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            discount: { ...prev.discount, active: e.target.checked }
                                        }))}
                                        className="h-4 w-4 rounded border-gray-300 text-[#36A9E1] focus:ring-[#36A9E1]"
                                    />
                                    <label htmlFor="discount-active" className="ml-2 block text-sm font-medium text-gray-700">
                                        Activar descompte
                                    </label>
                                </div>
                                {formData.discount?.active && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Tipus de descompte
                                            </label>
                                            <select
                                                value={formData.discount.type}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    discount: { ...prev.discount, type: e.target.value }
                                                }))}
                                                className="w-full p-2 border border-gray-300 rounded focus:ring-[#36A9E1] focus:border-[#36A9E1]"
                                            >
                                                <option value="percentage">Percentatge (%)</option>
                                                <option value="fixed">Import fix (€)</option>
                                            </select>
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {formData.discount.type === 'percentage' ? 'Percentatge' : 'Import'}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={formData.discount.value}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        discount: { ...prev.discount, value: e.target.value }
                                                    }))}
                                                    min="0"
                                                    max={formData.discount.type === 'percentage' ? "100" : ""}
                                                    step={formData.discount.type === 'percentage' ? "1" : "0.01"}
                                                    className="w-full p-2 border border-gray-300 rounded focus:ring-[#36A9E1] focus:border-[#36A9E1]"
                                                />
                                                <span className="absolute right-3 top-2 text-gray-500">
                                                    {formData.discount.type === 'percentage' ? '%' : '€'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Data d'inici
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={formData.discount.startDate}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    discount: { ...prev.discount, startDate: e.target.value }
                                                }))}
                                                className="w-full p-2 border border-gray-300 rounded focus:ring-[#36A9E1] focus:border-[#36A9E1]"
                                            />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Data de fi
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={formData.discount.endDate}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    discount: { ...prev.discount, endDate: e.target.value }
                                                }))}
                                                className="w-full p-2 border border-gray-300 rounded focus:ring-[#36A9E1] focus:border-[#36A9E1]"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="enabled"
                                name="enabled"
                                checked={formData.enabled}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-gray-300 text-[#36A9E1] focus:ring-[#36A9E1]"
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
                            className="px-4 py-2 border border-transparent rounded text-sm font-medium text-white bg-[#36A9E1] hover:bg-[#008A9B]"
                        >
                            {isEditing ? 'Actualitza' : 'Crea'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}