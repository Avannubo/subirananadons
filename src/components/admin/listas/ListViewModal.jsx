'use client';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Image from 'next/image';
import { useState, useCallback, useEffect } from 'react';
import { updateBirthListItems, fetchBirthListItems } from '@/services/BirthListService';
import { toast } from 'react-hot-toast';

export default function ListViewModal({
    showModal,
    setShowModal,
    selectedList,
    listItems,
    itemsLoading,
    openEditModal,
    openStatusModal
}) {
    const [loading, setLoading] = useState(false); const [items, setItems] = useState([]);
    const [showDataModal, setShowDataModal] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [direction, setDirection] = useState(null);
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
    ); const confirmStateChange = async () => {
        if (!currentItem) return;
        const listId = selectedList.rawData?._id || selectedList._id;
        if (!listId) {
            toast.error('Error: ID de lista no encontrado');
            return;
        }
        const itemToMove = items.find(item => item._id === currentItem._id);
        if (!itemToMove) {
            toast.error('Error: Item no encontrado');
            return;
        }
        const newItems = [...items];
        const itemIndex = newItems.findIndex(item => item._id === currentItem._id);
        let newState = itemToMove.state;

        // Handle different actions
        switch (direction) {
            case 'left':
                if (newState > 0) newState--;
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
        if (newState === itemToMove.state) {
            return toast.error('El producto ya está en este estado');
        }
        newItems[itemIndex] = {
            ...itemToMove,
            state: newState,
            product: { ...itemToMove.product },
            userData: newState > 0 ? userData : null // Save user data only when reserving or buying
        };
        try {
            setItems(newItems);
            const result = await updateBirthListItems(listId, newItems);
            if (result.success && Array.isArray(result.data)) {
                setItems(result.data);
                toast.success('Estado del producto actualizado correctamente');
            } else {
                throw new Error(result.message || 'Error al actualizar los productos');
            }
        } catch (error) {
            console.error('Error updating item state:', error);
            toast.error(error.message || 'Error al actualizar el estado del producto');
            setItems(items);
        } finally {
            setShowDataModal(false);
            setUserData({
                name: '',
                email: '',
                phone: '',
                message: ''
            });
        }
    };
    const moveItem = async (item, dir) => {
        setCurrentItem(item);
        setDirection(dir);
        // If moving left (undoing reservation/purchase), don't ask for data
        if (dir === 'left') {
            const listId = selectedList.rawData?._id || selectedList._id;
            const newItems = [...items];
            const itemIndex = newItems.findIndex(i => i._id === item._id);
            newItems[itemIndex] = {
                ...item,
                state: item.state - 1,
                product: { ...item.product },
                userData: null
            };
            try {
                setItems(newItems);
                const result = await updateBirthListItems(listId, newItems);
                if (result.success && Array.isArray(result.data)) {
                    setItems(result.data);
                    toast.success('Estado del producto actualizado correctamente');
                }
            } catch (error) {
                console.error('Error updating item state:', error);
                toast.error(error.message || 'Error al actualizar el estado del producto');
                setItems(items);
            }
        } else {
            // If moving to reserved or bought state, show data modal
            setShowDataModal(true);
        }
    };
    const canMoveLeft = (item) => item.state > 0;
    const canMoveRight = (item) => item.state < 2;
    const renderStateLabel = (state) => {
        switch (state) {
            case 0: return "Pendiente";
            case 1: return "Reservado";
            case 2: return "Comprado";
            default: return "Desconocido";
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
                                )}
                            </div>
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
            <div className="bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <span className="text-[#00B0C8] mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                </svg>
                            </span>
                            <h2 className="text-xl font-bold text-gray-800">Detalles de la Lista</h2>
                        </div>
                        <button
                            onClick={() => setShowModal(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <FiX size={24} />
                        </button>
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
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
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
                                                        : 'Esta lista ha sido cancelada'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Products sections with arrow navigation */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <div className="flex items-center mb-4">
                                <span className="text-[#00B0C8] mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                    </svg>
                                </span>
                                <h3 className="text-md font-semibold text-gray-800">Productos Pendientes</h3>
                            </div>
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                {itemsLoading ? (
                                    <div className="flex justify-center items-center py-10">
                                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00B0C8]"></div>
                                    </div>
                                ) : getPendingItems().length === 0 ? (
                                    <div className="text-center py-10">
                                        <p className="text-gray-500">No hay productos pendientes.</p>
                                    </div>
                                ) : (<div className="divide-y divide-gray-200 h-[300px] overflow-y-auto">
                                    {getPendingItems().map((item, index) => renderProduct(item, index))}
                                </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center mb-4">
                                <span className="text-[#00B0C8] mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                    </svg>
                                </span>
                                <h3 className="text-md font-semibold text-gray-800">Productos Reservados</h3>
                            </div>
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                {itemsLoading ? (
                                    <div className="flex justify-center items-center py-10">
                                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00B0C8]"></div>
                                    </div>
                                ) : getReservedItems().length === 0 ? (
                                    <div className="text-center py-10">
                                        <p className="text-gray-500">No hay productos reservados.</p>
                                    </div>
                                ) : (<div className="divide-y divide-gray-200 h-[300px] overflow-y-auto">
                                    {getReservedItems().map((item, index) => renderProduct(item, index))}
                                </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center mb-4">
                                <span className="text-[#00B0C8] mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                    </svg>
                                </span>
                                <h3 className="text-md font-semibold text-gray-800">Productos Comprados</h3>
                            </div>
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                {itemsLoading ? (
                                    <div className="flex justify-center items-center py-10">
                                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00B0C8]"></div>
                                    </div>
                                ) : getBoughtItems().length === 0 ? (
                                    <div className="text-center py-10">
                                        <p className="text-gray-500">No hay productos comprados.</p>
                                    </div>
                                ) : (<div className="divide-y divide-gray-200 h-[300px] overflow-y-auto">
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
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {/* Data Collection Modal */}
        {showDataModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-[#00000050] bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md">                    <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">
                                {direction === 'reserve' ? "Reservar Producto" : "Comprar Producto"}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {currentItem?.product?.name}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowDataModal(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <FiX size={24} />
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Nombre Completo*
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                required
                                value={userData.name}
                                onChange={handleUserDataChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email*
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                required
                                value={userData.email}
                                onChange={handleUserDataChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                Teléfono
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                id="phone"
                                value={userData.phone}
                                onChange={handleUserDataChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                                Mensaje (opcional)
                            </label>
                            <textarea
                                name="message"
                                id="message"
                                rows={3}
                                value={userData.message}
                                onChange={handleUserDataChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                        </div>
                    </div>                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => setShowDataModal(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Cancelar
                        </button>                        <button
                            type="button"
                            onClick={() => confirmStateChange()}
                            disabled={loading}
                            className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${direction === 'reserve'
                                    ? 'bg-blue-600 hover:bg-blue-700'
                                    : 'bg-green-600 hover:bg-green-700'
                                } disabled:opacity-50`}
                        >
                            {direction === 'reserve' ? "Reservar" : "Comprar"}
                        </button>
                    </div>
                </div>
                </div>
            </div>
        )}
    </>
    );
}