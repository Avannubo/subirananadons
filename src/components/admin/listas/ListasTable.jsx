'use client';
import { useState, useRef, useEffect } from 'react';
import { FiEdit, FiTrash2, FiEye, FiGift, FiToggleLeft } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { deleteBirthList, updateBirthList, fetchBirthListItems } from '@/services/BirthListService';
import ListEditModal from './ListEditModal';
import ListDeleteModal from './ListDeleteModal';
import ListViewModal from './ListViewModal';
import ListStatusModal from './ListStatusModal';

export default function ListasTable({ lists, filters, setFilters, userRole = 'user', onUpdate }) {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
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
    const saveButtonRef = useRef(null);

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

    const openStatusModal = (list) => {
        setSelectedList(list);
        setShowStatusModal(true);
    };

    const updateListStatus = async (listId, newStatus) => {
        try {
            setLoading(true);
            const updateData = { status: newStatus };
            const result = await updateBirthList(listId, updateData);

            if (result.success) {
                toast.success('Estado de la lista actualizado con éxito');
                setShowStatusModal(false);
                // Refresh the list after update
                if (onUpdate) {
                    onUpdate();
                }
            } else {
                toast.error('Error al actualizar el estado de la lista: ' + result.message);
            }
        } catch (error) {
            console.error('Error updating birth list status:', error);
            toast.error('Error al actualizar el estado de la lista: ' + (error.message || 'Error desconocido'));
        } finally {
            setLoading(false);
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
            // Disable save button during processing
            if (saveButtonRef.current) {
                saveButtonRef.current.disabled = true;
            }

            // Handle image upload if there is a new image file
            let imageUrl = selectedList.image;
            if (editForm.image && typeof editForm.image === 'object') {
                const toastId = toast.loading('Subiendo imagen...');
                try {
                    // Convert image to base64
                    const base64Image = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(editForm.image);
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
                    imageUrl = data.url;
                } catch (uploadError) {
                    console.error('Error uploading image:', uploadError);
                    toast.error('Error al subir la imagen. Se guardará la lista sin la nueva imagen.', { id: toastId });
                }
            }

            const updateData = {
                title: editForm.title,
                babyName: editForm.babyName,
                description: editForm.description,
                dueDate: new Date(editForm.dueDate),
                isPublic: editForm.isPublic,
                image: imageUrl
            };

            const result = await updateBirthList(selectedList.id, updateData);
            if (result.success) {
                toast.success('Lista actualizada con éxito');
                // Properly close the modal after successful update
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
            // Re-enable save button
            if (saveButtonRef.current) {
                saveButtonRef.current.disabled = false;
            }
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
        <div className="bg-white rounded-lg shadow overflow-hidden ">
            {/* Search Filters for Admin Users */}
            {userRole === 'admin' && (
                <div className="p-4 bg-gray-50 border-b border-gray-200">
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
            <div className="overflow-x-auto ">
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
                                            title="Ver detalles"
                                        >
                                            <FiEye size={20} />
                                        </button>
                                        {userRole === 'admin' || list.userId === 'current_user_id' ? (
                                            <>
                                                <button
                                                    className="text-yellow-600 hover:text-yellow-900 mr-2"
                                                    onClick={() => openEditModal(list)}
                                                    title="Editar lista"
                                                >
                                                    <FiEdit size={20} />
                                                </button>
                                                <button
                                                    className="text-purple-600 hover:text-purple-900 mr-2"
                                                    onClick={() => openStatusModal(list)}
                                                    title="Cambiar estado"
                                                >
                                                    <FiToggleLeft size={20} />
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                className="text-yellow-600 hover:text-yellow-900 mr-2"
                                                title="Añadir regalo"
                                            >
                                                <FiGift size={20} />
                                            </button>
                                        )}
                                        <button
                                            className="text-red-600 hover:text-red-900"
                                            onClick={() => openDeleteModal(list)}
                                            title="Eliminar lista"
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

            {/* Using modular components for modals */}
            <ListEditModal
                showModal={showEditModal}
                setShowModal={setShowEditModal}
                selectedList={selectedList}
                editForm={editForm}
                handleEditChange={handleEditChange}
                handleUpdateList={handleUpdateList}
                loading={loading}
                saveButtonRef={saveButtonRef}
            />

            <ListDeleteModal
                showModal={showDeleteModal}
                setShowModal={setShowDeleteModal}
                selectedList={selectedList}
                handleDeleteList={handleDeleteList}
                loading={loading}
            />

            <ListViewModal
                showModal={showViewModal}
                setShowModal={setShowViewModal}
                selectedList={selectedList}
                listItems={listItems}
                itemsLoading={itemsLoading}
                openEditModal={openEditModal}
                openStatusModal={openStatusModal}
            />

            <ListStatusModal
                showModal={showStatusModal}
                setShowModal={setShowStatusModal}
                selectedList={selectedList}
                updateStatus={updateListStatus}
                loading={loading}
            />
        </div>
    );
} 