'use client';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Image from 'next/image';
import { useState, useCallback, useEffect } from 'react';
import { updateBirthListItems, fetchBirthListItems, updateBirthListItemState, updateBirthList } from '@/services/BirthListService';
import { toast } from 'react-hot-toast';

export default function ListViewModal({
    showModal,
    setShowModal,
    selectedList,
    listItems,
    itemsLoading,
    openEditModal,
    openStatusModal,
    onStatusChange
}) {
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]);
    const [showDataModal, setShowDataModal] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [direction, setDirection] = useState(null);
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });

    // Reset userData when modal closes or changes item
    useEffect(() => {
        if (!showModal || !currentItem) {
            setUserData({
                name: '',
                email: '',
                phone: '',
                message: ''
            });
        } else if (currentItem.userData) {
            // If editing an item that already has userData, populate the form
            setUserData({
                name: currentItem.userData.name || '',
                email: currentItem.userData.email || '',
                phone: currentItem.userData.phone || '',
                message: currentItem.userData.message || ''
            });
        }
    }, [showModal, currentItem]);

    const handleUserDataChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    useEffect(() => {
        if (!showModal) {
            setItems([]);
        }
        else if (Array.isArray(listItems)) {
            setItems(listItems);
        }
    }, [listItems, showModal]);
    const getPendingItems = useCallback(() =>
        items.filter(item => item.state === 0), [items]
    );
    const getReservedItems = useCallback(() =>
        items.filter(item => item.state === 1), [items]
    );
    const getBoughtItems = useCallback(() =>
        items.filter(item => item.state === 2), [items]
    );

    const confirmStateChange = async () => {
        if (!currentItem) return;
        const listId = selectedList.rawData?._id || selectedList._id;

        if (!listId) {
            toast.error('Error: ID de lista no encontrado');
            return;
        }

        try {
            // Get the new state based on direction
            let newState;
            switch (direction) {
                case 'left':
                    newState = currentItem.state - 1;
                    break;
                case 'reserve':
                    newState = 1;
                    break;
                case 'buy':
                    newState = 2;
                    break;
                default:
                    return;
            }

            // Validate state change
            if (newState === currentItem.state) {
                return toast.error('El producto ya está en este estado');
            }

            // Check required fields for reserve/buy actions
            if ((direction === 'reserve' || direction === 'buy') && (!userData.name || !userData.email)) {
                toast.error('Por favor complete los campos obligatorios (nombre y email)');
                return;
            }

            setLoading(true);

            // Update the item's state
            const result = await updateBirthListItemState(listId, currentItem._id, newState, userData);

            if (result.success) {
                // Update the item in the local state
                const updatedItems = items.map(item =>
                    item._id === currentItem._id ? result.data : item
                );
                setItems(updatedItems);

                toast.success('Estado del producto actualizado correctamente');
                setShowDataModal(false);
                setUserData({
                    name: '',
                    email: '',
                    phone: '',
                    message: ''
                });
            }
        } catch (error) {
            console.error('Error updating item state:', error);
            toast.error(error.message || 'Error al actualizar el estado del producto');
        } finally {
            setLoading(false);
        }
    }; const moveItem = (item, dir) => {
        setCurrentItem(item);
        setDirection(dir);

        // If moving left (undoing reservation/purchase), directly update the state
        if (dir === 'left') {
            confirmStateChange();
        } else {
            // If moving to reserved or bought state, show data modal
            setShowDataModal(true);
            // If the item already has user data, populate the form
            if (item.userData) {
                setUserData({
                    name: item.userData.name || '',
                    email: item.userData.email || '',
                    phone: item.userData.phone || '',
                    message: item.userData.message || ''
                });
            }
        }
    };
    // Only allow cancellation of reserved items (state=1)
    const canMoveLeft = (item) => item.state === 1;  // Only allow canceling reserved items
    const canMoveRight = (item) => item.state < 2;
    const renderStateLabel = (state) => {
        switch (state) {
            case 0: return "Pendiente";
            case 1: return "Reservado";
            case 2: return "Comprado";
            default: return "Desconocido";
        }
    }; const handleSaveList = async () => {
        try {
            const listId = selectedList.rawData?._id || selectedList._id;
            if (!listId) {
                toast.error('Error: ID de lista no encontrado');
                return;
            }

            setLoading(true);

            // Check if all items are in state 2 (bought)
            const allBought = items.every(item => item.state === 2);
            const newStatus = allBought ? 'Completada' : 'Activa';

            // Only update if status would change            if (selectedList.status !== newStatus) {
            const result = await updateBirthList(listId, { status: newStatus });
            if (result.success) {
                // Update local state
                selectedList.status = newStatus;
                // Call onStatusChange if provided
                if (onStatusChange) {
                    onStatusChange(newStatus);
                }
                toast.success(`Lista marcada como ${newStatus}`);

            } else {
                toast.success('Lista guardada');
            }
            setShowModal(false);
        } catch (error) {
            console.error('Error saving list:', error);
            toast.error('Error al guardar la lista');
        } finally {
            setLoading(false);
        }
    };

    const renderProduct = (item, index) => {
        if (!item?.product?._id) {
            console.warn('Missing product data for item:', item);
            return (
                <div key={item?._id || `error-${index}`} className="p-4 bg-white border-b border-gray-200">
                    <div className="flex items-start">
                        <div className="flex-1">
                            <p className="text-sm text-red-500">Error: Datos del producto no disponibles</p>
                            <p className="text-xs text-gray-500">ID del artículo: {item?._id || 'Desconocido'}</p>
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <div key={item._id} className="p-4 bg-white border-b border-gray-200">
                {/* last:border-b-0 */}
                <div className="flex items-start">
                    <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-md overflow-hidden mr-3">
                        {item.product?.image && (
                            <Image
                                src={item.product.image}
                                alt={item.product.name}
                                width={64}
                                height={64}
                                className="object-cover w-full h-full"
                            />
                        )}
                    </div>                    <div className="flex-1">
                        <div className='flex justify-between items-center'>
                            <h4 className="text-sm font-medium text-gray-900">{item.product.name}</h4>
                            <div className="flex items-center space-x-2">
                                {canMoveLeft(item) && (
                                    <button
                                        onClick={() => moveItem(item, 'left')}
                                        className="px-3 py-1 text-sm rounded-md text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors duration-200"
                                        title="Cancelar reserva o compra"
                                    >
                                        Cancelar
                                    </button>
                                )}
                                {item.state === 0 && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setCurrentItem(item);
                                                setDirection('reserve');
                                                setShowDataModal(true);
                                            }}
                                            className="px-3 py-1 text-sm rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-colors duration-200"
                                            title="Reservar producto"
                                        >
                                            Reservar
                                        </button>
                                        <button
                                            onClick={() => {
                                                setCurrentItem(item);
                                                setDirection('buy');
                                                setShowDataModal(true);
                                            }}
                                            className="px-3 py-1 text-sm rounded-md bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 transition-colors duration-200"
                                            title="Comprar producto"
                                        >
                                            Comprar
                                        </button>
                                    </>
                                )}
                                {item.state === 1 && (
                                    <button
                                        onClick={() => {
                                            setCurrentItem(item);
                                            setDirection('buy');
                                            setShowDataModal(true);
                                        }}
                                        className="px-3 py-1 text-sm rounded-md bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 transition-colors duration-200"
                                        title="Comprar producto"
                                    >
                                        Comprar
                                    </button>
                                )}                            </div>
                        </div>
                        <div className='grid grid-cols-3 gap-2 mt-1'>
                            <p className="text-xs text-gray-500">Ref: {item.product.reference || '-'}</p>
                            <p className="text-xs text-gray-500 mt-1">{item.product.brand}</p>
                            <p className="text-xs mt-1">
                                Estado:{" "}
                                <span
                                    className={`font-medium ${item.state === 0
                                        ? "text-yellow-500"
                                        : item.state === 1
                                            ? "text-blue-500"
                                            : item.state === 2
                                                ? "text-green-600"
                                                : "text-gray-500"
                                        }`}
                                >
                                    {renderStateLabel(item.state)}
                                </span>
                            </p>
                        </div>
                        {item.userData && (item.state === 1 || item.state === 2) && (
                            <div className="mt-2 bg-gray-50 p-2 rounded-md border border-gray-200">
                                <div className="flex items-start space-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500 mt-0.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                    </svg>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-700">{item.userData.name}</p>
                                        <p className="text-xs text-gray-500">{item.userData.email}</p>
                                        {item.userData.phone && (
                                            <p className="text-xs text-gray-500">{item.userData.phone}</p>
                                        )}
                                        {item.userData.message && (
                                            <p className="text-xs text-gray-600 mt-1 bg-white p-1.5 rounded border border-gray-100">
                                                {item.userData.message}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(item.userData.date).toLocaleDateString('es-ES', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="flex justify-between items-center mt-2">
                            {/* <div className="flex space-x-2">
                                <div className="px-2 py-1 bg-blue-50 rounded border border-blue-100">
                                    <span className="text-xs text-gray-500">Cant: <span className="font-medium text-blue-700">{item.quantity}</span></span>
                                </div>
                                <div className="px-2 py-1 bg-green-50 rounded border border-green-100">
                                    <span className="text-xs text-gray-500">Recibidos: <span className="font-medium text-green-700">{item.reserved || 0}</span></span>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    if (!showModal || !selectedList) return null;
    return (<>
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#00000050] bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full h-auto overflow-y-auto">
                <div className="p-6 flex flex-col h-full">
                    {/* Header */}                <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <span className="text-[#00B0C8] mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                </svg>
                            </span>
                            <h2 className="text-xl font-bold text-gray-800">Detalles de la Lista</h2>
                        </div>
                        <div className="flex items-center space-x-2">
                            
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FiX size={24} />
                            </button>
                        </div>
                    </div>
                    {/* Main information cards */}
                    <div>
                        <div className="flex items-center mb-4 ">
                            <span className="text-[#00B0C8] mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                                </svg>
                            </span>
                            <h3 className="text-md font-semibold text-gray-800">Información de la Lista</h3>
                        </div>
                        <div className='flex flex-row space-x-4 mb-4'>
                            <div className="bg-white rounded-lg border border-gray-200 w-[500px] ">
                                <div className="flex flex-row space-x-2 justify-between p-4 space-y-3">
                                    <div>
                                        <span className="block text-xs font-medium text-gray-500">Referencia:</span>
                                        <p className="text-sm text-gray-900 mt-1">{selectedList.reference}</p>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-medium text-gray-500">Nombre del Bebé:</span>
                                        <p className="text-sm text-gray-900 mt-1">{selectedList.babyName}</p>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-medium text-gray-500">Visibilidad:</span>
                                        <p className="text-sm text-gray-900 mt-1">{selectedList.isPublic ? 'Pública' : 'Privada'}</p>
                                    </div>
                                    {selectedList.description && (
                                        <div>
                                            <span className="block text-xs font-medium text-gray-500">Descripción:</span>
                                            <p className="text-sm text-gray-900 mt-1">{selectedList.description}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center mb-2">
                                            <span className="text-gray-400 mr-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 00-2.25-2.25v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                                </svg>
                                            </span>
                                            <h3 className="text-sm font-medium text-gray-500">Fecha</h3>
                                        </div>
                                        <p className="text-md font-medium">{selectedList.creationDate}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center mb-2">
                                            <span className="text-green-500 mr-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </span>
                                            <h3 className="text-sm font-medium text-gray-500">Total</h3>
                                        </div>
                                        <p className="text-md font-medium">{selectedList.products} productos</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center mb-2">
                                            <span className="text-purple-500 mr-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                                                </svg>
                                            </span>
                                            <h3 className="text-sm font-medium text-gray-500">Fecha Prevista</h3>
                                        </div>
                                        <p className="text-md font-medium">{selectedList.dueDate}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center mb-2">
                                            <span className="text-blue-500 mr-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </span>
                                            <h3 className="text-sm font-medium text-gray-500">Estado</h3>
                                        </div>
                                        <div>
                                            <span
                                                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${selectedList.status === 'Activa' ? 'bg-green-100 text-green-800' :
                                                    selectedList.status === 'Completada' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {selectedList.status}
                                            </span>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {selectedList.status === 'Activa'
                                                    ? 'Esta lista está disponible para recibir regalos'
                                                    : selectedList.status === 'Completada'
                                                        ? 'Todos los productos fueron recibidos'
                                                        : 'Esta lista ha sido InActiva'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>                    {/* Products sections with arrow navigation */}
                    <div className="grid grid-cols-3 gap-4 flex-1 h-full">
                        <div className="flex flex-col">
                            <div className="flex items-center mb-4">
                                <span className="text-[#00B0C8] mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                    </svg>
                                </span>
                                <h3 className="text-md font-semibold text-gray-800">Productos Pendientes</h3>
                            </div>
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden max-h-[55vh] flex-1">
                                {itemsLoading ? (
                                    <div className="flex justify-center items-center py-10">
                                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00B0C8]"></div>
                                    </div>
                                ) : getPendingItems().length === 0 ? (
                                    <div className="text-center py-10">
                                        <p className="text-gray-500">No hay productos pendientes.</p>
                                    </div>
                                ) : (<div className="divide-y divide-gray-200 h-full overflow-y-auto">
                                    {getPendingItems().map((item, index) => renderProduct(item, index))}
                                </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center mb-4">
                                <span className="text-[#00B0C8] mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                    </svg>
                                </span>
                                <h3 className="text-md font-semibold text-gray-800">Productos Reservados</h3>
                            </div>
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden max-h-[55vh] flex-1">
                                {itemsLoading ? (
                                    <div className="flex justify-center items-center py-10">
                                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00B0C8]"></div>
                                    </div>
                                ) : getReservedItems().length === 0 ? (
                                    <div className="text-center py-10">
                                        <p className="text-gray-500">No hay productos reservados.</p>
                                    </div>
                                ) : (<div className="divide-y divide-gray-200 h-full overflow-y-auto">
                                    {getReservedItems().map((item, index) => renderProduct(item, index))}
                                </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center mb-4">
                                <span className="text-[#00B0C8] mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                    </svg>
                                </span>
                                <h3 className="text-md font-semibold text-gray-800">Productos Comprados</h3>
                            </div>
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden max-h-[55vh] flex-1">
                                {itemsLoading ? (
                                    <div className="flex justify-center items-center py-10">
                                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00B0C8]"></div>
                                    </div>
                                ) : getBoughtItems().length === 0 ? (
                                    <div className="text-center py-10">
                                        <p className="text-gray-500">No hay productos comprados.</p>
                                    </div>
                                ) : (<div className="divide-y divide-gray-200 h-full overflow-y-auto">
                                    {getBoughtItems().map((item, index) => renderProduct(item, index))}
                                </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Footer */}
                    <div className="border-t border-gray-200 mt-6 pt-4">
                        <div className="flex justify-end">
                            <button
                                onClick={handleSaveList}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#00B0C8] border border-transparent rounded-md hover:bg-[#00B0C8]/80 focus:outline-none"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3" />
                                </svg>
                                Guardar
                            </button>
                            {/* <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                            >
                                Cerrar
                            </button> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {/* Data Collection Modal */}
        {showDataModal && currentItem && (
            <div className="fixed inset-0 bg-[#00000050] bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Datos del comprador</h3>
                        <button
                            onClick={() => setShowDataModal(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <FiX className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Nombre *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={userData.name}
                                onChange={handleUserDataChange}
                                className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={userData.email}
                                onChange={handleUserDataChange}
                                className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                Teléfono
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={userData.phone}
                                onChange={handleUserDataChange}
                                className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                                Mensaje
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                value={userData.message}
                                onChange={handleUserDataChange}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            ></textarea>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            onClick={() => setShowDataModal(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={confirmStateChange}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
    );
}