'use client';
import { useRef, useState, useEffect } from 'react';
// Translation object for Catalan and Spanish
const translations = {
    ca: {
        title: 'Editar Llista de Naixement',
        listTitle: 'Títol de la Llista',
        listTitlePlaceholder: 'Ex: Llista de Baby Shower per a Maria',
        babyName: 'Nom del Nadó',
        babyNamePlaceholder: 'Ex: Lucas o Nadó Garcia',
        dueDate: 'Data Prevista',
        description: 'Descripció',
        descriptionPlaceholder: 'Escriu un missatge o descripció per als teus convidats',
        productManagement: 'Gestió de Productes',
        currentProducts: 'Productes Actuals',
        addProducts: 'Afegir Productes',
        add: 'Afegir',
        addSelected: n => `Afegir ${n} producte(s)`,
        noProductsSelected: 'No hi ha productes seleccionats per afegir',
        cancel: 'Cancel·lar',
        saving: 'Desant...',
        save: 'Desar Canvis',
        imageTooLarge: 'La imatge no ha de superar els 5MB',
        notImage: 'El fitxer ha de ser una imatge',
        successAdd: n => `${n} producte(s) afegit(s) a la llista`,
        errorAdd: 'Error en afegir productes a la llista',
        errorFetch: 'Error en obtenir els productes actuals',
        errorUpdate: 'Error en actualitzar la llista',
        requiredFields: 'Si us plau, completa tots els camps obligatoris',
    },
    es: {
        title: 'Editar Lista de Nacimiento',
        listTitle: 'Título de la Lista',
        listTitlePlaceholder: 'Ej: Lista de Baby Shower para María',
        babyName: 'Nombre del Bebé',
        babyNamePlaceholder: 'Ej: Lucas o Bebé García',
        dueDate: 'Fecha Prevista',
        description: 'Descripción',
        descriptionPlaceholder: 'Escribe un mensaje o descripción para tus invitados',
        productManagement: 'Gestión de Productos',
        currentProducts: 'Productos Actuales',
        addProducts: 'Agregar Productos',
        add: 'Agregar',
        addSelected: n => `Agregar ${n} producto(s)`,
        noProductsSelected: 'No hay productos seleccionados para agregar',
        cancel: 'Cancelar',
        saving: 'Guardando...',
        save: 'Guardar Cambios',
        imageTooLarge: 'La imagen no debe superar los 5MB',
        notImage: 'El archivo debe ser una imagen',
        successAdd: n => `${n} producto(s) agregado(s) a la lista`,
        errorAdd: 'Error al agregar productos a la lista',
        errorFetch: 'Error al obtener los productos actuales',
        errorUpdate: 'Error al actualizar la lista',
        requiredFields: 'Por favor complete todos los campos obligatorios',
    }
};
function getLocale() {
    if (typeof window !== 'undefined') {
        const lang = window.navigator.language || 'es';
        return lang.startsWith('ca') ? 'ca' : 'es';
    }
    return 'es';
}
import { Dialog, DialogTitle } from '@headlessui/react';
import { FiX, FiEdit2, FiUpload, FiImage, FiTrash2 } from 'react-icons/fi';
import ListProductsManager from './ListProductsManager';
import AddProductToList from './AddProductToList';
// Helper to get product name in correct locale, with fallbacks
function getProductName(product, locale = 'es') {
    if (!product) return 'ND';
    if (typeof product.name === 'string') return product.name;
    if (product.name && typeof product.name === 'object') {
        return product.name[locale] || product.name.es || product.name.ca || product.name.name || 'ND';
    }
    return product.name || 'ND';
}
import { toast } from 'react-hot-toast';
export default function ListEditModal({
    showModal,
    setShowModal,
    selectedList,
    editForm,
    handleEditChange,
    handleUpdateList,
    loading,
    saveButtonRef
}) {
    const locale = getLocale();
    const t = translations[locale];
    const fileInputRef = useRef(null);
    const [imagePreview, setImagePreview] = useState('/assets/images/Screenshot_4.png');
    const [isDragging, setIsDragging] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [listProductsKey, setListProductsKey] = useState(0); // Force re-render of ListProductsManager
    const [resetSelection, setResetSelection] = useState(false);
    const [addBtnLoading, setAddBtnLoading] = useState(false);
    // Update image preview when the modal is opened with a new list
    useEffect(() => {
        if (selectedList?.image) {
            setImagePreview(selectedList.image);
        } else {
            setImagePreview('/assets/images/Screenshot_4.png');
        }
        // Reset selected products when modal opens/closes or list changes
        setSelectedProducts([]);
    }, [selectedList, showModal]);
    if (!showModal || !selectedList) return null;
    // Handle product selection from AddProductToList component
    // const handleProductSelect = (products) => {
    //     setSelectedProducts(products);
    // };    // Handle adding selected products to the list
    const handleAddProductsToList = async () => {
        if (selectedProducts.length === 0) {
            toast.error(t.noProductsSelected);
            return;
        }
        try {
            // Get current list items
            const currentListResponse = await fetch(`/api/birthlists/${selectedList.id}/items`);
            const currentListData = await currentListResponse.json();
            if (!currentListData.success) {
                throw new Error(t.errorFetch);
            }
            // Get current items
            const currentItems = currentListData.data || [];
            // Filter out items with missing products and log warning
            const validItems = currentItems.filter(item => {
                if (!item.product) {
                    console.warn('Missing product in birth list item:', item._id);
                    return false;
                }
                return true;
            });
            // Log warning if any items were filtered out
            if (validItems.length < currentItems.length) {
                console.warn(`${currentItems.length - validItems.length} items had missing product data in birth list ${selectedList.id}`);
            }
            // Prepare the new items array with proper handling of userData
            const newItems = [
                // Handle existing items - preserve their data including _id
                ...validItems.map(item => {
                    const cleanItem = {
                        _id: item._id,
                        product: item.product?._id || item.product,
                        quantity: item.quantity || 1,
                        state: item.state || 0,
                        reserved: item.reserved || 0,
                        userData: {} // Ensure userData is an empty object when creating or updating items
                    };
                    // Only include userData if it has actual data
                    if (item.userData && typeof item.userData === 'object' && Object.keys(item.userData).length > 0) {
                        cleanItem.userData = item.userData;
                    }
                    return cleanItem;
                }),
                // Handle new items with empty userData object
                ...selectedProducts.map(item => {
                    // Ensure we have a valid product id
                    const productId = item.product?._id || (typeof item.product === 'string' ? item.product : null);
                    if (!productId) {
                        console.warn('Missing product ID for item:', item);
                        return null;
                    }
                    return {
                        product: productId,
                        quantity: item.quantity || 1,
                        state: 0,
                        reserved: 0,
                        userData: {} // Set an empty object instead of null/undefined
                    };
                }).filter(Boolean) // Remove any null items
            ];
            // Update the list with all items
            const response = await fetch(`/api/birthlists/${selectedList.id}/items`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items: newItems
                })
            });
            const result = await response.json();
            if (result.success) {
                toast.success(t.successAdd(selectedProducts.length));
                setSelectedProducts([]); // Clear selected products
                setResetSelection(prev => !prev); // Toggle to trigger useEffect in AddProductToList
                setListProductsKey(prev => prev + 1); // Force refresh of ListProductsManager
            } else {
                throw new Error(result.message || t.errorAdd);
            }
        } catch (error) {
            console.error('Error adding products to list:', error);
            toast.error(t.errorAdd);
        }
    };
    // const handleImageUpload = (e) => {
    //     const file = e.target.files?.[0];
    //     if (!file) return;
    //     if (file.size > 5 * 1024 * 1024) {
    //         alert(t.imageTooLarge);
    //         return;
    //     }
    //     if (!file.type.startsWith('image/')) {
    //         alert(t.notImage);
    //         return;
    //     }
    //     // Create a preview URL
    //     const reader = new FileReader();
    //     reader.onload = () => {
    //         setImagePreview(reader.result);
    //     };
    //     reader.readAsDataURL(file);
    //     // Add to form data for submission
    //     const newEvent = {
    //         target: {
    //             name: 'image',
    //             value: file
    //         }
    //     };
    //     handleEditChange(newEvent);
    // };
    // const handleDragOver = (e) => {
    //     e.preventDefault();
    //     setIsDragging(true);
    // };
    // const handleDragLeave = (e) => {
    //     e.preventDefault();
    //     setIsDragging(false);
    // };
    // const handleDrop = (e) => {
    //     e.preventDefault();
    //     setIsDragging(false);
    //     const file = e.dataTransfer.files[0];
    //     if (!file) return;
    //     if (file.size > 5 * 1024 * 1024) {
    //         alert(t.imageTooLarge);
    //         return;
    //     }
    //     if (!file.type.startsWith('image/')) {
    //         alert(t.notImage);
    //         return;
    //     }
    //     // Create a preview URL
    //     const reader = new FileReader();
    //     reader.onload = () => {
    //         setImagePreview(reader.result);
    //     };
    //     reader.readAsDataURL(file);
    //     // Add to form data for submission
    //     const newEvent = {
    //         target: {
    //             name: 'image',
    //             value: file
    //         }
    //     };
    //     handleEditChange(newEvent);
    // };
    // const handleRemoveImage = () => {
    //     setImagePreview('/assets/images/Screenshot_4.png');
    //     const newEvent = {
    //         target: {
    //             name: 'image',
    //             value: '/assets/images/Screenshot_4.png'
    //         }
    //     };
    //     handleEditChange(newEvent);
    // };


    return (
        <Dialog open={showModal} onClose={() => setShowModal(false)} className="relative z-[100]">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            {/* Modal Container */}
            <div className="fixed inset-0 flex items-center justify-center p-1 md:p-4">
                <Dialog.Panel className="w-full max-w-full h-full bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 px-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                        <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center">
                            <FiEdit2 className="mr-3 text-[#36A9E1]" />
                            {t.title}
                        </DialogTitle>
                        <button
                            onClick={() => setShowModal(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                        >
                            <FiX className="h-6 w-6" />
                        </button>
                    </div>
                    {/* Content - Scrollable */}
                    <div className="flex-1 overflow-y-auto">
                        <form onSubmit={(e) => e.preventDefault()} className="p-2 md:p-6" onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                            }
                        }}>
                            {/* Basic Information Section */}
                            <div className="mb-4">
                                <div className='grid grid-cols-1 md:grid-cols-2 md:gap-6 '>
                                    {/* Form Fields Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 md:gap-6 gap-2 ">
                                        {/* Title */}
                                        <div className="md:space-y-2">
                                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                                {t.listTitle} <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="title"
                                                name="title"
                                                value={editForm.title}
                                                onChange={handleEditChange}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#36A9E1] focus:border-[#36A9E1] transition-colors"
                                                placeholder={t.listTitlePlaceholder}
                                                required
                                            />
                                        </div>
                                        {/* Baby Name */}
                                        <div className="md:space-y-2">
                                            <label htmlFor="babyName" className="block text-sm font-medium text-gray-700">
                                                {t.babyName} <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="babyName"
                                                name="babyName"
                                                value={editForm.babyName}
                                                onChange={handleEditChange}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#36A9E1] focus:border-[#36A9E1] transition-colors"
                                                placeholder={t.babyNamePlaceholder}
                                                required
                                            />
                                        </div>
                                        {/* Due Date */}
                                        <div className="md:space-y-2">
                                            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                                                {t.dueDate} <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                id="dueDate"
                                                name="dueDate"
                                                value={editForm.dueDate}
                                                onChange={handleEditChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#36A9E1] focus:border-[#36A9E1] transition-colors"
                                                required
                                            />
                                        </div>
                                    </div>
                                    {/* Description */}
                                    <div className="md:space-y-2 mt-2 md:mt-0">
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                            {t.description}
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={editForm.description}
                                            onChange={handleEditChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#36A9E1] focus:border-[#36A9E1] transition-colors resize-y"
                                            placeholder={t.descriptionPlaceholder}
                                            rows={1}
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* Products Section */}
                            <div className="border-t border-gray-200 pt-2">
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-800 md:mb-4 flex items-center">
                                        <FiImage className="mr-2 text-[#36A9E1]" />
                                        {t.productManagement}
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                                    {/* <div className="md:hidden block bg-gray-50 md:p-4 rounded-lg min-h-[300px]">
                                        <AddProductToList
                                            selectedProducts={selectedProducts.map(item => ({
                                                ...item,
                                                // Always resolve product name to string for AddProductToList
                                                product: {
                                                    ...item.product,
                                                    name: getProductName(item.product, locale)
                                                }
                                            }))}
                                            onProductSelect={products => {
                                                // When receiving products, ensure name is always string
                                                setSelectedProducts(products.map(item => ({
                                                    ...item,
                                                    product: {
                                                        ...item.product,
                                                        name: getProductName(item.product, locale)
                                                    }
                                                })));
                                            }}
                                            resetSelection={resetSelection}
                                            // Pass a prop to enforce case-insensitive search
                                            caseInsensitiveSearch={true}
                                        />
                                    </div> */}
                                    {/* Current Products */}
                                    <div className="space-y-4 ">
                                        <h4 className="hidden md:block text-md font-medium text-gray-700 border-b border-gray-200 pb-2">
                                            {t.currentProducts}
                                        </h4>
                                        <div className="bg-gray-50 p-0 md:p-4 rounded-lg min-h-[300px]">
                                            <ListProductsManager
                                                key={listProductsKey} // Force re-render when products are added
                                                listId={selectedList.id}
                                                onUpdate={null}
                                            />
                                        </div>
                                    </div>
                                    {/* Add New Products */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between md:border-b md:border-gray-200 pb-2">
                                            <h4 className="hidden md:block text-md font-medium text-gray-700">
                                                {t.addProducts}
                                            </h4>
                                            {selectedProducts.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        if (addBtnLoading) return;
                                                        setAddBtnLoading(true);
                                                        await handleAddProductsToList();
                                                        setTimeout(() => setAddBtnLoading(false), 2000);
                                                    }}
                                                    className={`px-3 py-2 md:py-1 bg-[#36A9E1] w-[100%] md:w-auto text-white text-lg md:text-sm rounded-md hover:bg-[#008da0] transition-colors flex items-center justify-center ${addBtnLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                    disabled={addBtnLoading}
                                                >
                                                    {addBtnLoading ? (
                                                        <svg className="animate-spin h-4 w-4 mr-2 select-none text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                                        </svg>
                                                    ) : null}
                                                    {t.addSelected(selectedProducts.length)}
                                                </button>
                                            )}
                                        </div>
                                        
                                        <div className="bg-gray-50 md:p-4 rounded-lg min-h-[300px]">
                                            <AddProductToList
                                                selectedProducts={selectedProducts.map(item => ({
                                                    ...item,
                                                    // Always resolve product name to string for AddProductToList
                                                    product: {
                                                        ...item.product,
                                                        name: getProductName(item.product, locale)
                                                    }
                                                }))}
                                                onProductSelect={products => {
                                                    // When receiving products, ensure name is always string
                                                    setSelectedProducts(products.map(item => ({
                                                        ...item,
                                                        product: {
                                                            ...item.product,
                                                            name: getProductName(item.product, locale)
                                                        }
                                                    })));
                                                }}
                                                resetSelection={resetSelection}
                                                // Pass a prop to enforce case-insensitive search
                                                caseInsensitiveSearch={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    {/* Footer - Fixed */}
                    <div className="border-t border-gray-200 p-6 bg-white flex-shrink-0">
                        <div className="flex justify-center md:justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors"
                            >
                                {t.cancel}
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                ref={saveButtonRef}
                                onClick={handleUpdateList}
                                className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#36A9E1] hover:bg-[#008da0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#36A9E1] transition-colors ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {loading ? t.saving : t.save}
                            </button>
                        </div>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}