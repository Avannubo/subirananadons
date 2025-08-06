
'use client';
import { useState, useEffect, useRef } from 'react';
import ListasTable from '@/components/admin/listas/ListasTable';
import { toast } from 'react-hot-toast';
import { FiX, FiPlus, FiRefreshCw, FiSearch, FiFilter } from 'react-icons/fi';
import { useSession } from 'next-auth/react';
import { fetchBirthLists, createBirthList, formatBirthList } from '@/services/BirthListService';
import ProductSelection from '@/components/admin/listas/ProductSelection';
import TabNavigation from '@/components/admin/shared/TabNavigation';
// Translation object for Catalan and Spanish
const translations = {
    ca: {
        tabs: ['Totes', 'Actives', 'Completades', 'Inactives'],
        heading: 'Gestió de Llistes de Regals',
        update: 'Actualitzar dades',
        newList: 'Nova Llista',
        searchReference: 'Cercar Referència',
        searchName: 'Cercar Nom',
        searchCreator: 'Cercar Creador',
        searchProduct: 'Cercar per producte',
        loading: 'Carregant llistes...',
        createTitle: 'Crear Nova Llista de Naixement',
        step1: 'Informació Bàsica',
        step2: 'Afegir Productes',
        step3: 'Compartir',
        titleLabel: 'Títol de la Llista',
        titlePlaceholder: 'Ex: Llista de Baby Shower per a Maria',
        babyNameLabel: 'Nom del Nadó',
        babyNamePlaceholder: 'Ex: Lucas o Nadó Garcia (si encara no té nom)',
        descriptionLabel: 'Descripció',
        descriptionPlaceholder: 'Escriu un missatge o descripció per als teus convidats',
        dueDateLabel: 'Data Prevista',
        cancel: 'Cancel·lar',
        continue: 'Continuar',
        addProductsTitle: 'Afegir Productes a la teva Llista',
        addProductsDesc: 'Selecciona els productes que necessites per al teu nadó. Pots afegir més productes després de crear la llista.',
        previous: 'Anterior',
        shareTitle: 'Compartir la teva Llista',
        shareDesc: 'La teva llista estarà disponible per compartir després de crear-la. Podràs enviar l’enllaç a familiars i amics.',
        shareHelp: 'Després de crear la llista, podràs compartir-la per correu electrònic, WhatsApp o copiar l’enllaç directe.',
        termsTitle: 'Condicions d’ús de les llistes de naixement i regal:',
        terms: [
            'La llista que creïs podrà ser compartida amb altres persones mitjançant un enllaç.',
            'Els productes i dades de la llista seran visibles per a qui rebi l’enllaç.',
            'Pots modificar o eliminar la teva llista en qualsevol moment des del teu compte.',
            'La gestió de reserves i compres de productes depèn de la participació dels teus convidats.',
            'Has de respectar les normes d’ús i la privacitat de les dades segons la legislació vigent.'
        ],
        termsNote: 'Si us plau, llegeix atentament aquestes condicions abans de continuar.',
        acceptTerms: 'Confirmo que he llegit i accepto les condicions d’ús de les llistes, els',
        termsLink: 'Termes i Condicions',
        privacyLink: 'Política de Privacitat',
        creating: 'Creant...',
        createList: 'Crear Llista',
        successLoad: 'Dades actualitzades correctament',
        errorLoad: 'Error en carregar les llistes',
        errorCreate: 'Error en crear la llista de naixement',
        successCreate: 'Llista de naixement creada amb èxit',
        requiredFields: 'Si us plau, completa tots els camps obligatoris',
    },
    es: {
        tabs: ['Todos', 'Activas', 'Completadas', 'InActivas'],
        heading: 'Gestión de Listas de Regalos',
        update: 'Actualizar datos',
        newList: 'Nueva Lista',
        searchReference: 'Buscar Referencia',
        searchName: 'Buscar Nombre',
        searchCreator: 'Buscar Creador',
        searchProduct: 'Buscar por producto',
        loading: 'Cargando listas...',
        createTitle: 'Crear Nueva Lista de Nacimiento',
        step1: 'Información Básica',
        step2: 'Añadir Productos',
        step3: 'Compartir',
        titleLabel: 'Título de la Lista',
        titlePlaceholder: 'Ej: Lista de Baby Shower para María',
        babyNameLabel: 'Nombre del Bebé',
        babyNamePlaceholder: 'Ej: Lucas o Bebé García (si aún no tiene nombre)',
        descriptionLabel: 'Descripción',
        descriptionPlaceholder: 'Escribe un mensaje o descripción para tus invitados',
        dueDateLabel: 'Fecha Prevista',
        cancel: 'Cancelar',
        continue: 'Continuar',
        addProductsTitle: 'Añadir Productos a tu Lista',
        addProductsDesc: 'Selecciona los productos que necesitas para tu bebé. Puedes añadir más productos después de crear la lista.',
        previous: 'Anterior',
        shareTitle: 'Compartir tu Lista',
        shareDesc: 'Tu lista estará disponible para compartir después de crearla. Podrás enviar el enlace a familiares y amigos.',
        shareHelp: 'Después de crear la lista, podrás compartirla por correo electrónico, WhatsApp o copiar el enlace directo.',
        termsTitle: 'Condiciones de uso de las listas de nacimiento y regalo:',
        terms: [
            'La lista que crees podrá ser compartida con otras personas mediante un enlace.',
            'Los productos y datos de la lista serán visibles para quienes reciban el enlace.',
            'Puedes modificar o eliminar tu lista en cualquier momento desde tu cuenta.',
            'La gestión de reservas y compras de productos depende de la participación de tus invitados.',
            'Debes respetar las normas de uso y la privacidad de los datos según la legislación vigente.'
        ],
        termsNote: 'Por favor, lee atentamente estas condiciones antes de continuar.',
        acceptTerms: 'Confirmo que he leído y acepto las condiciones de uso de las listas, los',
        termsLink: 'Términos y Condiciones',
        privacyLink: 'Política de Privacidad',
        creating: 'Creando...',
        createList: 'Crear Lista',
        successLoad: 'Datos actualizados correctamente',
        errorLoad: 'Error al cargar las listas',
        errorCreate: 'Error al crear la lista de nacimiento',
        successCreate: 'Lista de nacimiento creada con éxito',
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

export default function ListasTabs({ userRole = 'user' }) {
    const locale = getLocale();
    const t = translations[locale];
    const [activeTab, setActiveTab] = useState(t.tabs[0]);
    const [filters, setFilters] = useState({
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
        userId: '',
        userEmail: '',
        userName: '',
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
    // For admin: users dropdown
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);

    // Fetch users for admin dropdown
    useEffect(() => {
        if (userRole === 'admin' && showCreateModal) {
            setUsersLoading(true);
            fetch('/api/clients?limit=1000')
                .then(res => res.json())
                .then(data => {
                    // API returns data.clients
                    if (data.success) setUsers(data.clients || []);
                })
                .catch(() => setUsers([]))
                .finally(() => setUsersLoading(false));
        }
    }, [userRole, showCreateModal]);

    const [selectedUser, setSelectedUser] = useState(null);
    const handleUserSelect = (e) => {
        const userId = e.target.value;

        // Extract email from the string in format "Name (email)"
        const emailMatch = userId.match(/\(([^)]+)\)/); // Matches content between parentheses
        const extractedEmail = emailMatch ? emailMatch[1] : '';

        const selectedUser = users.find(u => u.email === extractedEmail);
        console.log("Selected User:", selectedUser);
        setSelectedUser(selectedUser);
        setFormData(prev => ({
            ...prev,
            userId,
            userEmail: selectedUser ? selectedUser.email : extractedEmail,
            userName: selectedUser ? selectedUser.name : userId.split('(')[0].trim(),
        }));
    };




    useEffect(() => {
        // Fetch lists from API
        loadBirthLists();
    }, [userRole]);
    const tabs = t.tabs;
    const filteredLists = displayLists.filter((list) => {
        if (activeTab === t.tabs[0]) return true;
        if (activeTab === t.tabs[1]) return list.status === (locale === 'ca' ? 'Activa' : 'Activa');
        if (activeTab === t.tabs[2]) return list.status === (locale === 'ca' ? 'Completada' : 'Completada');
        if (activeTab === t.tabs[3]) return list.status === (locale === 'ca' ? 'Inactiva' : 'InActiva');
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
    // Helper: Get the currently selected user object (admin only)
    const getSelectedUser = () => {
        if (userRole !== 'admin' || !formData.userId) return null;
        return users.find(u => u._id === formData.userId) || null;
    };

    // Refresh data
    const refreshData = async () => {
        await loadBirthLists();
        toast.success(t.successLoad);
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
                toast.error(t.requiredFields);
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
            toast.error(t.requiredFields);
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
            // Always use selected user as creator if admin
            let creatorId = session?.user?.id;
            let creatorEmail = session?.user?.email;
            let creatorName = session?.user?.name;
            if (userRole === 'admin' && selectedUser) {
                creatorId = selectedUser._id;
                creatorEmail = selectedUser.email;
                creatorName = selectedUser.name;
            }
            const birthListData = {
                user: selectedUser,
                userEmail: creatorEmail,
                userName: creatorName,
                title: formData.title,
                description: formData.description || '',
                babyName: formData.babyName,
                dueDate: new Date(formData.dueDate),
                isPublic: formData.isPublic,
                items: formattedItems, // Use formatted items array
                theme: 'default', // Default theme
                status: 'Activa' // Active status
            };
            // console.log('Creating birth list with data:', JSON.stringify(birthListData, null, 2));
            const result = await createBirthList(birthListData);
            if (result.success) {
                await loadBirthLists();
                toast.success(t.successCreate);
                setFormData({
                    title: '',
                    userId: '',
                    userEmail: '',
                    userName: '',
                    description: '',
                    babyName: '',
                    dueDate: '',
                    isPublic: true,
                    items: []
                });
                setShowCreateModal(false);
                setCurrentStep(1);
            } else {
                toast.error(t.errorCreate + ': ' + result.message);
            }
        } catch (error) {
            console.error('Error creating birth list:', error);
            toast.error(t.errorCreate + ': ' + (error.message || 'Error desconegut'));
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
                    [t.tabs[0]]: displayLists.length,
                    [t.tabs[1]]: displayLists.filter(list => list.status === (locale === 'ca' ? 'Activa' : 'Activa')).length,
                    [t.tabs[2]]: displayLists.filter(list => list.status === (locale === 'ca' ? 'Completada' : 'Completada')).length,
                    [t.tabs[3]]: displayLists.filter(list => list.status === (locale === 'ca' ? 'Inactiva' : 'InActiva')).length
                }}
            />
            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center">
                        <h2 className="text-lg font-medium">{t.heading} ({displayLists.length})</h2>
                        <button
                            className="ml-2 text-gray-500 cursor-pointer hover:text-gray-700 h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                            onClick={refreshData}
                            disabled={isLoading}
                            title={t.update}
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
                            className="flex items-center px-3 py-2 cursor-pointer bg-[#00B0C8] text-white rounded text-sm hover:bg-[#00B0C890] transition-colors"
                        >
                            <FiPlus className="mr-1" /> {t.newList}
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
                                placeholder={t.searchReference}
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
                                placeholder={t.searchName}
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
                                placeholder={t.searchCreator}
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
                                placeholder={t.searchProduct}
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
                        <p className="mt-3 text-gray-600">{t.loading}</p>
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
                                <h2 className="text-2xl font-bold text-gray-800">{t.createTitle}</h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="text-gray-500 hover:text-gray-700 cursor-pointer"
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
                                            <div className={`ml-2 ${currentStep === 1 ? 'text-[#00B0C8]' : 'text-[#00B0C8]'} font-medium`}>{t.step1}</div>
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex flex-1">
                                        <div className="flex items-center">
                                            <div className={`h-1 flex-1 ${currentStep >= 2 ? 'bg-[#00B0C8]' : 'bg-gray-200'}`}></div>
                                            <div className={`flex items-center justify-center w-8 h-8 ${currentStep >= 2 ? 'bg-[#00B0C8] text-white' : 'bg-gray-200 text-gray-500'} rounded-full font-bold ml-2`}>
                                                2
                                            </div>
                                            <div className={`ml-2 ${currentStep >= 2 ? 'text-[#00B0C8]' : 'text-gray-500'} font-medium`}>{t.step2}</div>
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex flex-1">
                                        <div className="flex items-center">
                                            <div className={`h-1 flex-1 ${currentStep >= 3 ? 'bg-[#00B0C8]' : 'bg-gray-200'}`}></div>
                                            <div className={`flex items-center justify-center w-8 h-8 ${currentStep >= 3 ? 'bg-[#00B0C8] text-white' : 'bg-gray-200 text-gray-500'} rounded-full font-bold ml-2`}>
                                                3
                                            </div>
                                            <div className={`ml-2 ${currentStep >= 3 ? 'text-[#00B0C8]' : 'text-gray-500'} font-medium`}>{t.step3}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Step 1: Basic Information */}
                            {currentStep === 1 && (
                                <form onSubmit={handleNextStep} className="space-y-6">
                                    {/* Admin: Select user for the list */}
                                    {userRole === 'admin' && (
                                        <div>
                                            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                                                Selecciona un usuario para la lista
                                            </label>
                                            <select
                                                id="userId"
                                                name="userId"
                                                value={formData.userId}
                                                onChange={handleUserSelect}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                                                required
                                                disabled={usersLoading}
                                            >
                                                <option value="">{usersLoading ? 'Cargando usuarios...' : 'Selecciona un usuario'}</option>
                                                {users.map(user => (
                                                    <option key={user._id || user.email} value={user._id}>
                                                        {user.name} ({user.email})
                                                    </option>
                                                ))}
                                            </select>
                                            {/* Show selected user email */}
                                            {/* {formData.userEmail && (
                                                <div className="text-xs text-gray-500 mt-1">Email: {formData.userEmail}</div>
                                            )} */}
                                        </div>
                                    )}
                                    {/* Title */}
                                    <div>
                                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                            {t.titleLabel} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="title"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                                            placeholder={t.titlePlaceholder}
                                            required
                                        />
                                    </div>
                                    {/* Baby Name */}
                                    <div>
                                        <label htmlFor="babyName" className="block text-sm font-medium text-gray-700 mb-1">
                                            {t.babyNameLabel} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="babyName"
                                            name="babyName"
                                            value={formData.babyName}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                                            placeholder={t.babyNamePlaceholder}
                                            required
                                        />
                                    </div>
                                    {/* Description */}
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                            {t.descriptionLabel}
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                                            placeholder={t.descriptionPlaceholder}
                                            rows={4}
                                        />
                                    </div>
                                    {/* Due Date */}
                                    <div>
                                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                                            {t.dueDateLabel} <span className="text-red-500">*</span>
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
                                    {/* <div className="flex items-center">
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
                                    </div> */}
                                    <div className="flex justify-end space-x-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateModal(false)}
                                            className="px-6 py-2 cursor-pointer border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                        >
                                            {t.cancel}
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2 cursor-pointer border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00B0C8] hover:bg-[#008da0] focus:outline-none"
                                        >
                                            {t.continue}
                                        </button>
                                    </div>
                                </form>
                            )}
                            {/* Step 2: Add Products */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">{t.addProductsTitle}</h3>
                                        <p className="text-gray-600">
                                            {t.addProductsDesc}
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
                                            className="px-6 py-2 border cursor-pointer border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                        >
                                            {t.previous}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleNextStep}
                                            className="px-6 py-2 cursor-pointer border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00B0C8] hover:bg-[#008da0] focus:outline-none"
                                        >
                                            {t.continue}
                                        </button>
                                    </div>
                                </div>
                            )}
                            {/* Step 3: Share */}
                            {currentStep === 3 && (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">{t.shareTitle}</h3>
                                        <p className="text-gray-600 ">
                                            {t.shareDesc}
                                        </p>
                                        <div className="text-start ">

                                            <p className="mt-4 text-gray-600">
                                                {t.shareHelp}
                                            </p>
                                            {/* <svg className="w-20 h-20 mx-auto text-[#00B0C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                            </svg> */}
                                        </div>
                                    </div>
                                    {/* Terms and Conditions Checkbox */}
                                    <div className="bg-white p-4 rounded shadow border border-gray-100">
                                        <div className="mb-2">
                                            <strong className="block text-gray-800 mb-1">{t.termsTitle}</strong>
                                            <ul className="list-disc pl-5 text-sm text-gray-700 mb-2">
                                                {t.terms.map((item, idx) => <li key={idx}>{item}</li>)}
                                            </ul>
                                            <span className="text-xs text-gray-500">{t.termsNote}</span>
                                        </div>
                                        <div className="flex items-start mt-2">
                                            <input
                                                id="acceptTerms"
                                                name="acceptTerms"
                                                type="checkbox"
                                                checked={formData.acceptTerms || false}
                                                onChange={e => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                                                className="h-5 w-5 text-[#00B0C8] focus:ring-[#00B0C8] border-gray-300 rounded mt-1"
                                                required
                                            />
                                            <label htmlFor="acceptTerms" className="ml-3 text-sm text-gray-700 select-none">
                                                {t.acceptTerms} <a href="/terminos-y-condiciones" target="_blank" rel="noopener noreferrer" className="underline text-[#00B0C8] hover:text-[#008da0]">{t.termsLink}</a> {locale === 'ca' ? 'i la' : 'y la'} <a href="/politica-de-privacidad" target="_blank" rel="noopener noreferrer" className="underline text-[#00B0C8] hover:text-[#008da0]">{t.privacyLink}</a> {locale === 'ca' ? 'd’aquest lloc web.' : 'de este sitio web.'}
                                            </label>
                                        </div>
                                    </div>
                                    <div className="flex justify-between space-x-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={handlePrevStep}
                                            className="px-6 py-2 border cursor-pointer border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                        >
                                            {t.previous}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className={`px-6 py-2 border cursor-pointer border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00B0C8] hover:bg-[#008da0] focus:outline-none ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                                        >
                                            {loading ? t.creating : t.createList}
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