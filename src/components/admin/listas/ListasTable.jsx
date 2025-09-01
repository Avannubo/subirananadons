'use client';
import { useState, useRef } from 'react';
// Translation object for Catalan and Spanish
const translations = {
    ca: {
        id: 'ID',
        reference: 'Referència',
        name: 'Nom',
        creator: 'Usuari',
        creationDate: 'Data Creació',
        dueDate: 'Data Prevista',
        privacy: 'Privacitat',
        public: 'Pública',
        private: 'Privada',
        status: 'Estat',
        active: 'Activa',
        completed: 'Completada',
        inactive: 'Inactiva',
        viewShare: 'Veure/Compartir',
        documents: 'Documents',
        action: 'Quantity',
        noLists: 'No s’han trobat llistes de regals.',
        viewDetails: 'Veure detalls',
        copyLink: 'Copiar enllaç',
        linkCopied: 'Enllaç copiat al porta-retalls',
        linkCopyError: 'Error en copiar l’enllaç',
        downloadPDF: 'Descarregar PDF',
        printList: 'Imprimir llista',
        editList: 'Editar llista',
        changeStatus: 'Canviar estat',
        deleteList: 'Eliminar llista',
        listUpdated: 'Llista actualitzada amb èxit',
        listUpdateError: 'Error en actualitzar la llista',
        listDeleted: 'Llista eliminada amb èxit',
        listDeleteError: 'Error en eliminar la llista',
        pdfGenerating: 'Generant PDF...',
        pdfDownloadSuccess: 'Llista descarregada correctament',
        pdfDownloadError: 'Error en descarregar el PDF',
        printError: 'Error en imprimir la llista',
        loadingItemsError: 'Error en carregar els productes de la llista',
        uploadingImage: 'Pujant imatge...',
        imageUploadSuccess: 'Imatge pujada correctament',
        imageUploadError: 'Error en pujar la imatge. Es desarà la llista sense la nova imatge.',
        requiredFields: 'Si us plau, completa tots els camps obligatoris',
    },
    es: {
        id: 'ID',
        reference: 'Referencia',
        name: 'Nombre',
        creator: 'Usuario',
        creationDate: 'Fecha Creación',
        dueDate: 'Fecha Prevista',
        privacy: 'Privacidad',
        public: 'Pública',
        private: 'Privada',
        status: 'Estado',
        active: 'Activa',
        completed: 'Completada',
        inactive: 'InActiva',
        viewShare: 'Ver/Compartir',
        documents: 'Documentos',
        action: 'Acción',
        noLists: 'No se encontraron listas de regalos.',
        viewDetails: 'Ver detalles',
        copyLink: 'Copiar enlace',
        linkCopied: 'Enlace copiado al portapapeles',
        linkCopyError: 'Error al copiar el enlace',
        downloadPDF: 'Descargar PDF',
        printList: 'Imprimir lista',
        editList: 'Editar lista',
        changeStatus: 'Cambiar estado',
        deleteList: 'Eliminar lista',
        listUpdated: 'Lista actualizada con éxito',
        listUpdateError: 'Error al actualizar la lista',
        listDeleted: 'Lista eliminada con éxito',
        listDeleteError: 'Error al eliminar la lista',
        pdfGenerating: 'Generando PDF...',
        pdfDownloadSuccess: 'Lista descargada correctamente',
        pdfDownloadError: 'Error al descargar el PDF',
        printError: 'Error al imprimir la lista',
        loadingItemsError: 'Error al cargar los productos de la lista',
        uploadingImage: 'Subiendo imagen...',
        imageUploadSuccess: 'Imagen subida correctamente',
        imageUploadError: 'Error al subir la imagen. Se guardará la lista sin la nueva imagen.',
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
import { FiEdit, FiTrash2, FiEye, FiToggleLeft, FiDownload, FiPrinter, FiLink } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { deleteBirthList, updateBirthList, fetchBirthListItems } from '@/services/BirthListService';
import ListEditModal from './ListEditModal';
import ListDeleteModal from './ListDeleteModal';
import ListViewModal from './ListViewModal';
import ListStatusModal from './ListStatusModal';
export default function ListasTable({ lists, filters, setFilters, userRole = 'user', onUpdate }) {
    const locale = getLocale();
    const t = translations[locale];
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
    const filteredLists = lists.filter((list) => {
        const items = list.rawData?.items || [];
        const hasMatchingProduct = !filters.searchProduct ||
            items.some(item => {
                let productName = item.product?.name || '';
                // Handle translation object or string
                if (typeof productName === 'object' && productName !== null) {
                    productName = productName[locale] || productName['es'] || productName['ca'] || Object.values(productName)[0] || '';
                }
                if (typeof productName !== 'string') productName = '';
                const productRef = item.product?.reference || '';
                const searchTerm = (filters.searchProduct || '').toLowerCase();
                return productName.toLowerCase().includes(searchTerm) ||
                    productRef.toLowerCase().includes(searchTerm);
            });
        return (
            list.id.toString().includes(filters.searchId || '') &&
            list.reference.toLowerCase().includes((filters.searchReference || '').toLowerCase()) &&
            list.name.toLowerCase().includes((filters.searchName || '').toLowerCase()) &&
            list.creator.toLowerCase().includes((filters.searchCreator || '').toLowerCase()) &&
            hasMatchingProduct
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
    const updateListStatus = async (listId, newStatus, isPublic) => {
        try {
            setLoading(true);
            const updateData = {
                status: newStatus,
                isPublic: isPublic
            };
            const result = await updateBirthList(listId, updateData);
            if (result.success) {
                toast.success('Lista actualizada con éxito');
                setShowStatusModal(false);
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
                    const response = await fetch('/api/cloudinary/upload', {
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
    const generateListHTML = (list) => {
        // Use Catalan as default translation
        const t = translations?.ca || {};
        return `
            <html>
                <head>
                    <meta charset="UTF-8">
                    <title>${t.documents || 'Llista de Regals'} - ${list.name}</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif;
                            padding: 20px;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 20px;
                        }
                        th, td {
                            border: 1px solid #ddd;
                            padding: 8px;
                            text-align: left;
                        }
                        th {
                            background-color: #f4f4f4;
                        }
                        .header {
                            margin-bottom: 30px;
                        }
                        .list-info {
                            margin-bottom: 20px;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>${t.documents || 'Llista de Regals'}</h1>
                        <h2>${list.name}</h2>
                    </div>
                    <div class="list-info">
                        <p><strong>${t.reference || 'Referència'}:</strong> ${list.reference}</p>
                        <p><strong>${t.babyName || 'Nom del nadó'}:</strong> ${list.babyName}</p>
                        <p><strong>${t.creationDate || 'Data Creació'}:</strong> ${list.creationDate}</p>
                        <p><strong>${t.dueDate || 'Data Prevista'}:</strong> ${list.dueDate}</p>
                        <p><strong>${t.status || 'Estat'}:</strong> ${list.status}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>${'Producte'}</th>
                                <th>${'Quantitat'}</th>
                                <th>${'Estat'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(list.rawData?.items || []).map(item => {
            // Fixed left-to-right priority: ca, es, name, 'N/D'
            let prodName = 'N/D';
            if (item.product) {
                if (item.product.name.ca) prodName = item.product.name.ca;
                else if (item.product.name.es) prodName = item.product.name.es;
                else if (item.product.name) prodName = item.product.name;
            }
            // Map state: 0='Pendent', 1='Reservat', 2='Comprat'
            let stateLabel = 'Pendent';
            if (item.state === 1) stateLabel = 'Reservat';
            else if (item.state === 2) stateLabel = 'Comprat';
            return `
                                    <tr>
                                        <td>${prodName}</td>
                                        <td>${item.quantity || 0}</td>
                                        <td>${stateLabel}</td>
                                    </tr>
                                `;
        }).join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `;
    };
    const handlePrintPDF = async (list) => {
        try {
            const html = generateListHTML(list);
            const blob = new Blob([html], { type: 'text/html' });
            const url = window.URL.createObjectURL(blob);
            // Create an iframe to print
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            iframe.src = url;
            iframe.onload = () => {
                setTimeout(() => {
                    iframe.contentWindow.print();
                    document.body.removeChild(iframe);
                    window.URL.revokeObjectURL(url);
                }, 500);
            };
        } catch (error) {
            console.error('Error printing list:', error);
            toast.error('Error al imprimir la lista');
        }
    };

    const handleDownloadPDF = async (list) => {
        try {
            const toastId = toast.loading('Generando PDF...');
            const response = await fetch(`/api/lists/${list.id}/pdf`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/pdf'
                }
            });
            if (!response.ok) {
                throw new Error('Error al generar el PDF');
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Lista_de_Regalos_${list.reference}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Lista descargada correctamente', { id: toastId });
        } catch (error) {
            console.error('Error downloading PDF:', error);
            toast.error('Error al descargar el PDF');
        }
    };
    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full whitespace-nowrap">
                    <thead className="bg-gray-50 text-gray-700 uppercasªe text-xs">
                        <tr>
                            <th className="px-6 py-3 text-left">{t.id}</th>
                            <th className="px-6 py-3 text-left">{t.reference}</th>
                            <th className="px-6 py-3 text-left">{t.name}</th>
                            {userRole === 'admin' && <th className="px-6 py-3 text-left">{t.creator}</th>}
                            <th className="px-6 py-3 text-left">{t.creationDate}</th>
                            <th className="px-6 py-3 text-left">{t.dueDate}</th>
                            <th className="px-6 py-3 text-left">{t.privacy}</th>
                            <th className="px-6 py-3 text-left">{t.status}</th>
                            <th className="px-6 py-3 text-left">{t.viewShare}</th>
                            <th className="px-6 py-3 text-left">{t.documents}</th>
                            <th className="px-6 py-3 text-left">{t.action}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredLists.length > 0 ?
                            (filteredLists.map((list, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 w-[50px]">{index + 1}</td>
                                    <td className="px-6 py-4 w-[100px] truncate">{list.reference}</td>
                                    <td className="px-6 py-4 max-w-[150px] truncate" title={list.name}>{list.name}</td>
                                    {userRole === 'admin' && <td className="px-6 py-4 w-[120px] truncate" title={list.creator}>{list.creator}</td>}
                                    <td className="px-6 py-4 w-[120px]">{list.creationDate}</td>
                                    <td className="px-6 py-4 w-[120px]">{list.dueDate}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${list.isPublic ? 'bg-teal-100 text-teal-800' : 'bg-purple-100 text-purple-800'}`}>
                                            {list.isPublic ? t.public : t.private}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${list.status === t.active ? 'bg-green-100 text-green-800' : list.status === t.completed ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                                            {list.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex items-center justify-center space-x-3">
                                            <button className="text-[#36A9E1] hover:text-[#008da0]" onClick={() => openViewModal(list)} title={t.viewDetails}><FiEye size={22} /></button>
                                            <button className="text-indigo-600 hover:text-indigo-900" onClick={() => { const url = `${window.location.origin}/listas-de-nacimiento/${list.id}`; navigator.clipboard.writeText(url).then(() => toast.success(t.linkCopied)).catch(() => toast.error(t.linkCopyError)); }} title={t.copyLink}><FiLink size={22} /></button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex items-center justify-center space-x-3">
                                            <button className="text-green-600 hover:text-green-900" onClick={() => handleDownloadPDF(list)} title={t.downloadPDF}><FiDownload size={22} /></button>
                                            <button className="text-blue-600 hover:text-blue-900" onClick={() => handlePrintPDF(list)} title={t.printList}><FiPrinter size={22} /></button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex items-center justify-center space-x-3">
                                            <button className="text-yellow-600 hover:text-yellow-900" onClick={() => openEditModal(list)} title={t.editList}><FiEdit size={22} /></button>
                                            <button className="text-purple-600 hover:text-purple-900" onClick={() => openStatusModal(list)} title={t.changeStatus}><FiToggleLeft size={22} /></button>
                                            <button className="text-red-600 hover:text-red-900" onClick={() => openDeleteModal(list)} title={t.deleteList}><FiTrash2 size={22} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )
                            )
                            ) : (
                                <tr>
                                    <td colSpan={userRole === 'admin' ? 11 : 10} className="px-6 py-4 text-center text-gray-500">
                                        {t.noLists}
                                    </td>
                                </tr>)}
                    </tbody>
                </table>
            </div>{/* Using modular components for modals */}
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
                onStatusChange={(newStatus) => {
                    // Update the selected list status
                    if (selectedList) {
                        selectedList.status = newStatus;
                        // Call onUpdate to refresh parent component
                        if (onUpdate) {
                            onUpdate();
                        }
                    }
                }}
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