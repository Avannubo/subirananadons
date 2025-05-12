'use client';
import { FiX } from 'react-icons/fi';
import Image from 'next/image';
export default function ListViewModal({
    showModal,
    setShowModal,
    selectedList,
    listItems,
    itemsLoading,
    openEditModal,
    openStatusModal
}) {
    if (!showModal || !selectedList) return null;
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#00000050] bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
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
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="bg-gray-50 rounded-lg p-4">
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
                        <div className="bg-gray-50 rounded-lg p-4">
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
                        <div className="bg-gray-50 rounded-lg p-4">
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
                        <div className="bg-gray-50 rounded-lg p-4">
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
                    <div className="grid grid-cols-3 gap-6 ">
                        <div>
                            <div className="flex items-center mb-4 ">
                                <span className="text-[#00B0C8] mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                                    </svg>
                                </span>
                                <h3 className="text-md font-semibold text-gray-800">Información de la Lista</h3>
                            </div>
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-[300px]">
                                <div className="p-4 space-y-3">
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
                        </div>
                        <div>
                            <div className="flex items-center mb-4">
                                <span className="text-[#00B0C8] mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                    </svg>
                                </span>
                                <h3 className="text-md font-semibold text-gray-800">Progreso</h3>
                            </div>
                            <div className="bg-white rounded-lg border border-gray-200 p-4 h-[300px]">
                                <div className="mb-6">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-xs text-gray-500">Progreso total</span>
                                        <span className="text-xs font-medium">{selectedList.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className={`h-2.5 rounded-full ${selectedList.progress >= 100 ? 'bg-green-500' :
                                                selectedList.progress >= 75 ? 'bg-[#00B0C8]' :
                                                    selectedList.progress >= 50 ? 'bg-yellow-500' :
                                                        'bg-red-500'
                                                }`}
                                            style={{ width: `${selectedList.progress}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="text-4xl font-bold text-[#00B0C8]">{selectedList.products}</div>
                                        <div className="text-xs text-gray-500 mt-1">Total Productos</div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="text-4xl font-bold text-green-500">{selectedList.purchased}</div>
                                        <div className="text-xs text-gray-500 mt-1">Productos Recibidos</div>
                                    </div>
                                </div>
                                <div className="text-center mt-6">
                                    <button
                                        onClick={() => {
                                            setShowModal(false);
                                            openEditModal(selectedList);
                                        }}
                                        className="w-full px-4 py-2 bg-[#00B0C8] text-white rounded hover:bg-[#008da0] text-sm font-medium mb-2"
                                    >
                                        Gestionar Productos
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowModal(false);
                                            openStatusModal(selectedList);
                                        }}
                                        className="w-full px-4 py-2 border border-[#00B0C8] text-[#00B0C8] rounded hover:bg-[#00B0C810] text-sm font-medium"
                                    >
                                        Cambiar Estado
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center mb-4">
                                <span className="text-[#00B0C8] mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                    </svg>
                                </span>
                                <h3 className="text-md font-semibold text-gray-800">Productos</h3>
                            </div>
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                {itemsLoading ? (
                                    <div className="flex justify-center items-center py-10">
                                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00B0C8]"></div>
                                    </div>
                                ) : listItems.length === 0 ? (
                                    <div className="text-center py-10">
                                        <p className="text-gray-500">No hay productos en esta lista.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-200 h-[300px] overflow-y-auto">
                                        {listItems.map((item) => (
                                            <div key={item.product._id} className="p-4">
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
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
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