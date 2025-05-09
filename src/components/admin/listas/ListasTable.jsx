'use client';
import { useState, useRef, useEffect } from 'react';
import { FiEdit, FiTrash2, FiEye, FiGift, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { deleteBirthList, updateBirthList, fetchBirthListItems } from '@/services/BirthListService';
import ProductSelection from './ProductSelection';
import ListProductsManager from './ListProductsManager';
import Image from 'next/image';

export default function ListasTable({ lists, filters, setFilters, userRole = 'user', onUpdate }) {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedList, setSelectedList] = useState(null);
    const [loading, setLoading] = useState(false);
    const [listItems, setListItems] = useState([]);
    const [itemsLoading, setItemsLoading] = useState(false);
    const [editForm, setEditForm] = useState({
        title: '',
        babyName: '',
        description: '',
        dueDate: '',
        isPublic: true,
        items: []
    });
    const modalRef = useRef(null);
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };
    // Filter the lists based on search criteria
    const filteredLists = lists.filter((list) => {
        return (
            list.id.toString().includes(filters.searchId || '') &&
            list.reference.toLowerCase().includes((filters.searchReference || '').toLowerCase()) &&
            list.name.toLowerCase().includes((filters.searchName || '').toLowerCase()) &&
            list.creator.toLowerCase().includes((filters.searchCreator || '').toLowerCase())
        );
    });
    const openEditModal = (list) => {
        setSelectedList(list);
        setEditForm({
            title: list.name,
            babyName: list.babyName,
            description: list.description || '',
            dueDate: new Date(list.dueDate.split('/').reverse().join('-')).toISOString().split('T')[0],
            isPublic: list.isPublic,
            items: list.rawData?.items || []
        });
        setShowEditModal(true);
    };
    const openDeleteModal = (list) => {
        setSelectedList(list);
        setShowDeleteModal(true);
    };
    const openViewModal = async (list) => {
        setSelectedList(list);
        setShowViewModal(true);

        // Fetch list items
        try {
            setItemsLoading(true);
            const result = await fetchBirthListItems(list.id);
            if (result.success) {
                setListItems(result.data || []);
            } else {
                toast.error('Error al cargar los productos de la lista');
            }
        } catch (error) {
            console.error('Error loading birth list items:', error);
            toast.error('Error al cargar los productos de la lista');
        } finally {
            setItemsLoading(false);
        }
    };
    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    const handleUpdateList = async (e) => {
        e.preventDefault();
        if (!editForm.title || !editForm.babyName || !editForm.dueDate) {
            toast.error('Por favor complete todos los campos obligatorios');
            return;
        }
        try {
            setLoading(true);
            const updateData = {
                title: editForm.title,
                babyName: editForm.babyName,
                description: editForm.description,
                dueDate: new Date(editForm.dueDate),
                isPublic: editForm.isPublic
            };
            const result = await updateBirthList(selectedList.id, updateData);
            if (result.success) {
                toast.success('Lista actualizada con éxito');
                setShowEditModal(false);
                // Refresh the list after update
                if (onUpdate) {
                    onUpdate();
                }
            } else {
                toast.error('Error al actualizar la lista: ' + result.message);
            }
        } catch (error) {
            console.error('Error updating birth list:', error);
            toast.error('Error al actualizar la lista: ' + (error.message || 'Error desconocido'));
        } finally {
            setLoading(false);
        }
    };
    const handleDeleteList = async () => {
        try {
            setLoading(true);
            const result = await deleteBirthList(selectedList.id);
            if (result.success) {
                toast.success('Lista eliminada con éxito');
                setShowDeleteModal(false);
                // Refresh the list after delete
                if (onUpdate) {
                    onUpdate();
                }
            } else {
                toast.error('Error al eliminar la lista: ' + result.message);
            }
        } catch (error) {
            console.error('Error deleting birth list:', error);
            toast.error('Error al eliminar la lista: ' + (error.message || 'Error desconocido'));
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Search Filters for Admin Users */}
            {userRole === 'admin' && (
                <div className="p-4 bg-gray-50 border-b border-gray-400">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <input
                                type="text"
                                name="searchId"
                                value={filters.searchId || ''}
                                onChange={handleFilterChange}
                                placeholder="Buscar por ID"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                name="searchReference"
                                value={filters.searchReference || ''}
                                onChange={handleFilterChange}
                                placeholder="Buscar por referencia"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                name="searchName"
                                value={filters.searchName || ''}
                                onChange={handleFilterChange}
                                placeholder="Buscar por nombre"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                name="searchCreator"
                                value={filters.searchCreator || ''}
                                onChange={handleFilterChange}
                                placeholder="Buscar por creador"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                        </div>
                    </div>
                </div>
            )}
            {/* Lists Table */}
            <div className="overflow-x-auto">
                <table className="w-full whitespace-nowrap">
                    <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3 text-left">ID</th>
                            <th className="px-6 py-3 text-left">Referencia</th>
                            <th className="px-6 py-3 text-left">Nombre</th>
                            {userRole === 'admin' && <th className="px-6 py-3 text-left">Creador</th>}
                            <th className="px-6 py-3 text-left">Fecha Creación</th>
                            <th className="px-6 py-3 text-left">Fecha Prevista</th>
                            <th className="px-6 py-3 text-left">Progreso</th>
                            <th className="px-6 py-3 text-left">Estado</th>
                            <th className="px-6 py-3 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredLists.length > 0 ? (
                            filteredLists.map((list, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">{index + 1}</td>
                                    <td className="px-6 py-4">{list.reference}</td>
                                    <td className="px-6 py-4">{list.name}</td>
                                    {userRole === 'admin' && <td className="px-6 py-4">{list.creator}</td>}
                                    <td className="px-6 py-4">{list.creationDate}</td>
                                    <td className="px-6 py-4">{list.dueDate}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                                                <div
                                                    className={`h-2 rounded-full ${list.progress >= 100 ? 'bg-green-500' :
                                                        list.progress >= 75 ? 'bg-[#00B0C8]' :
                                                            list.progress >= 50 ? 'bg-yellow-500' :
                                                                'bg-red-500'
                                                        }`}
                                                    style={{ width: `${list.progress}%` }}
                                                />
                                            </div>
                                            <span className="text-xs">{list.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${list.status === 'Activa' ? 'bg-green-100 text-green-800' :
                                                list.status === 'Completada' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {list.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <button
                                            className="text-[#00B0C8] hover:text-[#008da0] mr-2"
                                            onClick={() => openViewModal(list)}
                                        >
                                            <FiEye size={20} />
                                        </button>
                                        {userRole === 'admin' || list.userId === 'current_user_id' ? (
                                            <>
                                                <button
                                                    className="text-yellow-600 hover:text-yellow-900"
                                                    onClick={() => openEditModal(list)}
                                                >
                                                    <FiEdit size={20} />
                                                </button>

                                            </>
                                        ) : (

                                            <button
                                                className="text-yellow-600 hover:text-yellow-900"
                                            >
                                                <FiGift size={20} />
                                            </button>

                                        )} <button
                                            className="text-red-600 hover:text-red-900"

                                            onClick={() => openDeleteModal(list)}
                                        >
                                            <FiTrash2 size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={userRole === 'admin' ? 9 : 8} className="px-6 py-4 text-center text-gray-500">
                                    No se encontraron listas de regalos.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* Edit Modal */}
            {showEditModal && selectedList && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-[#00000050] bg-opacity-50 flex items-center justify-center p-4">
                    <div
                        ref={modalRef}
                        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Editar Lista de Nacimiento</h2>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <FiX size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleUpdateList} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>  {/* Title */}
                                        <div>
                                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                                Título de la Lista <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="title"
                                                name="title"
                                                value={editForm.title}
                                                onChange={handleEditChange}
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
                                                value={editForm.babyName}
                                                onChange={handleEditChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                                                placeholder="Ej: Lucas o Bebé García (si aún no tiene nombre)"
                                                required
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
                                                value={editForm.dueDate}
                                                onChange={handleEditChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        {/* Description */}
                                        <div>
                                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                                Descripción
                                            </label>
                                            <textarea
                                                id="description"
                                                name="description"
                                                value={editForm.description}
                                                onChange={handleEditChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00B0C860] focus:border-[#00B0C860]"
                                                placeholder="Escribe un mensaje o descripción para tus invitados"
                                                rows={4}
                                            />
                                        </div>
                                        {/* Privacy */}
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="isPublic"
                                                name="isPublic"
                                                checked={editForm.isPublic}
                                                onChange={handleEditChange}
                                                className="h-4 w-4 text-[#00B0C8] focus:ring-[#00B0C8] border-gray-300 rounded"
                                            />
                                            <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                                                Lista Pública (Visible para cualquier persona con el enlace)
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                {/* Products Manager */}
                                <div className="border-t border-gray-200 ">
                                    <ListProductsManager
                                        listId={selectedList.id}
                                        onUpdate={onUpdate}
                                    />
                                </div>
                                <div className="flex justify-end space-x-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00B0C8] hover:bg-[#008da0] focus:outline-none ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                                    >
                                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedList && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-[#00000050] bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Confirmar Eliminación</h2>
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <FiX size={24} />
                                </button>
                            </div>
                            <div className="text-center mb-6">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                    <FiTrash2 className="h-6 w-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">¿Estás seguro?</h3>
                                <p className="text-sm text-gray-500 mt-2">
                                    Estás a punto de eliminar la lista "{selectedList.name}". Esta acción no se puede deshacer.
                                </p>
                            </div>
                            <div className="flex justify-center space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteList}
                                    disabled={loading}
                                    className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? 'Eliminando...' : 'Eliminar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* View Modal */}
            {showViewModal && selectedList && (
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
                                    onClick={() => setShowViewModal(false)}
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
                                                    setShowViewModal(false);
                                                    openEditModal(selectedList);
                                                }}
                                                className="w-full px-4 py-2 bg-[#00B0C8] text-white rounded hover:bg-[#008da0] text-sm font-medium"
                                            >
                                                Gestionar Productos
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
                                                                        {/* <div className="px-2 py-1 bg-purple-50 rounded border border-purple-100">
                                                                            <span className="text-xs font-medium text-purple-700 text-nowrap">{item.product.price_incl_tax?.toFixed(2).replace('.', ',')} €</span>
                                                                        </div> */}
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
                                        onClick={() => setShowViewModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 