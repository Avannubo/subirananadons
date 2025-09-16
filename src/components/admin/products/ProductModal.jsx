'use client';
import { useState, useEffect } from 'react';
import useShopParameter from '@/lib/useShopParameter';
import { Dialog, DialogTitle } from '@headlessui/react';
import { FiX, FiUpload, FiChevronRight, FiFolder, FiFolderPlus, FiPackage, FiTrash2, FiMove, FiPlus, FiChevronsUp } from 'react-icons/fi';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useStats } from '@/contexts/StatsContext';
import ImageSelector from '@/components/admin/shared/ImageSelector';
export default function ProductModal({ isOpen, onClose, product, isEditing, onSave }) {
    // --- State and Context Setup ---
    // --- Form Validation ---
    const validateForm = () => {
        const newErrors = {};
        // Example validation: required fields
        if (!formData.name || !formData.name.ca) newErrors.name = 'El nom en català és obligatori';
        if (!formData.reference) newErrors.reference = 'La referència és obligatòria';
        if (!formData.price_incl_tax || isNaN(parseFloat(formData.price_incl_tax))) newErrors.price_incl_tax = 'Preu amb impostos obligatori';
        if (!formData.category) newErrors.category = 'Categoria obligatòria';
        if (!formData.brand) newErrors.brand = 'Marca obligatòria';
        if (!formData.stock || isNaN(parseInt(formData.stock.minStock))) newErrors.minStock = 'Estoc mínim obligatori';
        // Validate discount dates if discount is active and dates are provided
        if (formData.discount?.active) {
            // Only validate start date if it's provided
            if (formData.discount.startDate) {
                const startDate = new Date(formData.discount.startDate);
                const now = new Date();
                if (startDate < now) {
                    newErrors.discountStartDate = 'La data d\'inici no pot ser anterior a ara';
                }
            }
            // Only validate date range if both dates are provided
            if (formData.discount.startDate && formData.discount.endDate) {
                const startDate = new Date(formData.discount.startDate);
                const endDate = new Date(formData.discount.endDate);
                if (startDate >= endDate) {
                    newErrors.discountDates = 'La data i hora de fi han de ser posteriors a la data i hora d\'inici';
                }
                // Calculate duration if both dates are set
                if (formData.discount.startDate && formData.discount.endDate) {
                    const startDate = new Date(formData.discount.startDate);
                    const endDate = new Date(formData.discount.endDate);
                    const duration = endDate - startDate;
                    // Add warning for flash offers (less than 2 hours)
                    if (duration <= 2 * 60 * 60 * 1000) {
                        toast('Atenció: Aquest és un descompte flash de curta durada', {
                            icon: '⚡',
                            style: {
                                borderRadius: '10px',
                                background: '#FFF3CD',
                                color: '#856404',
                            }
                        });
                    }
                }
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    // --- Shop Parameter (IVA) ---
    const { value: ivaValue, loading: ivaLoading } = useShopParameter('iva');
    // //console.log(product);
    const [formData, setFormData] = useState({
        name: { es: '', ca: '' },
        reference: '',
        description: { es: '', ca: '' },
        category: '',
        categoryId: '',
        brand: '',
        brandId: '',
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
    const [categorySearchTerm, setCategorySearchTerm] = useState('');
    const [brands, setBrands] = useState([]);
    const [loadingBrands, setLoadingBrands] = useState(false);
    const [showBrandDropdown, setShowBrandDropdown] = useState(false);
    const [brandSearchTerm, setBrandSearchTerm] = useState('');
    const [calculatedFinalPric, setCalculatedFinalPrice] = useState(0);
    const [productImages, setProductImages] = useState([]);
    // selectedImages: array of preview URLs for selected files
    const [selectedImages, setSelectedImages] = useState([]);
    // selectedFiles: array of File objects for selected files
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [showImageSelector, setShowImageSelector] = useState(false);
    const stats = useStats();
    // --- Data Fetching: Categories and Brands ---
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
    // --- Category Hierarchy Helpers ---
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
    // --- Category Search Filter ---
    const filterCategoriesByName = (categories, searchTerm) => {
        if (!searchTerm) return categories;
        const lowerSearch = searchTerm.toLowerCase();
        return categories
            .map(cat => {
                // Support category.name as string or object (translations)
                let catName = '';
                if (typeof cat.name === 'string') {
                    catName = cat.name;
                } else if (typeof cat.name === 'object' && cat.name !== null) {
                    // Try ca, es, name, or first available value
                    catName = cat.name.ca || cat.name.es || cat.name.name || Object.values(cat.name)[0] || '';
                }
                const matches = typeof catName === 'string' && catName.toLowerCase().includes(lowerSearch);
                const filteredChildren = filterCategoriesByName(cat.children || [], searchTerm);
                if (matches || filteredChildren.length > 0) {
                    return { ...cat, children: filteredChildren };
                }
                return null;
            })
            .filter(Boolean);
    };
    const filteredCategories = filterCategoriesByName(hierarchicalCategories, categorySearchTerm);
    // --- Load Product Data (Edit/New) ---
    // Check for expired discount periodically
    useEffect(() => {
        // Only check expiration for discounts that have both start and end dates
        if (!formData.discount?.active || !formData.discount?.startDate || !formData.discount?.endDate) return;
        // Set up timer to check expiration
        const endDate = new Date(formData.discount.endDate);
        const now = new Date();
        const timeUntilExpiry = endDate.getTime() - now.getTime();
        if (timeUntilExpiry > 0) {
            const timer = setTimeout(() => {
                setFormData(prev => ({
                    ...prev,
                    discount: {
                        ...prev.discount,
                        active: false
                    }
                }));
                toast('El descompte ha expirat i s\'ha desactivat automàticament', {
                    icon: '⚠️',
                    style: {
                        borderRadius: '10px',
                        background: '#FFF3CD',
                        color: '#856404',
                    }
                });
            }, timeUntilExpiry);
            return () => clearTimeout(timer);
        }
    }, [formData.discount?.endDate, formData.discount?.active]);
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
            // Handle translation fallback for name and description
            let name = { es: '', ca: '' };
            if (typeof product.name === 'object' && product.name !== null) {
                name = { es: product.name.es || '', ca: product.name.ca || '' };
            } else if (typeof product.name === 'string') {
                name = { es: product.name, ca: '' };
            }
            let description = { es: '', ca: '' };
            if (typeof product.description === 'object' && product.description !== null) {
                description = { es: product.description.es || '', ca: product.description.ca || '' };
            } else if (typeof product.description === 'string') {
                description = { es: product.description, ca: '' };
            }
            // Handle discount data
            const discount = product.discount ? {
                ...product.discount,
                active: product.discount.active ?? false,
                type: product.discount.type ?? 'percentage',
                value: product.discount.value ?? '',
                // Format dates to local datetime-local input format
                startDate: product.discount.startDate ? new Date(product.discount.startDate).toISOString().slice(0, 16) : '',
                endDate: product.discount.endDate ? new Date(product.discount.endDate).toISOString().slice(0, 16) : '',
                minPurchaseAmount: product.discount.minPurchaseAmount ?? '',
                minQuantity: product.discount.minQuantity ?? '',
                finalPrice: product.discount.finalPrice ?? null
            } : {
                active: false,
                type: 'percentage',
                value: '',
                startDate: '',
                endDate: '',
                minPurchaseAmount: '',
                minQuantity: '',
                finalPrice: null
            };
            setFormData({
                name,
                reference: product.reference || '',
                description,
                category: product.category,
                categoryId: product.categoryId || '',
                brand: product.brand,
                brandId: product.brandId || '',
                categoryDisplayName: product.categoryDisplayName || '',
                brandDisplayName: product.brandDisplayName || '',
                price_incl_tax: product.price_incl_tax || '',
                image: product.image || '',
                imageHover: product.imageHover || '',
                additionalImages: product.additionalImages || [],
                stock: {
                    available: product.stock?.available || 0,
                    minStock: product.stock?.minStock || 0
                },
                status: product.status || 'active',
                featured: product.featured || false,
                discount: discount
            });
        } else {
            // Reset for new product
            setProductImages([]);
            setSelectedImageIndex(-1);
            setImagePreview('');
            setFormData({
                name: { es: '', ca: '' },
                reference: '',
                description: { es: '', ca: '' },
                category: '',
                categoryId: '',
                brand: '',
                brandId: '',
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
                discount: {
                    active: false,
                    type: 'percentage',
                    value: '',
                    startDate: '',
                    endDate: '',
                    minPurchaseAmount: '',
                    minQuantity: ''
                }
            });
        }
    }, [isEditing, product]);
    // --- Form Input Change Handler ---
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'status' && value !== 'active') {
            // If product is deactivated or discontinued, reset the discount
            setFormData(prev => ({
                ...prev,
                [name]: value,
                discount: {
                    active: false,
                    type: 'percentage',
                    value: '',
                    startDate: '',
                    endDate: '',
                    minPurchaseAmount: '',
                    minQuantity: '',
                    finalPrice: null
                }
            }));
            return;
        }
        if (name.startsWith('discount.')) {
            const discountField = name.split('.')[1];
            let newDiscount;
            if (discountField === 'active') {
                if (!checked) {
                    // When deactivating discount, reset all discount fields
                    newDiscount = {
                        active: false,
                        type: 'percentage',
                        value: '',
                        startDate: '',
                        endDate: '',
                        minPurchaseAmount: '',
                        minQuantity: '',
                        finalPrice: null
                    };
                } else {
                    // When activating, just set active state and preserve existing values
                    const existingDiscount = formData.discount || {};
                    newDiscount = {
                        ...existingDiscount,
                        active: true,
                        type: existingDiscount.type || 'percentage'
                    };
                }
            } else if (discountField === 'startDate' || discountField === 'endDate') {
                // For date fields, store in ISO format but adjust for local timezone
                let dateString = '';
                if (value) {
                    const dateValue = new Date(value);
                    dateString = dateValue.toISOString();
                }
                newDiscount = {
                    ...(formData.discount || {}),
                    [discountField]: dateString
                };
            } else {
                newDiscount = {
                    ...(formData.discount || {}),
                    [discountField]: type === 'checkbox' ? checked : value
                };
            }
            // If changing the type or value, recalculate the final price
            if (discountField === 'type' || discountField === 'value' || discountField === 'active') {
                const basePrice = parseFloat(formData.price_incl_tax);
                if (basePrice) {
                    const finalPrice = calculateFinalPrice(basePrice, {
                        ...newDiscount,
                        value: discountField === 'value' ? value : newDiscount.value
                    });
                    setCalculatedFinalPrice(finalPrice);
                }
            }
            setFormData(prev => ({
                ...prev,
                discount: newDiscount
            }));
            // Clear any previous discount-related errors
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.discountType;
                delete newErrors.discountValue;
                delete newErrors.discountDates;
                return newErrors;
            });
        } else if (name === 'price_incl_tax') {
            // When price changes, recalculate final price if discount is active
            const newPrice = parseFloat(value);
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
            if (formData.discount?.active && newPrice) {
                const finalPrice = calculateFinalPrice(newPrice, formData.discount);
                setCalculatedFinalPrice(finalPrice);
            }
        } else if (name === 'name') {
            setFormData(prev => ({
                ...prev,
                name: {
                    ...prev.name,
                    [e.target.id === 'name-ca' ? 'ca' : 'es']: value
                }
            }));
        } else if (name === 'description') {
            setFormData(prev => ({
                ...prev,
                description: {
                    ...prev.description,
                    [e.target.id === 'description-ca' ? 'ca' : 'es']: value
                }
            }));
            // Synchronize textarea heights after a short delay to ensure state is updated
            setTimeout(() => {
                const caTextarea = document.getElementById('description-ca');
                const esTextarea = document.getElementById('description-es');
                if (caTextarea && esTextarea) {
                    // Reset heights to auto to get proper scrollHeight
                    caTextarea.style.height = 'auto';
                    esTextarea.style.height = 'auto';
                    // Get the maximum height between both textareas
                    const height = Math.max(caTextarea.scrollHeight, esTextarea.scrollHeight, 144); // minimum height of 144px (6 rows)
                    // Set both textareas to the maximum height
                    caTextarea.style.height = `${height}px`;
                    esTextarea.style.height = `${height}px`;
                }
            }, 0);
        } else if (name === 'available' || name === 'minStock') {
            setFormData(prev => ({
                ...prev,
                stock: {
                    ...prev.stock,
                    [name]: type === 'number' ? Number(value) : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };
    // --- Category Selection Handler ---
    const handleCategorySelect = (categoryObj) => {
        setFormData(prev => ({
            ...prev,
            category: categoryObj._id,
            categoryId: categoryObj._id, // Set both category and categoryId
            categoryDisplayName: getCategoryDisplayName(categoryObj),
            _categoryChanged: true
        }));
        setShowCategoryDropdown(false);
    };
    // --- Brand Selection Handler ---
    const handleBrandSelect = (brandObj) => {
        setFormData(prev => ({
            ...prev,
            brand: brandObj._id,
            brandId: brandObj._id, // Set both brand and brandId
            brandDisplayName: brandObj.name,
            _brandChanged: true
        }));
        setShowBrandDropdown(false);
    };
    // --- Image Selection and Preview ---
    // Handle image selection and preview for multiple files
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files && files.length > 0) {
            setSelectedImage(files);
            setSelectedFiles(files);
            // Generate preview URLs for all selected files
            Promise.all(files.map(file => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.readAsDataURL(file);
                });
            })).then(previews => {
                setSelectedImages(previews);
            });
            // Show preview of the first file
            const fileReader = new FileReader();
            fileReader.onload = () => {
                setImagePreview(fileReader.result);
            };
            fileReader.readAsDataURL(files[0]);
        }
    };
    // --- Add Image to Product Gallery ---
    const handleAddImage = async () => {
        // If URL provided, add it directly
        if (formData.image && (!selectedFiles || selectedFiles.length === 0)) {
            if (productImages.includes(formData.image)) {
                toast.error('La imagen ya existe en la galería');
                return;
            }
            setProductImages(prev => [...prev, formData.image]);
            setFormData(prev => ({ ...prev, image: '' }));
            setImagePreview('');
            toast.success('Imagen añadida correctamente');
            return;
        }
        // Handle multiple files upload
        if (selectedFiles && selectedFiles.length > 0) {
            setIsUploading(true);
            const toastId = toast.loading(`Subiendo ${selectedFiles.length} imágenes...`);
            try {
                const uploadPromises = selectedFiles.map(async (file) => {
                    try {
                        // Convert image to base64
                        const base64Image = await new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.readAsDataURL(file);
                        });
                        // Upload to server
                        const response = await fetch('/api/cloudinary/upload', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ image: base64Image })
                        });
                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.error || `Error al subir la imagen ${file.name}`);
                        }
                        const data = await response.json();
                        return data.url;
                    } catch (error) {
                        console.error('Error uploading image:', error);
                        toast.error(`Error al subir la imagen ${file.name}`);
                        return null;
                    }
                });
                const uploadedUrls = await Promise.all(uploadPromises);
                const validUrls = uploadedUrls.filter(url => url !== null);
                if (validUrls.length > 0) {
                    // Filter out any URLs that already exist in the product images
                    const newUrls = validUrls.filter(url => !productImages.includes(url));
                    if (newUrls.length > 0) {
                        setProductImages(prev => [...prev, ...newUrls]);
                        toast.success(`${newUrls.length} de ${selectedFiles.length} imágenes añadidas`, {
                            id: toastId
                        });
                    } else {
                        toast.warning('Todas las imágenes ya han sido añadidas', { id: toastId });
                    }
                } else {
                    toast.error('Error al subir las imágenes', { id: toastId });
                }
            } catch (error) {
                console.error('Error uploading images:', error);
                toast.error('Error al subir las imágenes', { id: toastId });
            } finally {
                setIsUploading(false);
                setSelectedFiles([]);
                setSelectedImages([]);
                setSelectedImage(null);
                setImagePreview('');
            }
        }
    };
    // --- Form Submission Handler ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        // Check if discount is expired before saving
        if (formData.discount?.active && isDiscountExpired(formData.discount)) {
            const confirmSave = window.confirm('El descompte ha expirat. Voleu desar el producte amb el descompte desactivat?');
            if (confirmSave) {
                setFormData(prev => ({
                    ...prev,
                    discount: {
                        ...prev.discount,
                        active: false
                    }
                }));
            } else {
                return;
            }
        }
        setLoading(true);
        try {
            // Prepare images for submission
            let mainImage = '';
            let hoverImage = '';
            let additionalImages = [];
            if (productImages.length > 0) {
                mainImage = productImages[0];
                if (productImages.length > 1) hoverImage = productImages[1];
                if (productImages.length > 2) additionalImages = productImages.slice(2);
            }
            // Ensure category and brand are ObjectId (not name or empty string)
            let categoryId = formData.category;
            let brandId = formData.brand;
            //console.log(categoryId, brandId);
            const isObjectId = (val) => typeof val === 'string' && /^[a-fA-F0-9]{24}$/.test(val);
            // Treat empty string as null for category/brand
            if (categoryId === "") categoryId = null;
            if (brandId === "") brandId = null;
            // Always convert to ObjectId string or null (never send object)
            if (categoryId && !isObjectId(categoryId)) {
                let foundCat = categories.find(c => c.name === categoryId || c._id === categoryId);
                if (foundCat && isObjectId(foundCat._id)) categoryId = foundCat._id;
                else categoryId = null;
            }
            if (categoryId && typeof categoryId === 'object' && categoryId.toString) categoryId = categoryId.toString();
            if (!categoryId || !isObjectId(categoryId)) categoryId = null;
            if (brandId && !isObjectId(brandId)) {
                let foundBrand = brands.find(b => b.name === brandId);
                if (foundBrand && isObjectId(foundBrand._id)) brandId = foundBrand._id;
                else brandId = null;
            }
            if (brandId && typeof brandId === 'object' && brandId.toString) brandId = brandId.toString();
            if (!brandId || !isObjectId(brandId)) brandId = null;
            const processedData = {
                ...formData,
                category: categoryId,
                brand: brandId,
                image: mainImage,
                imageHover: hoverImage,
                additionalImages: additionalImages,
                price_incl_tax: parseFloat(formData.price_incl_tax),
                stock: {
                    available: parseInt(formData.stock.available || 0),
                    minStock: parseInt(formData.stock.minStock || 5),
                },
            };
            // Save the product and get the saved product
            let savedProduct;
            try {
                savedProduct = await onSave(processedData);
            } catch (apiError) {
                // If the API returns a message, show it
                if (apiError && apiError.message) {
                    toast.error(apiError.message);
                } else if (apiError && apiError.error) {
                    toast.error(apiError.error);
                } else if (typeof apiError === 'string') {
                    toast.error(apiError);
                } else {
                    toast.error('Error al guardar el producto');
                }
                throw apiError;
            }
        } catch (error) {
            console.error('Error saving product:', error);
            // Only show toast if not already shown by API error block
        } finally {
            setLoading(false);
        }
    };
    // --- Remove Image from Gallery ---
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
    // --- Move Image Up in Gallery ---
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
    // --- Move Image Down in Gallery ---
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
    // --- Category Dropdown Render Helper ---
    const getCategoryDisplayName = (cat) => {
        if (!cat) return '';
        if (cat.name) {
            if (typeof cat.name === 'object') {
                return cat.name.ca || cat.name.es || cat.name.name || '';
            }
            return cat.name;
        }
        // fallback for legacy
        return cat.ca || cat.es || cat.name || '';
    };
    // --- Brand Search Input Handler ---
    const handleBrandSearch = (e) => {
        setBrandSearchTerm(e.target.value);
        // Keep the dropdown open
        if (!showBrandDropdown) {
            setShowBrandDropdown(true);
        }
    };
    const renderCategoryOption = (category, level = 0, isLast = false, prefix = '') => {
        const currentPrefix = level === 0 ? '' : isLast ? `${prefix}└─ ` : `${prefix}├─ `;
        const childPrefix = level === 0 ? '' : isLast ? `${prefix}   ` : `${prefix}│  `;
        return (
            <div key={category._id} className="category-item">
                <div
                    className={`px-3  hover:bg-gray-100 cursor-pointer flex items-center ${level > 0 ? 'border-l border-gray-200' : ''}`}
                    onClick={() => handleCategorySelect(category)}
                >
                    {level > 0 && (
                        <span className="text-gray-400 font-mono mr-1">{currentPrefix}</span>
                    )}
                    <div className="flex items-center">
                        <FiFolder className={`mr-1 ${level === 0 ? 'text-[#36A9E1]' : 'text-gray-400'}`} size={14} />
                        <span className={`${level === 0 ? 'font-medium' : ''} text-sm`}>{getCategoryDisplayName(category)}</span>
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
    // --- Brand Search Filter ---
    const filteredBrands = brands.filter(brand =>
        (brand.name || '').toLowerCase().includes(brandSearchTerm.toLowerCase())
    );
    // --- Brand Dropdown Reset ---
    useEffect(() => {
        if (!showBrandDropdown) {
            setBrandSearchTerm('');
        }
    }, [showBrandDropdown]);
    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-7xl bg-white rounded-lg shadow-xl overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b border-gray-300">
                        <DialogTitle className="text-lg font-medium">
                            {isEditing ? 'Editar producte' : 'Afegir nou producte'}
                        </DialogTitle>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="">
                        <div className="overflow-y-auto max-h-[80vh] p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                {/* Left Column */}
                                <div className="space-y-4 md:col-span-2">
                                    <h3 className="text-md font-medium">Informació bàsica</h3>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label htmlFor="name-ca" className="block text-sm font-medium text-gray-700">
                                                Nom (CA) *
                                            </label>
                                            <input
                                                type="text"
                                                id="name-ca"
                                                name="name"
                                                value={formData.name.ca}
                                                onChange={handleChange}
                                                className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-[#36A9E1] focus:border-[#36A9E1]`}
                                            />
                                            {errors.name && (
                                                <p className=" text-sm text-red-600">{errors.name}</p>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <label htmlFor="name-es" className="block text-sm font-medium text-gray-700">
                                                Nom (ES) *
                                            </label>
                                            <input
                                                type="text"
                                                id="name-es"
                                                name="name"
                                                value={formData.name.es}
                                                onChange={handleChange}
                                                className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-[#36A9E1] focus:border-[#36A9E1]`}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-4 mt-2">
                                        <div className="flex-1">
                                            <label htmlFor="description-ca" className="block text-sm font-medium text-gray-700">
                                                Descripció (CA)
                                            </label>
                                            <textarea
                                                id="description-ca"
                                                name="description"
                                                rows={6}
                                                value={formData.description.ca}
                                                onChange={handleChange}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#36A9E1] focus:border-[#36A9E1] whitespace-pre-line"
                                                style={{ whiteSpace: 'pre-line' }}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label htmlFor="description-es" className="block text-sm font-medium text-gray-700">
                                                Descripció (ES)
                                            </label>
                                            <textarea
                                                id="description-es"
                                                name="description"
                                                rows={6}
                                                value={formData.description.es}
                                                onChange={handleChange}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#36A9E1] focus:border-[#36A9E1] whitespace-pre-line"
                                                style={{ whiteSpace: 'pre-line' }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
                                            Referència *
                                        </label>
                                        <input
                                            type="text"
                                            id="reference"
                                            name="reference"
                                            value={formData.reference}
                                            onChange={handleChange}
                                            className={`mt-1 block w-full px-3 py-2 border ${errors.reference ? 'border-red-300' : 'border-gray-300'
                                                } rounded-md focus:outline-none focus:ring-[#36A9E1] focus:border-[#36A9E1]`}
                                        />
                                        {errors.reference && (
                                            <p className="mt-1 text-sm text-red-600">{errors.reference}</p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                                Categoria:
                                                {isEditing && (
                                                    <span className='font-bold'> {
                                                        product.category && typeof product.category === 'object'
                                                            ? (
                                                                // If category has a name object (populated)
                                                                product.category.name && typeof product.category.name === 'object'
                                                                    ? (product.category.name.ca || product.category.name.es || product.category.name.name || 'N/D')
                                                                    // If category is a translation object itself (like { ca, es })
                                                                    : (product.category.ca || product.category.es || product.category.name || 'N/D')
                                                            )
                                                            : (product.category || 'N/D')
                                                    }</span>)}
                                            </label>
                                            <div className="relative">
                                                <div
                                                    className={`mt-1 block w-full px-3 py-2 border ${errors.category ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none cursor-pointer flex justify-between items-center`}
                                                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                                >
                                                    <span className="truncate">{
                                                        formData.categoryDisplayName || 'Selecciona categoria'
                                                    }</span>
                                                    <FiChevronRight className={`transition-transform ${showCategoryDropdown ? 'rotate-90' : ''}`} />
                                                </div>
                                                {showCategoryDropdown && (
                                                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md overflow-auto border border-gray-300">
                                                        {loadingCategories ? (
                                                            <div className="flex justify-center p-4">
                                                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#36A9E1]"></div>
                                                                <span className="ml-2">Carregant categories...</span>
                                                            </div>
                                                        ) : hierarchicalCategories.length === 0 ? (
                                                            <div className="p-4 text-gray-500">No hi ha categories disponibles</div>
                                                        ) : (
                                                            <>
                                                                <div className='p-2 border-b border-gray-200 sticky top-0 bg-white z-10'>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Cerca categoria..."
                                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-[#36A9E1] focus:border-[#36A9E1]"
                                                                        value={categorySearchTerm}
                                                                        onChange={e => setCategorySearchTerm(e.target.value)}
                                                                    />
                                                                </div>
                                                                <div className=" category-dropdown">
                                                                    <style jsx global>{`
                                                                    .category-dropdown .category-item {
                                                                        margin: 0;
                                                                        padding: 0;
                                                                        }
                                                                        .category-dropdown .subcategory-group {
                                                                            margin: 0;
                                                                            padding: 0;
                                                                    }
                                                                `}
                                                                    </style>
                                                                    {filteredCategories.length === 0 ? (
                                                                        <div className="p-4 text-center text-gray-500">
                                                                            {categorySearchTerm
                                                                                ? `No s'han trobat categories amb "${categorySearchTerm}"`
                                                                                : "No hi ha categories disponibles"}
                                                                        </div>
                                                                    ) : (
                                                                        filteredCategories.map((category, index) =>
                                                                            renderCategoryOption(
                                                                                category,
                                                                                0,
                                                                                index === filteredCategories.length - 1
                                                                            )
                                                                        )
                                                                    )}
                                                                </div>
                                                            </>
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
                                                Marca:
                                                {isEditing && (<span className='font-bold'> {product.brand || 'N/D'}</span>)}
                                            </label>
                                            <div className="relative">
                                                <div
                                                    className={`mt-1 block w-full px-3 py-2 border ${errors.brand ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none cursor-pointer flex justify-between items-center`}
                                                    onClick={() => setShowBrandDropdown(!showBrandDropdown)}
                                                >
                                                    {formData.brand ? (
                                                        <div className="flex items-center space-x-3 truncate">
                                                            {(() => {
                                                                const selectedBrand = brands.find(b => b._id === formData.brand);
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
                                                            <span className="truncate text-gray-700 font-medium">{
                                                                (() => {
                                                                    const selectedBrand = brands.find(b => b._id === formData.brand);
                                                                    return selectedBrand ? selectedBrand.name : ' Selecciona nova marca';
                                                                })()
                                                            }</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center space-x-2">
                                                            <FiPackage size={16} className="text-gray-400" />
                                                            <span className="truncate text-gray-500">Selecciona marca</span>
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
                                                                placeholder="Cerca marca..."
                                                                value={brandSearchTerm}
                                                                onChange={handleBrandSearch}
                                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-[#36A9E1] focus:border-[#36A9E1]"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                        {/* Results container */}
                                                        <div className="overflow-auto max-h-60">
                                                            {loadingBrands ? (
                                                                <div className="flex justify-center p-4">
                                                                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#36A9E1]"></div>
                                                                    <span className="ml-2">Carregant marques...</span>
                                                                </div>
                                                            ) : filteredBrands.length === 0 ? (
                                                                <div className="p-4 text-center text-gray-500">
                                                                    {brandSearchTerm ?
                                                                        `No s'han trobat marques amb "${brandSearchTerm}"` :
                                                                        "No hi ha marques disponibles"}
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
                                                                            onClick={() => handleBrandSelect(brand)}
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
                                                Preu sense impostos (€)
                                            </label>
                                            <input
                                                type="text"
                                                id="price_excl_tax"
                                                name="price_excl_tax"
                                                value={(() => {
                                                    const iva = parseFloat(ivaValue || '21');
                                                    const incl = parseFloat(formData.price_incl_tax || '');
                                                    if (!incl || isNaN(incl) || !iva || isNaN(iva)) return '';
                                                    return (incl / (1 + iva / 100)).toFixed(2);
                                                })()}
                                                readOnly
                                                disabled
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 focus:outline-none"
                                                placeholder={ivaLoading ? 'Carregant...' : 'Calculat automàticament'}
                                            />
                                            <p className="mt-1 text-xs text-gray-500">IVA actual: {ivaLoading ? 'Carregant...' : ivaValue ? ivaValue + '%' : 'No definit'}</p>
                                        </div>
                                        <div>
                                            <label htmlFor="price_incl_tax" className="block text-sm font-medium text-gray-700">
                                                Preu amb impostos (€) *
                                            </label>
                                            <input
                                                type="text"
                                                id="price_incl_tax"
                                                name="price_incl_tax"
                                                value={formData.price_incl_tax}
                                                onChange={handleChange}
                                                className={`mt-1 block w-full px-3 py-2 border ${errors.price_incl_tax ? 'border-red-300' : 'border-gray-300'
                                                    } rounded-md focus:outline-none focus:ring-[#36A9E1] focus:border-[#36A9E1]`}
                                            />
                                            {errors.price_incl_tax && (
                                                <p className="mt-1 text-sm text-red-600">{errors.price_incl_tax}</p>
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="text-md font-medium mt-6">Descompte</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center h-full">
                                            <input
                                                type="checkbox"
                                                id="discount-active"
                                                name="discount.active"
                                                checked={formData.discount?.active ?? false}
                                                onChange={handleChange}
                                                className="h-4 w-4 text-[#36A9E1] border-gray-300 rounded focus:ring-[#36A9E1]"
                                            />
                                            <label htmlFor="discount-active" className="ml-2 block text-sm font-medium text-gray-700">
                                                Activar descompte
                                            </label>
                                        </div>
                                        {isEditing && formData.discount?.active && formData.discount?.startDate && (
                                            <div className="flex items-center justify-end">
                                                <span className="text-sm text-gray-500">
                                                    Descompte actiu des de {new Date(formData.discount.startDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {formData.discount?.active && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            <div>
                                                <label htmlFor="discount-type" className="block text-sm font-medium text-gray-700">
                                                    Tipus de descompte
                                                </label>
                                                <select
                                                    id="discount-type"
                                                    name="discount.type"
                                                    value={formData.discount?.type || 'percentage'}
                                                    onChange={handleChange}
                                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#36A9E1] focus:border-[#36A9E1]"
                                                >
                                                    <option value="percentage">Percentatge (%)</option>
                                                    <option value="fixed">Import fix (€)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="discount-value" className="block text-sm font-medium text-gray-700">
                                                    {formData.discount?.type === 'fixed' ? 'Import del descompte (€)' : 'Percentatge de descompte (%)'}
                                                </label>
                                                <input
                                                    type="number"
                                                    id="discount-value"
                                                    name="discount.value"
                                                    value={formData.discount?.value || ''}
                                                    onChange={handleChange}
                                                    min="0"
                                                    max={formData.discount?.type === 'percentage' ? "99" : undefined}
                                                    step={formData.discount?.type === 'percentage' ? "1" : "0.01"}
                                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#36A9E1] focus:border-[#36A9E1]"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="discount-start-date" className="block text-sm font-medium text-gray-700">
                                                    Data i hora d'inici
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    id="discount-start-date"
                                                    name="discount.startDate"
                                                    value={formData.discount?.startDate ? new Date(formData.discount.startDate).toISOString().slice(0, 16) : ''}
                                                    onChange={handleChange}
                                                    step="60"
                                                    className={`mt-1 block w-full px-3 py-2 border ${errors.discountStartDate ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-[#36A9E1] focus:border-[#36A9E1]`}
                                                />
                                                {errors.discountStartDate && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.discountStartDate}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label htmlFor="discount-end-date" className="block text-sm font-medium text-gray-700">
                                                    Data i hora de fi
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    id="discount-end-date"
                                                    name="discount.endDate"
                                                    value={formData.discount?.endDate ? new Date(formData.discount.endDate).toISOString().slice(0, 16) : ''}
                                                    onChange={handleChange}
                                                    step="60"
                                                    className={`mt-1 block w-full px-3 py-2 border ${errors.discountEndDate ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-[#36A9E1] focus:border-[#36A9E1]`}
                                                />
                                                {errors.discountEndDate && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.discountEndDate}</p>
                                                )}
                                                {errors.discountDates && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.discountDates}</p>
                                                )}
                                            </div>
                                            <div className="md:col-span-2">
                                                <label htmlFor="discount-min-quantity" className="block text-sm font-medium text-gray-700">
                                                    Preu final amb descompte:
                                                </label>
                                                <div className="mt-2 p-4 bg-gray-50 rounded-md border border-gray-200">
                                                    <p className="text-lg font-medium text-gray-700">
                                                        {
                                                            formData.discount.type === 'percentage'
                                                                ? (formData.price_incl_tax * (1 - formData.discount.value / 100)).toFixed(2)
                                                                : Math.max(0, formData.price_incl_tax - formData.discount.value).toFixed(2)
                                                        } €
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <h3 className="text-md font-medium mt-6">Inventari</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="available" className="block text-sm font-medium text-gray-700">
                                                Estoc
                                            </label>
                                            <input
                                                type="number"
                                                id="available"
                                                name="available"
                                                value={formData.stock.available}
                                                onChange={handleChange}
                                                min="0"
                                                className={`mt-1 block w-full px-3 py-2 border ${errors.available ? 'border-red-300' : 'border-gray-300'
                                                    } rounded-md focus:outline-none focus:ring-[#36A9E1] focus:border-[#36A9E1]`}
                                            />
                                            {errors.available && (
                                                <p className="mt-1 text-sm text-red-600">{errors.available}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="minStock" className="block text-sm font-medium text-gray-700">
                                                Estoc mínim
                                            </label>
                                            <input
                                                type="number"
                                                id="minStock"
                                                name="minStock"
                                                value={formData.stock.minStock}
                                                onChange={handleChange}
                                                min="0"
                                                className={`mt-1 block w-full px-3 py-2 border ${errors.minStock ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-[#36A9E1] focus:border-[#36A9E1]`}
                                            />
                                            {errors.minStock && (
                                                <p className="mt-1 text-sm text-red-600">{errors.minStock}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                                Estat
                                            </label>
                                            <select
                                                id="status"
                                                name="status"
                                                value={formData.status}
                                                onChange={handleChange}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#36A9E1] focus:border-[#36A9E1]"
                                            >
                                                <option value="active">Actiu</option>
                                                <option value="inactive">Inactiu</option>
                                                <option value="discontinued">Descatalogat</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center h-full pt-6">
                                            <input
                                                type="checkbox"
                                                id="featured"
                                                name="featured"
                                                checked={formData.featured}
                                                onChange={handleChange}
                                                className="h-4 w-4 text-[#36A9E1] border-gray-300 rounded focus:ring-[#36A9E1]"
                                            />
                                            <label htmlFor="featured" className="ml-2 block text-sm font-medium text-gray-700">
                                                Destacat
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                {/* Right Column - Multiple Image Upload */}
                                <div className="space-y-6">
                                    <h3 className="text-md font-medium">Imatges del producte</h3>
                                    {/* Current Images */}
                                    <div className="mb-6">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Imatges actuals</h4>
                                        <p className="text-xs text-gray-500 mb-2">
                                            La primera imatge serà la principal, la segona serà la de hover (opcional).
                                        </p>
                                        <div className="flex overflow-x-auto p-1 space-x-4">
                                            {productImages.map((img, index) => (
                                                <div
                                                    key={index}
                                                    className={`relative flex-shrink-0 border border-gray-200 rounded-md overflow-hidden ring-1 ring-gray-200`}
                                                >
                                                    <div className="relative " >
                                                        <img
                                                            src={img || '/assets/images/product-placeholder.jpg'}
                                                            alt={`Imatge de producte ${index + 1}`}
                                                            width={100}
                                                            height={100}
                                                            className="h-[100px] w-[100px] object-cover"
                                                        />
                                                        {index === 0 && (
                                                            <div className="absolute top-0 left-0 bg-[#36A9E1] text-white text-xs px-2 py-1 rounded-br-md">
                                                                Principal
                                                            </div>
                                                        )}
                                                        {index === 1 && (
                                                            <div className="absolute top-0 left-0 rounded-br-md bg-[#36A9E1] text-white text-xs px-2 py-1">
                                                                Secundària
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex justify-between bg-gray-50 p-1 gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMoveImageUp(index)}
                                                            disabled={index === 0}
                                                            className={`text-gray-500 p-1 cursor-pointer rounded hover:bg-gray-200 ${index === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                            title="Mou a l'esquerra"
                                                        >
                                                            <FiChevronRight className="transform rotate-180" size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveImage(index)}
                                                            className="text-red-500 p-1 cursor-pointer rounded hover:bg-gray-200"
                                                            title="Elimina imatge"
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMoveImageDown(index)}
                                                            disabled={index === productImages.length - 1}
                                                            className={`text-gray-500 p-1 rounded cursor-pointer hover:bg-gray-200 ${index === productImages.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                            title="Mou a la dreta"
                                                        >
                                                            <FiChevronRight size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddImage}
                                            disabled={isUploading || (selectedImages.length === 0 && !selectedImage && !formData.image)}
                                            className={`w-full my-2 px-4 py-2 cursor-pointer text-white text-sm rounded-md flex items-center justify-center gap-1 ${isUploading || (selectedImages.length === 0 && !selectedImage && !formData.image)
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-green-600 hover:bg-green-700'
                                                }`}
                                        >
                                            <FiChevronsUp size={16} />
                                            <span>Afegeix a la galeria</span>
                                        </button>
                                        {/* Use preview images array as preview below uploaded images */}
                                        {selectedImages && selectedImages.length > 0 ? (
                                            <div className="mt-2">
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">Previsualització d'imatges seleccionades</h4>
                                                <div className="flex overflow-x-auto p-1 space-x-4">
                                                    {selectedImages.map((img, index) => (
                                                        <div
                                                            key={index}
                                                            className="relative flex-shrink-0 border border-gray-200 rounded-md overflow-hidden ring-1 ring-gray-200"
                                                        >
                                                            <div className="relative">
                                                                <Image
                                                                    src={img || '/assets/images/product-placeholder.jpg'}
                                                                    alt={`Imatge seleccionada ${index + 1}`}
                                                                    width={500}
                                                                    height={500}
                                                                    className="h-28 w-28 object-cover"
                                                                />
                                                                {/* Distintiu per imatges noves o seleccionades */}
                                                                <div className="absolute -top-0.5 left-0">
                                                                    {img.startsWith('data:') ? (
                                                                        <span className="bg-[#36A9E1] text-white text-xs px-2 py-1 rounded-br-md">Nova</span>
                                                                    ) : (
                                                                        <span className="bg-[#36A9E1] text-white text-xs px-2 py-1 rounded-br-md">Existent</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-between bg-gray-50 p-1 gap-1">
                                                                <div className="w-6"></div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedImages(prev => prev.filter((_, i) => i !== index));
                                                                        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                                                                    }}
                                                                    className="text-red-500 p-1 cursor-pointer rounded hover:bg-gray-200"
                                                                    title="Elimina imatge seleccionada"
                                                                >
                                                                    <FiTrash2 size={16} />
                                                                </button>
                                                                <div className="w-6"></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mt-2 text-center text-gray-500">
                                                {/* <p>Cap imatge seleccionada</p> */}
                                            </div>
                                        )}
                                    </div>
                                    {/* Image Upload */}
                                    <div className="flex flex-col items-center space-y-4">
                                        <div className="w-full grid grid-row-2 gap-2">
                                            <div className='flex flex-row gap-2'>
                                                <label
                                                    htmlFor="productImage"
                                                    className={`block w-full px-4 py-2 text-center text-white text-sm rounded-md ${isUploading
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-[#36A9E1] hover:bg-[#008A9B] cursor-pointer'
                                                        }`}
                                                >
                                                    {isUploading ? 'Pujant...' : 'Selecciona imatges'}
                                                </label>
                                                <input
                                                    type="file"
                                                    id="productImage"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    disabled={isUploading}
                                                    className="hidden"
                                                    multiple
                                                />   <button
                                                    type="button"
                                                    onClick={() => setShowImageSelector(true)}
                                                    disabled={isUploading}
                                                    className={`w-full col-span-2 px-4 py-2 cursor-pointer text-white text-sm rounded-md ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#36A9E1] hover:bg-[#008A9B]'}`}
                                                >
                                                    Selecciona existent
                                                </button>
                                            </div>
                                        </div>
                                        {showImageSelector && (
                                            <ImageSelector
                                                onSelect={(url) => {
                                                    // Add the selected image directly to productImages
                                                    if (!productImages.includes(url)) {
                                                        setProductImages(prev => [...prev, url]);
                                                        toast.success('Imatge afegida a la galeria');
                                                    } else {
                                                        toast.warning('Aquesta imatge ja existeix a la galeria');
                                                    }
                                                    setShowImageSelector(false);
                                                }}
                                                onClose={() => setShowImageSelector(false)}
                                            />
                                        )}
                                        {/* Manual URL input */}
                                        <div className="w-full mt-4">
                                            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                                                URL d'imatge (opcional)
                                            </label>
                                            <div className="flex mt-1">
                                                <input
                                                    type="text"
                                                    id="image"
                                                    name="image"
                                                    value={formData.image}
                                                    onChange={handleChange}
                                                    className="block w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-[#36A9E1] focus:border-[#36A9E1]"
                                                    placeholder="https://exemple.com/imatge.jpg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (formData.image) {
                                                            setSelectedImages(prev => [...prev, formData.image]);
                                                            setFormData(f => ({ ...f, image: '' }));
                                                        }
                                                    }}
                                                    className="text-nowrap bg-[#36A9E1] cursor-pointer text-white px-3 py-2 border border-l-0 border-[#36A9E1] rounded-r-md hover:bg-[#008A9B]"
                                                >
                                                    Vista prèvia
                                                </button>
                                            </div>
                                            <p className="mt-1 text-xs text-gray-500">
                                                O enganxa la URL directament aquí
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-300 flex justify-end space-x-3 bg-gray-100 py-4 px-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel·la
                            </button>
                            <button
                                type="submit"
                                disabled={loading || isUploading}
                                className="px-4 py-2 bg-[#36A9E1] cursor-pointer text-white rounded-md text-sm font-medium hover:bg-[#008A9B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#36A9E1] disabled:opacity-50"
                            >
                                {loading ? 'Desant...' : isEditing ? 'Actualitza' : 'Crea'}
                            </button>
                        </div>
                    </form>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}
// Add these utility functions right after your state declarations
const isDiscountExpired = (discount) => {
    if (!discount?.active || !discount?.startDate || !discount?.endDate) return false;
    const endDate = new Date(discount.endDate);
    const startDate = new Date(discount.startDate);
    const now = new Date();
    // Check if the current time is after the end date
    return now > endDate && startDate < endDate;
};
const calculateFinalPrice = (basePrice, discount) => {
    // Check if discount has expired
    if (isDiscountExpired(discount)) {
        return basePrice;
    }
    if (!discount?.active || !basePrice || !discount?.value) {
        return basePrice;
    }
    if (discount.type === 'percentage') {
        return basePrice * (1 - discount.value / 100);
    } else {
        return Math.max(0, basePrice - discount.value);
    }
};