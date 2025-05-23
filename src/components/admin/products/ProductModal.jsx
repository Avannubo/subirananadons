'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogTitle } from '@headlessui/react';
import { FiX, FiUpload, FiChevronRight, FiFolder, FiFolderPlus, FiPackage, FiTrash2, FiMove, FiPlus } from 'react-icons/fi';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useStats } from '@/contexts/StatsContext';

export default function ProductModal({ isOpen, onClose, product, isEditing, onSave }) {
    const [formData, setFormData] = useState({
        name: '',
        reference: '',
        description: '',
        category: '',
        categoryId: '',
        brand: '',
        brandId: '',
        price_excl_tax: '',
        price_incl_tax: '',
        image: '',
        imageHover: '',
        additionalImages: [],
        stock: {
            available: '',
            minStock: 5
        },
        status: 'active',
        featured: false,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [imagePreview, setImagePreview] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [brands, setBrands] = useState([]);
    const [loadingBrands, setLoadingBrands] = useState(false);
    const [showBrandDropdown, setShowBrandDropdown] = useState(false);
    const [brandSearchTerm, setBrandSearchTerm] = useState('');
    const [productImages, setProductImages] = useState([]);
    const stats = useStats();

    // Fetch all categories and brands when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            fetchBrands();
        }
    }, [isOpen]);

    // Fetch categories for the dropdown
    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            const response = await fetch('/api/categories?flat=true');
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Error al cargar las categorías');
        } finally {
            setLoadingCategories(false);
        }
    };

    // Fetch brands for the dropdown
    const fetchBrands = async () => {
        try {
            setLoadingBrands(true);
            // Fetch all brands without pagination to get the complete list
            const response = await fetch('/api/brands?limit=100&enabled=true');
            if (!response.ok) {
                throw new Error('Failed to fetch brands');
            }
            const data = await response.json();
            // Handle both data formats (array or object with brands array)
            const brandsArray = data.brands || data || [];
            setBrands(brandsArray);
        } catch (error) {
            console.error('Error fetching brands:', error);
            toast.error('Error al cargar las marcas');
        } finally {
            setLoadingBrands(false);
        }
    };

    // Organize categories into a proper hierarchy for the dropdown
    const organizeCategories = (allCategories) => {
        const categoriesMap = {};
        const rootCategories = [];
        // First pass: create a map of all categories by ID
        allCategories.forEach(category => {
            categoriesMap[category._id] = {
                ...category,
                children: []
            };
        });
        // Second pass: build the hierarchy
        allCategories.forEach(category => {
            if (category.parent && categoriesMap[category.parent]) {
                // This is a child category, add it to its parent's children
                categoriesMap[category.parent].children.push(categoriesMap[category._id]);
            } else {
                // This is a root category (no parent or parent not found)
                rootCategories.push(categoriesMap[category._id]);
            }
        });
        return rootCategories;
    };

    // Get hierarchical categories for the dropdown
    const hierarchicalCategories = organizeCategories(categories);

    // Load product data when editing
    useEffect(() => {
        if (isEditing && product) {
            // Format all images into a single array for the UI
            const allImages = [];

            // Add main image
            if (product.image) {
                allImages.push(product.image);
            }

            // Add hover image if different from main image
            if (product.imageHover && product.imageHover !== product.image) {
                allImages.push(product.imageHover);
            }

            // Add additional images
            if (product.additionalImages && Array.isArray(product.additionalImages)) {
                allImages.push(...product.additionalImages);
            }

            setProductImages(allImages);

            if (allImages.length > 0) {
                setImagePreview(allImages[0]);
                setSelectedImageIndex(0);
            }

            setFormData({
                name: product.name || '',
                reference: product.reference || '',
                description: product.description || '',
                category: product.category || '',
                categoryId: product.categoryId || '',
                brand: product.brand || '',
                brandId: product.brandId || '',
                price_excl_tax: product.price_excl_tax || '',
                price_incl_tax: product.price_incl_tax || '',
                image: product.image || '',
                imageHover: product.imageHover || '',
                additionalImages: product.additionalImages || [],
                stock: {
                    available: product.stock?.available || '',
                    minStock: product.stock?.minStock || 5
                },
                status: product.status || 'active',
                featured: product.featured || false,
            });
        } else {
            // Reset for new product
            setProductImages([]);
            setSelectedImageIndex(-1);
            setImagePreview('');
        }
    }, [isEditing, product]);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'available' || name === 'minStock') {
            setFormData(prev => ({
                ...prev,
                stock: {
                    ...prev.stock,
                    [name]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    // Handle category selection from the dropdown
    const handleCategorySelect = (categoryName, categoryId) => {
        setFormData(prev => ({
            ...prev,
            category: categoryName,
            categoryId: categoryId
        }));
        setShowCategoryDropdown(false);
    };

    // Handle brand selection
    const handleBrandSelect = (brandName, brandId) => {
        setFormData(prev => ({
            ...prev,
            brand: brandName,
            brandId: brandId
        }));
        setShowBrandDropdown(false);
    };

    // Handle image selection
    const handleImageChange = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setSelectedImage(files);

            // Show preview of the first file
            const fileReader = new FileReader();
            fileReader.onload = () => {
                setImagePreview(fileReader.result);
            };
            fileReader.readAsDataURL(files[0]);

            // If multiple files selected, upload them immediately
            if (files.length > 1) {
                handleAddImage();
            }
        }
    };

    // Add image to product images array
    const handleAddImage = async () => {
        if (!selectedImage && !formData.image) {
            toast.error('Por favor seleccione una imagen o proporcione una URL');
            return;
        }

        // If URL provided, add it directly
        if (formData.image && !selectedImage) {
            // Check if this URL already exists in the product images
            if (productImages.includes(formData.image)) {
                toast.error('Esta imagen ya ha sido añadida');
                return;
            }

            const newImages = [...productImages, formData.image];
            setProductImages(newImages);

            // Clear inputs for next image
            setSelectedImage(null);
            setImagePreview('');
            setFormData(prev => ({
                ...prev,
                image: ''
            }));

            toast.success('Imagen añadida correctamente');
            return;
        }

        // Handle multiple files upload
        if (selectedImage && selectedImage.length) {
            setIsUploading(true);
            const toastId = toast.loading(`Subiendo ${selectedImage.length} imágenes...`);

            try {
                const uploadPromises = [];
                const filesArray = Array.from(selectedImage);

                // Process each file for upload
                for (const file of filesArray) {
                    uploadPromises.push(
                        new Promise(async (resolve) => {
                            try {
                                // Convert image to base64
                                const base64Image = await new Promise((resolveBase64) => {
                                    const reader = new FileReader();
                                    reader.onloadend = () => resolveBase64(reader.result);
                                    reader.readAsDataURL(file);
                                });

                                // Upload to server
                                const response = await fetch('/api/upload', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ image: base64Image })
                                });

                                if (!response.ok) {
                                    const errorData = await response.json();
                                    throw new Error(errorData.error || `Error al subir la imagen ${file.name}`);
                                }

                                const data = await response.json();
                                resolve(data.url);
                            } catch (error) {
                                console.error('Error uploading image:', error);
                                resolve(null); // Return null for failed uploads
                            }
                        })
                    );
                }

                // Wait for all uploads to complete
                const uploadedUrls = await Promise.all(uploadPromises);
                const validUrls = uploadedUrls.filter(url => url !== null);

                if (validUrls.length > 0) {
                    // Filter out any URLs that already exist in the product images
                    const newUrls = validUrls.filter(url => !productImages.includes(url));

                    if (newUrls.length === 0) {
                        toast.warning('Todas las imágenes ya han sido añadidas', { id: toastId });
                    } else {
                        setProductImages(prev => [...prev, ...newUrls]);
                        toast.success(`${newUrls.length} de ${filesArray.length} imágenes añadidas`, { id: toastId });
                    }
                } else {
                    toast.error('Error al subir las imágenes', { id: toastId });
                }

                // Clear inputs for next upload
                setSelectedImage(null);
                setImagePreview('');

            } catch (error) {
                console.error('Error uploading images:', error);
                toast.error('Error al subir las imágenes', { id: toastId });
            } finally {
                setIsUploading(false);
            }
            return;
        }

        // Handle single file upload (legacy path)
        if (selectedImage) {
            const imageUrl = await uploadImage();
            if (imageUrl) {
                // Check if this URL already exists
                if (productImages.includes(imageUrl)) {
                    toast.error('Esta imagen ya ha sido añadida');
                    return;
                }

                // Add the new image to the array
                const newImages = [...productImages, imageUrl];
                setProductImages(newImages);

                // Clear inputs for next image
                setSelectedImage(null);
                setImagePreview('');

                toast.success('Imagen añadida correctamente');
            }
        }
    };

    // Remove an image
    const handleRemoveImage = (index) => {
        const newImages = [...productImages];
        newImages.splice(index, 1);
        setProductImages(newImages);

        // Update selected image if needed
        if (selectedImageIndex >= newImages.length) {
            setSelectedImageIndex(Math.max(0, newImages.length - 1));
            setImagePreview(newImages.length > 0 ? newImages[Math.max(0, newImages.length - 1)] : '');
        }
    };

    // Move image up in the list
    const handleMoveImageUp = (index) => {
        if (index <= 0) return;

        const newImages = [...productImages];
        const temp = newImages[index];
        newImages[index] = newImages[index - 1];
        newImages[index - 1] = temp;

        setProductImages(newImages);

        // Update selected image index if it was moved
        if (selectedImageIndex === index) {
            setSelectedImageIndex(index - 1);
        } else if (selectedImageIndex === index - 1) {
            setSelectedImageIndex(index);
        }
    };

    // Move image down in the list
    const handleMoveImageDown = (index) => {
        if (index >= productImages.length - 1) return;

        const newImages = [...productImages];
        const temp = newImages[index];
        newImages[index] = newImages[index + 1];
        newImages[index + 1] = temp;

        setProductImages(newImages);

        // Update selected image index if it was moved
        if (selectedImageIndex === index) {
            setSelectedImageIndex(index + 1);
        } else if (selectedImageIndex === index + 1) {
            setSelectedImageIndex(index);
        }
    };

    // Select an image to view
    const handleSelectImage = (index) => {
        setSelectedImageIndex(index);
        setImagePreview(productImages[index]);
    };

    // Upload image to Cloudinary (legacy method for single image, kept for compatibility)
    const uploadImage = async () => {
        if (!selectedImage) return formData.image;
        setIsUploading(true);
        const toastId = toast.loading('Subiendo imagen...');
        try {
            // Convert image to base64
            const base64Image = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(selectedImage instanceof FileList ? selectedImage[0] : selectedImage);
            });
            // Upload to server
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: base64Image })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al subir la imagen');
            }
            const data = await response.json();
            toast.success('Imagen subida correctamente', { id: toastId });
            return data.url;
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Error al subir la imagen', { id: toastId });
            return formData.image;
        } finally {
            setIsUploading(false);
        }
    };

    // Form validation
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'El nombre es obligatorio';
        if (!formData.reference) newErrors.reference = 'La referencia es obligatoria';
        if (!formData.category) newErrors.category = 'La categoría es obligatoria';
        if (!formData.price_excl_tax) newErrors.price_excl_tax = 'El precio sin impuestos es obligatorio';
        if (!formData.price_incl_tax) newErrors.price_incl_tax = 'El precio con impuestos es obligatorio';
        // Validate numeric fields
        if (formData.price_excl_tax && isNaN(parseFloat(formData.price_excl_tax))) {
            newErrors.price_excl_tax = 'Debe ser un número válido';
        }
        if (formData.price_incl_tax && isNaN(parseFloat(formData.price_incl_tax))) {
            newErrors.price_incl_tax = 'Debe ser un número válido';
        }
        if (formData.stock.available && isNaN(parseInt(formData.stock.available))) {
            newErrors.available = 'Debe ser un número entero';
        }
        if (formData.stock.minStock && isNaN(parseInt(formData.stock.minStock))) {
            newErrors.minStock = 'Debe ser un número entero';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);

        try {
            // Prepare images for submission
            let mainImage = '';
            let hoverImage = '';
            let additionalImages = [];

            if (productImages.length > 0) {
                mainImage = productImages[0];

                if (productImages.length > 1) {
                    hoverImage = productImages[1];

                    if (productImages.length > 2) {
                        additionalImages = productImages.slice(2);
                    }
                }
            }

            // Convert string values to numbers
            const processedData = {
                ...formData,
                image: mainImage,
                imageHover: hoverImage,
                additionalImages: additionalImages,
                price_excl_tax: parseFloat(formData.price_excl_tax),
                price_incl_tax: parseFloat(formData.price_incl_tax),
                brandId: formData.brandId || '',
                stock: {
                    available: parseInt(formData.stock.available || 0),
                    minStock: parseInt(formData.stock.minStock || 5)
                }
            };

            // Save the product and get the saved product
            const savedProduct = await onSave(processedData);

            // Notify stats context about the change
            if (stats.notifyChange) {
                // Use setTimeout to ensure the API has time to process the change
                setTimeout(() => {
                    stats.notifyChange();
                }, 500);
            }
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error('Error al guardar el producto');
        } finally {
            setLoading(false);
        }
    };

    // Render category tree for dropdown with improved hierarchy indicators
    const renderCategoryOption = (category, level = 0, isLast = false, prefix = '') => {
        // Determine the prefix for this category based on its position in the hierarchy
        const currentPrefix = level === 0 ? '' : isLast ? `${prefix}└─ ` : `${prefix}├─ `;
        // Determine the prefix for child categories
        const childPrefix = level === 0 ? '' : isLast ? `${prefix}   ` : `${prefix}│  `;
        return (
            <div key={category._id} className="category-item">
                <div
                    className={`px-3  hover:bg-gray-100 cursor-pointer flex items-center ${level > 0 ? 'border-l border-gray-200' : ''}`}
                    onClick={() => handleCategorySelect(category.name, category._id)}
                >
                    {level > 0 && (
                        <span className="text-gray-400 font-mono mr-1">{currentPrefix}</span>
                    )}
                    <div className="flex items-center">
                        <FiFolder className={`mr-1 ${level === 0 ? 'text-[#00B0C8]' : 'text-gray-400'}`} size={14} />
                        <span className={`${level === 0 ? 'font-medium' : ''} text-sm`}>{category.name}</span>
                    </div>
                </div>
                {category.children && category.children.length > 0 && (
                    <div className="subcategory-group">
                        {category.children.map((child, index) =>
                            renderCategoryOption(
                                child,
                                level + 1,
                                index === category.children.length - 1,
                                childPrefix
                            )
                        )}
                    </div>
                )}
            </div>
        );
    };

    // Filter brands based on search term
    const filteredBrands = brands.filter(brand =>
        brand.name.toLowerCase().includes(brandSearchTerm.toLowerCase())
    );

    // Reset search when dropdown closes
    useEffect(() => {
        if (!showBrandDropdown) {
            setBrandSearchTerm('');
        }
    }, [showBrandDropdown]);

    // Handle brand search input
    const handleBrandSearch = (e) => {
        setBrandSearchTerm(e.target.value);
        // Keep the dropdown open
        if (!showBrandDropdown) {
            setShowBrandDropdown(true);
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-7xl bg-white rounded-lg shadow-xl overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b border-gray-300">
                        <DialogTitle className="text-lg font-medium">
                            {isEditing ? 'Editar Producto' : 'Añadir Nuevo Producto'}
                        </DialogTitle>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Left Column */}
                            <div className="space-y-6 md:col-span-2">
                                <h3 className="text-md font-medium">Información Básica</h3>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Nombre *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300'
                                            } rounded-md focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]`}
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
                                        Referencia *
                                    </label>
                                    <input
                                        type="text"
                                        id="reference"
                                        name="reference"
                                        value={formData.reference}
                                        onChange={handleChange}
                                        className={`mt-1 block w-full px-3 py-2 border ${errors.reference ? 'border-red-300' : 'border-gray-300'
                                            } rounded-md focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]`}
                                    />
                                    {errors.reference && (
                                        <p className="mt-1 text-sm text-red-600">{errors.reference}</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                        Descripción
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={3}
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                            Categoría *
                                        </label>
                                        <div className="relative">
                                            <div
                                                className={`mt-1 block w-full px-3 py-2 border ${errors.category ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none cursor-pointer flex justify-between items-center`}
                                                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                            >
                                                <span className="truncate">{formData.category || 'Seleccionar categoría'}</span>
                                                <FiChevronRight className={`transition-transform ${showCategoryDropdown ? 'rotate-90' : ''}`} />
                                            </div>
                                            {showCategoryDropdown && (
                                                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md overflow-auto border border-gray-300">
                                                    {loadingCategories ? (
                                                        <div className="flex justify-center p-4">
                                                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#00B0C8]"></div>
                                                            <span className="ml-2">Cargando categorías...</span>
                                                        </div>
                                                    ) : hierarchicalCategories.length === 0 ? (
                                                        <div className="p-4 text-gray-500">No hay categorías disponibles</div>
                                                    ) : (
                                                        <div className="py-1 category-dropdown">
                                                            <style jsx global>{`
                                                                .category-dropdown .category-item {
                                                                    margin: 0;
                                                                    padding: 0;
                                                                }
                                                                .category-dropdown .subcategory-group {
                                                                    margin: 0;
                                                                    padding: 0;
                                                                }
                                                            `}</style>
                                                            {hierarchicalCategories.map((category, index) =>
                                                                renderCategoryOption(
                                                                    category,
                                                                    0,
                                                                    index === hierarchicalCategories.length - 1
                                                                )
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {errors.category && (
                                            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                                            Marca
                                        </label>
                                        <div className="relative">
                                            <div
                                                className={`mt-1 block w-full px-3 py-2 border ${errors.brand ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none cursor-pointer flex justify-between items-center`}
                                                onClick={() => setShowBrandDropdown(!showBrandDropdown)}
                                            >
                                                {formData.brand ? (
                                                    <div className="flex items-center space-x-3 truncate">
                                                        {(() => {
                                                            const selectedBrand = brands.find(b => b._id === formData.brandId || b.name === formData.brand);
                                                            if (selectedBrand?.logo) {
                                                                return (
                                                                    <div className="w-6 h-6 flex-shrink-0 relative rounded overflow-hidden bg-white border border-gray-200">
                                                                        <Image
                                                                            src={selectedBrand.logo}
                                                                            alt={selectedBrand.name}
                                                                            width={100}
                                                                            height={100}
                                                                            className="object-contain w-full h-full"
                                                                        />
                                                                    </div>
                                                                );
                                                            }
                                                            return (
                                                                <div className="w-6 h-6 flex-shrink-0 rounded bg-gray-100 flex items-center justify-center">
                                                                    <FiPackage size={14} className="text-gray-400" />
                                                                </div>
                                                            );
                                                        })()}
                                                        <span className="truncate text-gray-700 font-medium">{formData.brand}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center space-x-2">
                                                        <FiPackage size={16} className="text-gray-400" />
                                                        <span className="truncate text-gray-500">Seleccionar marca</span>
                                                    </div>
                                                )}
                                                <FiChevronRight className={`transition-transform ${showBrandDropdown ? 'rotate-90' : ''}`} />
                                            </div>
                                            {showBrandDropdown && (
                                                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-80 rounded-md overflow-hidden border border-gray-300 flex flex-col">
                                                    {/* Search input */}
                                                    <div className="p-2 border-b border-gray-200 sticky top-0 bg-white z-10">
                                                        <input
                                                            type="text"
                                                            placeholder="Buscar marca..."
                                                            value={brandSearchTerm}
                                                            onChange={handleBrandSearch}
                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                    {/* Results container */}
                                                    <div className="overflow-auto max-h-60">
                                                        {loadingBrands ? (
                                                            <div className="flex justify-center p-4">
                                                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#00B0C8]"></div>
                                                                <span className="ml-2">Cargando marcas...</span>
                                                            </div>
                                                        ) : filteredBrands.length === 0 ? (
                                                            <div className="p-4 text-center text-gray-500">
                                                                {brandSearchTerm ?
                                                                    `No se encontraron marcas con "${brandSearchTerm}"` :
                                                                    "No hay marcas disponibles"}
                                                            </div>
                                                        ) : (
                                                            <div className="p-2  brand-dropdown">
                                                                <style jsx global>{`
                                                                    .brand-dropdown .brand-item {
                                                                        margin: 0;
                                                                        padding: 0;
                                                                    }
                                                                `}</style>
                                                                {filteredBrands.map((brand, index) =>
                                                                    <div
                                                                        key={brand._id}
                                                                        className="brand-item px-3 py-2   cursor-pointer flex items-center  space-x-3 my-2"
                                                                        onClick={() => handleBrandSelect(brand.name, brand._id)}
                                                                    >
                                                                        {brand.logo ? (
                                                                            <div className="w-10 h-10 flex-shrink-0 relative rounded overflow-hidden bg-white border border-gray-200">
                                                                                <Image
                                                                                    src={brand.logo}
                                                                                    alt={brand.name}
                                                                                    width={100}
                                                                                    height={100}
                                                                                    className="object-contain w-full h-full"
                                                                                />
                                                                            </div>
                                                                        ) : (
                                                                            <div className="w-10 h-10 flex-shrink-0 rounded bg-gray-100 flex items-center justify-center my-1">
                                                                                <FiPackage className="text-gray-400" size={16} />
                                                                            </div>
                                                                        )}
                                                                        <div>
                                                                            <span className="text-sm font-medium text-gray-700">{brand.name}</span>
                                                                            {brand.description && (
                                                                                <p className="text-xs text-gray-500 truncate max-w-[200px]">{brand.description}</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {errors.brand && (
                                            <p className="mt-1 text-sm text-red-600">{errors.brand}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="price_excl_tax" className="block text-sm font-medium text-gray-700">
                                            Precio sin Impuestos (€) *
                                        </label>
                                        <input
                                            type="text"
                                            id="price_excl_tax"
                                            name="price_excl_tax"
                                            value={formData.price_excl_tax}
                                            onChange={handleChange}
                                            className={`mt-1 block w-full px-3 py-2 border ${errors.price_excl_tax ? 'border-red-300' : 'border-gray-300'
                                                } rounded-md focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]`}
                                        />
                                        {errors.price_excl_tax && (
                                            <p className="mt-1 text-sm text-red-600">{errors.price_excl_tax}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="price_incl_tax" className="block text-sm font-medium text-gray-700">
                                            Precio con Impuestos (€) *
                                        </label>
                                        <input
                                            type="text"
                                            id="price_incl_tax"
                                            name="price_incl_tax"
                                            value={formData.price_incl_tax}
                                            onChange={handleChange}
                                            className={`mt-1 block w-full px-3 py-2 border ${errors.price_incl_tax ? 'border-red-300' : 'border-gray-300'
                                                } rounded-md focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]`}
                                        />
                                        {errors.price_incl_tax && (
                                            <p className="mt-1 text-sm text-red-600">{errors.price_incl_tax}</p>
                                        )}
                                    </div>
                                </div>
                                <h3 className="text-md font-medium mt-6">Inventario</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="available" className="block text-sm font-medium text-gray-700">
                                            Stock
                                        </label>
                                        <input
                                            type="number"
                                            id="available"
                                            name="available"
                                            value={formData.stock.available}
                                            onChange={handleChange}
                                            min="0"
                                            className={`mt-1 block w-full px-3 py-2 border ${errors.available ? 'border-red-300' : 'border-gray-300'
                                                } rounded-md focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]`}
                                        />
                                        {errors.available && (
                                            <p className="mt-1 text-sm text-red-600">{errors.available}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="minStock" className="block text-sm font-medium text-gray-700">
                                            Stock Mínimo
                                        </label>
                                        <input
                                            type="number"
                                            id="minStock"
                                            name="minStock"
                                            value={formData.stock.minStock}
                                            onChange={handleChange}
                                            min="0"
                                            className={`mt-1 block w-full px-3 py-2 border ${errors.minStock ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]`}
                                        />
                                        {errors.minStock && (
                                            <p className="mt-1 text-sm text-red-600">{errors.minStock}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                            Estado
                                        </label>
                                        <select
                                            id="status"
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]"
                                        >
                                            <option value="active">Activo</option>
                                            <option value="inactive">Inactivo</option>
                                            <option value="discontinued">Descontinuado</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center h-full pt-6">
                                        <input
                                            type="checkbox"
                                            id="featured"
                                            name="featured"
                                            checked={formData.featured}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-[#00B0C8] border-gray-300 rounded focus:ring-[#00B0C8]"
                                        />
                                        <label htmlFor="featured" className="ml-2 block text-sm font-medium text-gray-700">
                                            Destacado
                                        </label>
                                    </div>
                                </div>
                            </div>
                            {/* Right Column - Multiple Image Upload */}
                            <div className="space-y-6">
                                <h3 className="text-md font-medium">Imágenes del Producto</h3>

                                {/* Current Images */}
                                {productImages.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Imágenes Actuales</h4>
                                        <p className="text-xs text-gray-500 mb-2">
                                            La primera imagen será la principal, la segunda será la de hover (opcional).
                                        </p>
                                        <div className="flex overflow-x-auto p-1 space-x-4">
                                            {productImages.map((img, index) => (
                                                <div
                                                    key={index}
                                                    className={`relative flex-shrink-0 border border-gray-200 rounded-md overflow-hidden 
                                                        ${selectedImageIndex === index ? 'ring-2 ring-[#00B0C8]' : 'ring-1 ring-gray-200'}`}
                                                >
                                                    <div className="relative cursor-pointer" onClick={() => handleSelectImage(index)}>
                                                        <Image
                                                            src={img || '/assets/images/product-placeholder.jpg'}
                                                            alt={`Imagen de producto ${index + 1}`}
                                                            width={500}
                                                            height={500}
                                                            className="h-28 w-28 object-cover"
                                                        />
                                                        {index === 0 && (
                                                            <div className="absolute top-0 left-0 bg-[#00B0C8] text-white text-xs px-2 py-1">
                                                                Principal
                                                            </div>
                                                        )}
                                                        {index === 1 && (
                                                            <div className="absolute top-0 left-0 bg-indigo-500 text-white text-xs px-2 py-1">
                                                                Secundaria
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex justify-between bg-gray-50 p-1 gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMoveImageUp(index)}
                                                            disabled={index === 0}
                                                            className={`text-gray-500 p-1 rounded hover:bg-gray-200 ${index === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                            title="Mover a la izquierda"
                                                        >
                                                            <FiChevronRight className="transform rotate-180" size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveImage(index)}
                                                            className="text-red-500 p-1 rounded hover:bg-gray-200"
                                                            title="Eliminar imagen"
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMoveImageDown(index)}
                                                            disabled={index === productImages.length - 1}
                                                            className={`text-gray-500 p-1 rounded hover:bg-gray-200 ${index === productImages.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                            title="Mover a la derecha"
                                                        >
                                                            <FiChevronRight size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Image Upload */}
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="w-full p-2 h-44 relative rounded-lg border border-dashed border-gray-300 overflow-hidden bg-gray-50">
                                        {isUploading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                                            </div>
                                        )}
                                        {imagePreview ? (
                                            <Image
                                                src={imagePreview || '/assets/images/product-placeholder.jpg'}
                                                alt="Vista previa"
                                                width={1000}
                                                height={1000}
                                                className="w-full h-full object-contain rounded-lg"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full">
                                                <FiUpload className="w-10 h-10 text-gray-400" />
                                                <p className="mt-2 text-sm text-gray-500">No hay imagen seleccionada</p>
                                                <p className="mt-1 text-xs text-gray-400">
                                                    {productImages.length === 0
                                                        ? "Añada al menos una imagen principal"
                                                        : "Añada más imágenes (opcional)"}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="w-full grid grid-cols-2 gap-2">
                                        <div>
                                            <label
                                                htmlFor="productImage"
                                                className={`block w-full px-4 py-2 text-center text-white text-sm rounded-md ${isUploading
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-[#00B0C8] hover:bg-[#008A9B] cursor-pointer'
                                                    }`}
                                            >
                                                {isUploading ? 'Subiendo...' : 'Seleccionar imágenes'}
                                            </label>
                                            <input
                                                type="file"
                                                id="productImage"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                disabled={isUploading}
                                                className="hidden"
                                                multiple
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddImage}
                                            disabled={isUploading || (!selectedImage && !formData.image)}
                                            className={`w-full px-4 py-2 text-white text-sm rounded-md flex items-center justify-center gap-1 ${isUploading || (!selectedImage && !formData.image)
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-green-600 hover:bg-green-700'
                                                }`}
                                        >
                                            <FiPlus size={16} />
                                            <span>Añadir a Galería</span>
                                        </button>
                                    </div>

                                    <p className="mt-1 text-xs text-gray-500 text-center">
                                        Formatos: JPG, PNG. Max: 5MB
                                    </p>

                                    {/* Manual URL input */}
                                    <div className="w-full mt-4">
                                        <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                                            URL de Imagen (opcional)
                                        </label>
                                        <div className="flex mt-1">
                                            <input
                                                type="text"
                                                id="image"
                                                name="image"
                                                value={formData.image}
                                                onChange={handleChange}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]"
                                                placeholder="https://ejemplo.com/imagen.jpg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (formData.image) {
                                                        setImagePreview(formData.image);
                                                    }
                                                }}
                                                className="text-nowrap bg-gray-200 px-3 py-2 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-300"
                                            >
                                                Vista previa
                                            </button>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">
                                            O pegue la URL directamente aquí
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading || isUploading}
                                className="px-4 py-2 bg-[#00B0C8] text-white rounded-md text-sm font-medium hover:bg-[#008A9B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B0C8] disabled:opacity-50"
                            >
                                {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
                            </button>
                        </div>
                    </form>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
} 