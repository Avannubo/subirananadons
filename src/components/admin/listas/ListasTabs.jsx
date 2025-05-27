'use client';
import { useState, useEffect, useRef } from 'react';
import ListasTable from '@/components/admin/listas/ListasTable';
import { toast } from 'react-hot-toast';
import { FiX, FiPlus, FiRefreshCw, FiSearch, FiFilter } from 'react-icons/fi';
import { useSession } from 'next-auth/react';
import { fetchBirthLists, createBirthList, formatBirthList } from '@/services/BirthListService';
import ProductSelection from '@/components/admin/listas/ProductSelection';
import TabNavigation from '@/components/admin/shared/TabNavigation';
export default function ListasTabs({ userRole = 'user' }) {
    const [activeTab, setActiveTab] = useState('Todos'); const [filters, setFilters] = useState({
        searchId: '',
        searchReference: '',
        searchName: '',
        searchCreator: '',
        searchProduct: '',
        dateFrom: '',
        dateTo: ''
    });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const modalRef = useRef(null);
    const { data: session } = useSession();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        babyName: '',
        dueDate: '',
        isPublic: true,
        items: []
    });
    // Determine which lists to show based on user role
    // Admin sees all lists, regular users only see their own
    const [displayLists, setDisplayLists] = useState([]);
    // Fetch birth lists from API
    const loadBirthLists = async () => {
        try {
            setIsLoading(true);
            const result = await fetchBirthLists();
            if (result.success) {
                // Transform data for display using the format function
                const formattedLists = result.data.map(list => formatBirthList(list));
                // Sort by MongoDB _id to maintain a stable order
                // MongoDB ObjectIDs have a timestamp component that's tied to creation time
                // This ensures lists stay in the same position even after edits
                formattedLists.sort((a, b) => {
                    // Sort by _id which is tied to creation time and immutable
                    return a.id > b.id ? -1 : 1;
                });
                setDisplayLists(formattedLists);
            } else {
                toast.error('Error al cargar las listas');
            }
        } catch (error) {
            console.error('Error fetching birth lists:', error);
            toast.error('Error al cargar las listas');
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        // Fetch lists from API
        loadBirthLists();
    }, [userRole]);
    const tabs = ['Todos', 'Activas', 'Completadas', 'Canceladas'];
    const filteredLists = displayLists.filter((list) => {
        if (activeTab === 'Todos') return true;
        if (activeTab === 'Activas') return list.status === 'Activa';
        if (activeTab === 'Completadas') return list.status === 'Completada';
        if (activeTab === 'Canceladas') return list.status === 'Cancelada';
        return false;
    });
    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };
    // Refresh data
    const refreshData = async () => {
        await loadBirthLists();
        toast.success('Datos actualizados correctamente');
    };
    // Handle modal form input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    // Handle next step
    const handleNextStep = (e) => {
        e.preventDefault();
        // Validate current step
        if (currentStep === 1) {
            if (!formData.title || !formData.babyName || !formData.dueDate) {
                toast.error('Por favor complete todos los campos obligatorios');
                return;
            }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            // Here you would validate product selections if needed
            setCurrentStep(3);
        }
    };
    // Handle previous step
    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };
    // Handle form submission (final step)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.babyName || !formData.dueDate) {
            toast.error('Por favor complete todos los campos obligatorios');
            return;
        }
        try {
            setLoading(true);
            // Prepare items array - transform products to match API format
            const formattedItems = formData.items.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                reserved: item.reserved || 0,
                priority: item.priority || 2
            }));
            // Create the birth list in the database
            const birthListData = {
                user: session?.user?.id, // User ID from the session
                title: formData.title,
                description: formData.description || '',
                babyName: formData.babyName,
                dueDate: new Date(formData.dueDate),
                isPublic: formData.isPublic,
                items: formattedItems, // Use formatted items array
                theme: 'default', // Default theme
                status: 'Activa' // Active status
            };
            // Create the birth list using the service
            const result = await createBirthList(birthListData);
            if (result.success) {
                // Refresh the list of birth lists
                await loadBirthLists();
                toast.success('Lista de nacimiento creada con éxito');
                // Reset form and close modal
                setFormData({
                    title: '',
                    description: '',
                    babyName: '',
                    dueDate: '',
                    isPublic: true,
                    items: []
                });
                setShowCreateModal(false);
                setCurrentStep(1);
            } else {
                toast.error('Error al crear la lista de nacimiento: ' + result.message);
            }
        } catch (error) {
            console.error('Error creating birth list:', error);
            toast.error('Error al crear la lista de nacimiento: ' + (error.message || 'Error desconocido'));
        } finally {
            setLoading(false);
        }
    };
    // Close modal if clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setShowCreateModal(false);
            }
        };
        if (showCreateModal) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showCreateModal]);
    return (
        <>
            <TabNavigation
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                counts={{
                    'Todos': displayLists.length,
                    'Activas': displayLists.filter(list => list.status === 'Activa').length,
                    'Completadas': displayLists.filter(list => list.status === 'Completada').length,
                    'Canceladas': displayLists.filter(list => list.status === 'Cancelada').length
                }}
            />
            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center">
                        <h2 className="text-lg font-medium">Gestión de Listas de Regalos ({displayLists.length})</h2>
                        <button
                            className="ml-2 text-gray-500 hover:text-gray-700 h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                            onClick={refreshData}
                            disabled={isLoading}
                            title="Actualizar datos"
                        >
                            <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => {
                                setShowCreateModal(true);
                                setCurrentStep(1);
                            }}
                            className="flex items-center px-3 py-2 bg-[#00B0C8] text-white rounded text-sm hover:bg-[#00B0C890] transition-colors"
                        >
                            <FiPlus className="mr-1" /> Nueva Lista
                        </button>
                    </div>
                </div>
                {/* Search and Filters */}
                <div className="p-4 border-b border-gray-200 grid md:grid-cols-4 gap-4">
                    <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">

                        <div className="relative">
                            <FiSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar Referencia"
                                name="searchReference"
                                value={filters.searchReference}
                                onChange={handleFilterChange}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                            />
                        </div>
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar Nombre"
                                name="searchName"
                                value={filters.searchName}
                                onChange={handleFilterChange}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                            />
                        </div>
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar Creador"
                                name="searchCreator"
                                value={filters.searchCreator}
                                onChange={handleFilterChange}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                            />
                        </div>
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por producto"
                                name="searchProduct"
                                value={filters.searchProduct}
                                onChange={handleFilterChange}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                            />
                        </div>
                    </div>
                    {/* <div className="flex sm:flex-row flex-col justify-start gap-2">
                        <button
                            className="flex items-center justify-center px-4 py-2 bg-[#00B0C8] text-white rounded hover:bg-[#00B0C890]"
                            onClick={applyFilters}
                            title="Aplicar filtros"
                        >
                            <FiFilter className="mr-2" />
                            Filtrar
                        </button>
                        <button
                            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                            onClick={clearFilters}
                            title="Limpiar filtros"
                        >
                            Limpiar
                        </button>
                    </div> */}
                </div>
                {/* Loading Indicator */}
                {isLoading ? (
                    <div className="py-20 text-center">
                        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-t-2 border-[#00B0C8]"></div>
                        <p className="mt-3 text-gray-600">Cargando listas...</p>
                    </div>
                ) : (
                    /* Lists Table - Only show if not loading */
                    <div>
                        <ListasTable
                            lists={filteredLists}
                            filters={filters}
                            setFilters={setFilters}
                            userRole={userRole}
                            onUpdate={loadBirthLists}
                        />
                    </div>
                )}
            </div>
            
            {/* Create List Modal - kept as is */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-[#00000050] bg-opacity-50 flex items-center justify-center p-4">
                    <div
                        ref={modalRef}
                        className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Crear Nueva Lista de Nacimiento</h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <FiX size={24} />
                                </button>
                            </div>
                            {/* Step Indicator */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center">
                                            <div className={`flex items-center justify-center w-8 h-8 ${currentStep === 1 ? 'bg-[#00B0C8] text-white' : 'bg-[#00B0C8] text-white'} rounded-full font-bold`}>
                                                1
                                            </div>
                                            <div className={`ml-2 ${currentStep === 1 ? 'text-[#00B0C8]' : 'text-[#00B0C8]'} font-medium`}>Información Básica</div>
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex flex-1">
                                        <div className="flex items-center">
                                            <div className={`h-1 flex-1 ${currentStep >= 2 ? 'bg-[#00B0C8]' : 'bg-gray-200'}`}></div>
                                            <div className={`flex items-center justify-center w-8 h-8 ${currentStep >= 2 ? 'bg-[#00B0C8] text-white' : 'bg-gray-200 text-gray-500'} rounded-full font-bold ml-2`}>
                                                2
                                            </div>
                                            <div className={`ml-2 ${currentStep >= 2 ? 'text-[#00B0C8]' : 'text-gray-500'} font-medium`}>Añadir Productos</div>
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex flex-1">
                                        <div className="flex items-center">
                                            <div className={`h-1 flex-1 ${currentStep >= 3 ? 'bg-[#00B0C8]' : 'bg-gray-200'}`}></div>
                                            <div className={`flex items-center justify-center w-8 h-8 ${currentStep >= 3 ? 'bg-[#00B0C8] text-white' : 'bg-gray-200 text-gray-500'} rounded-full font-bold ml-2`}>
                                                3
                                            </div>
                                            <div className={`ml-2 ${currentStep >= 3 ? 'text-[#00B0C8]' : 'text-gray-500'} font-medium`}>Compartir</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Step 1: Basic Information */}
                            {currentStep === 1 && (
                                <form onSubmit={handleNextStep} className="space-y-6">
                                    {/* Title */}
                                    <div>
                                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                            Título de la Lista <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="title"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                                            placeholder="Ej: Lista de Baby Shower para María"
                                            required
                                        />
                                    </div>
                                    {/* Baby Name */}
                                    <div>
                                        <label htmlFor="babyName" className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombre del Bebé <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="babyName"
                                            name="babyName"
                                            value={formData.babyName}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                                            placeholder="Ej: Lucas o Bebé García (si aún no tiene nombre)"
                                            required
                                        />
                                    </div>
                                    {/* Description */}
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                            Descripción
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                                            placeholder="Escribe un mensaje o descripción para tus invitados"
                                            rows={4}
                                        />
                                    </div>
                                    {/* Due Date */}
                                    <div>
                                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                                            Fecha Prevista <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            id="dueDate"
                                            name="dueDate"
                                            value={formData.dueDate}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                                            required
                                        />
                                    </div>
                                    {/* Privacy */}
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="isPublic"
                                            name="isPublic"
                                            checked={formData.isPublic}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-[#00B0C8] focus:ring-[#00B0C8] border-gray-300 rounded"
                                        />
                                        <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                                            Lista Pública (Visible para cualquier persona con el enlace)
                                        </label>
                                    </div>
                                    <div className="flex justify-end space-x-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateModal(false)}
                                            className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00B0C8] hover:bg-[#008da0] focus:outline-none"
                                        >
                                            Continuar
                                        </button>
                                    </div>
                                </form>
                            )}
                            {/* Step 2: Add Products */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Añadir Productos a tu Lista</h3>
                                        <p className="text-gray-600">
                                            Selecciona los productos que necesitas para tu bebé. Puedes añadir más productos después de crear la lista.
                                        </p>
                                        <ProductSelection
                                            selectedProducts={formData.items}
                                            onProductSelect={(selectedProducts) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    items: selectedProducts
                                                }));
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between space-x-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={handlePrevStep}
                                            className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                        >
                                            Anterior
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleNextStep}
                                            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00B0C8] hover:bg-[#008da0] focus:outline-none"
                                        >
                                            Continuar
                                        </button>
                                    </div>
                                </div>
                            )}
                            {/* Step 3: Share */}
                            {currentStep === 3 && (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Compartir tu Lista</h3>
                                        <p className="text-gray-600 mb-4">
                                            Tu lista estará disponible para compartir después de crearla. Podrás enviar el enlace a familiares y amigos.
                                        </p>
                                        <div className="text-center p-4">
                                            <svg className="w-20 h-20 mx-auto text-[#00B0C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                            </svg>
                                            <p className="mt-4 text-gray-600">
                                                Después de crear la lista, podrás compartirla por correo electrónico, WhatsApp o copiar el enlace directo.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between space-x-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={handlePrevStep}
                                            className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                        >
                                            Anterior
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00B0C8] hover:bg-[#008da0] focus:outline-none ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                                        >
                                            {loading ? 'Creando...' : 'Crear Lista'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
} 