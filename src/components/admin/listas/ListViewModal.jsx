'use client';
import { FiX } from 'react-icons/fi';
import Image from 'next/image';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useState, useCallback, useEffect } from 'react';
import { updateBirthListItems } from '@/services/BirthListService';
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
    // Split items by state
    const [items, setItems] = useState([]);

    useEffect(() => {
        console.log('listItems updated:', listItems);
        if (listItems?.length > 0) {
            setItems(listItems);
        }
    }, [listItems]);

    const getPendingItems = useCallback(() =>
        items.filter(item => !item.reserved || item.reserved === 0), [items]
    );

    const getReservedItems = useCallback(() =>
        items.filter(item => item.reserved > 0 && item.reserved < item.quantity), [items]
    );

    const getBoughtItems = useCallback(() =>
        items.filter(item => item.reserved >= item.quantity), [items]
    );

    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const sourceId = result.source.droppableId;
        const destId = result.destination.droppableId;

        if (sourceId === destId) return;

        const itemToMove = items.find(item => item.product._id === result.draggableId);
        if (!itemToMove) return;

        const newItems = [...items];
        const itemIndex = newItems.findIndex(item => item.product._id === itemToMove.product._id);

        // Validate the move based on current state
        let isValidMove = true;
        let newReservedCount = itemToMove.reserved;

        if (destId === 'reserved' && itemToMove.reserved === 0) {
            newReservedCount = 1;
        } else if (destId === 'bought') {
            if (itemToMove.reserved < itemToMove.quantity) {
                newReservedCount = itemToMove.quantity;
            } else {
                isValidMove = false;
            }
        } else if (destId === 'pending') {
            newReservedCount = 0;
        }

        if (!isValidMove) {
            toast.error('No se puede mover el producto a este estado');
            return;
        }

        // Update the item's reserved count based on destination
        newItems[itemIndex] = { ...itemToMove, reserved: newReservedCount };

        try {
            // Update in the database
            const response = await updateBirthListItems(selectedList._id, newItems);
            if (response.success) {
                setItems(newItems);
                toast.success('Estado del producto actualizado');
            } else {
                toast.error('Error al actualizar el estado del producto');
            }
        } catch (error) {
            console.error('Error updating item state:', error);
            toast.error('Error al actualizar el estado del producto');
        }
    };    const [activeDragId, setActiveDragId] = useState(null);

    const onDragStart = (start) => {
        setActiveDragId(start.draggableId);
    };

    const onDragEnd = (result) => {
        setActiveDragId(null);
        handleDragEnd(result);
    };

    const isDropDisabled = (dropId) => {
        if (!activeDragId) return false;
        
        // Find the item being dragged
        const item = items.find(i => i.product._id === activeDragId);
        if (!item) return true;

        // Rules for each drop zone
        switch (dropId) {
            case 'pending':
                return false; // Can always move back to pending
            case 'reserved':
                return item.reserved > 0; // Can't reserve if already reserved
            case 'bought':
                return item.reserved >= item.quantity; // Can't mark as bought if already fully bought
            default:
                return true;
        }
    };

    const getDroppableStyle = (isDraggingOver, isDropDisabled) => {
        let style = "bg-white rounded-lg border border-gray-200 overflow-hidden transition-colors duration-200";
        
        if (isDraggingOver) {
            if (isDropDisabled) {
                style += " border-red-400 bg-red-50";
            } else {
                style += " border-green-400 bg-green-50";
            }
        }
        
        return style;
    };

    const renderProduct = (item, provided) => (
        <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="p-4 bg-white border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
        >
            <div className="flex items-start">
                <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-md overflow-hidden mr-3">
                    {item.product.image && (
                        <Image
                            src={item.product.image}
                            alt={item.product.name}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                        />
                    )}
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{item.product.name}</h4>
                    <p className="text-xs text-gray-500">Ref: {item.product.reference || '-'}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.product.brand}</p>
                    <div className="flex justify-between items-center mt-2">
                        <div className="flex space-x-2">
                            <div className="px-2 py-1 bg-blue-50 rounded border border-blue-100">
                                <span className="text-xs text-gray-500">Cant: <span className="font-medium text-blue-700">{item.quantity}</span></span>
                            </div>
                            <div className="px-2 py-1 bg-green-50 rounded border border-green-100">
                                <span className="text-xs text-gray-500">Recibidos: <span className="font-medium text-green-700">{item.reserved || 0}</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (!showModal || !selectedList) return null;

    return (
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
                    </div>                    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
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
                                <Droppable 
                                    droppableId="pending"
                                    isDropDisabled={isDropDisabled('pending')}
                                >
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={getDroppableStyle(snapshot.isDraggingOver, isDropDisabled('pending'))}
                                        >
                                            {itemsLoading ? (
                                                <div className="flex justify-center items-center py-10">
                                                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00B0C8]"></div>
                                                </div>
                                            ) : getPendingItems().length === 0 ? (
                                                <div className="text-center py-10">
                                                    <p className="text-gray-500">No hay productos pendientes.</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-gray-200 h-[300px] overflow-y-auto">
                                                    {getPendingItems().map((item, index) => (
                                                        <Draggable
                                                            key={item.product._id}
                                                            draggableId={item.product._id}
                                                            index={index}
                                                        >
                                                            {(provided) => renderProduct(item, provided)}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                            <div>
                                <div className="flex items-center mb-4">
                                    <span className="text-[#00B0C8] mr-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                        </svg>
                                    </span>                                    <h3 className="text-md font-semibold text-gray-800">Productos Reservados</h3>
                                </div>                                <Droppable 
                                    droppableId="reserved"
                                    isDropDisabled={isDropDisabled('reserved')}
                                >
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={getDroppableStyle(
                                                snapshot.isDraggingOver,
                                                isDropDisabled('reserved')
                                            )}
                                        >
                                            {itemsLoading ? (
                                                <div className="flex justify-center items-center py-10">
                                                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00B0C8]"></div>
                                                </div>
                                            ) : getReservedItems().length === 0 ? (
                                                <div className="text-center py-10">
                                                    <p className="text-gray-500">No hay productos reservados.</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-gray-200 h-[300px] overflow-y-auto">
                                                    {getReservedItems().map((item, index) => (
                                                        <Draggable
                                                            key={item.product._id}
                                                            draggableId={item.product._id}
                                                            index={index}
                                                        >
                                                            {(provided) => renderProduct(item, provided)}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                            <div>
                                <div className="flex items-center mb-4">
                                    <span className="text-[#00B0C8] mr-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                        </svg>
                                    </span>                                    <h3 className="text-md font-semibold text-gray-800">Productos Comprados</h3>
                                </div>                                <Droppable 
                                    droppableId="bought"
                                    isDropDisabled={isDropDisabled('bought')}
                                >
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={getDroppableStyle(
                                                snapshot.isDraggingOver,
                                                isDropDisabled('bought')
                                            )}
                                        >
                                            {itemsLoading ? (
                                                <div className="flex justify-center items-center py-10">
                                                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00B0C8]"></div>
                                                </div>
                                            ) : getBoughtItems().length === 0 ? (
                                                <div className="text-center py-10">
                                                    <p className="text-gray-500">No hay productos comprados.</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-gray-200 h-[300px] overflow-y-auto">
                                                    {getBoughtItems().map((item, index) => (
                                                        <Draggable
                                                            key={item.product._id}
                                                            draggableId={item.product._id}
                                                            index={index}
                                                        >
                                                            {(provided) => renderProduct(item, provided)}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        </div>
                    </DragDropContext>

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
    );
}