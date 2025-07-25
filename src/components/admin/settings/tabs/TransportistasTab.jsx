import { useState, useEffect, useRef } from 'react';
import ImageSelector from '@/components/admin/shared/ImageSelector';
import { toast } from 'react-hot-toast';
import { useLocale } from 'next-intl';
export default function TransportistasTab() {
    const locale = useLocale();
    const [transportistas, setTransportistas] = useState([]);
    const [preferences, setPreferences] = useState({
        gastosManipulacion: 2.00,
        minimoEnvioGratis: 0,
        minimoPesoGratis: 0,
        transportistaPredeterminado: '',
        ordenarPor: 'posicion',
        ordenDireccion: 'ascendente'
    });
    const [loading, setLoading] = useState(true);
    const [editingCarrier, setEditingCarrier] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    // Image upload state for edit modal
    const [imagePreview, setImagePreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showImageSelector, setShowImageSelector] = useState(false);
    const fileInputRef = useRef(null);

    // Handlers for image upload/drag
    const handleImageClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };
    const handleImageUpload = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setImagePreview(ev.target.result);
                setEditingCarrier(prev => ({ ...prev, logo: ev.target.result }));
            };
            reader.readAsDataURL(file);
        }
    };
    const handleRemoveImage = () => {
        setImagePreview(null);
        setEditingCarrier(prev => ({ ...prev, logo: '' }));
    };
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files && e.dataTransfer.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setImagePreview(ev.target.result);
                setEditingCarrier(prev => ({ ...prev, logo: ev.target.result }));
            };
            reader.readAsDataURL(file);
        }
    };
    useEffect(() => {
        fetchData();
    }, []);
    const fetchData = async () => {
        try {
            const response = await fetch('/api/carriers');
            const data = await response.json();
            setTransportistas(data.carriers || []);
            if (data.preferences) {
                setPreferences({
                    gastosManipulacion: data.preferences.gastosManipulacion || 2.00,
                    minimoEnvioGratis: data.preferences.minimoEnvioGratis || 0,
                    minimoPesoGratis: data.preferences.minimoPesoGratis || 0,
                    transportistaPredeterminado: data.preferences.transportistaPredeterminado || '',
                    ordenarPor: data.preferences.ordenarPor || 'posicion',
                    ordenDireccion: data.preferences.ordenDireccion || 'ascendente'
                });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };
    const handleSaveCarrier = async (carrierData) => {
        try {
            const dataToSend = {
                nombre: carrierData.nombre,
                logo: carrierData.logo || '',
                retraso: carrierData.retraso || '',
                estado: carrierData.estado !== undefined ? carrierData.estado : true,
                envioGratis: carrierData.envioGratis !== undefined ? carrierData.envioGratis : false,
                posicion: carrierData.posicion || transportistas.length + 1,
                minimoEnvioGratis: carrierData.minimoEnvioGratis || 0,
                minimoPesoGratis: carrierData.minimoPesoGratis || 0
            };

            const url = carrierData._id
                ? `/api/carriers/${carrierData._id}`
                : '/api/carriers';
            const method = carrierData._id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Error saving carrier');
            }

            setShowEditModal(false);
            setEditingCarrier(null);
            fetchData();
            toast.success('Transportista guardado correctamente');
        } catch (error) {
            console.error('Error saving carrier:', error);
            toast.error(error.message || 'Error al guardar el transportista');
        }
    };
    const handleDeleteCarrier = async (id) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este transportista?')) return;
        try {
            const response = await fetch(`/api/carriers/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Error deleting carrier');
            fetchData();
            toast.success('Transportista eliminado correctamente');
        } catch (error) {
            console.error('Error deleting carrier:', error);
            toast.error('Error al eliminar el transportista');
        }
    };
    const handleSavePreferences = async () => {
        try {
            const response = await fetch('/api/carriers/preferences', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(preferences),
            });
            if (!response.ok) throw new Error('Error saving preferences');
            toast.success('Preferencias guardadas correctamente');
        } catch (error) {
            console.error('Error saving preferences:', error);
            toast.error('Error al guardar las preferencias');
        }
    };
    const handleEditClick = (carrier) => {
        setEditingCarrier(carrier);
        setImagePreview(carrier.logo || null);
        setShowEditModal(true);
    };
    const handlePreferenceChange = (e) => {
        const { name, value } = e.target;
        setPreferences(prev => ({
            ...prev,
            [name]: name === 'gastosManipulacion' || name === 'minimoEnvioGratis' || name === 'minimoPesoGratis'
                ? parseFloat(value)
                : value
        }));
    };
    const handleNewCarrier = () => {
        setEditingCarrier({
            nombre: '',
            logo: '',
            retraso: '',
            estado: true,
            envioGratis: false,
            posicion: transportistas.length + 1,
            minimoEnvioGratis: 0,
            minimoPesoGratis: 0
        });
        setShowEditModal(true);
    };
    if (loading) return (
        <div className="p-6 bg-white rounded-xl">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 animate-pulse">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{locale === 'ca' ? 'Nom' : 'Nombre'}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{locale === 'ca' ? 'Logotip' : 'Logotipo'}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{locale === 'ca' ? 'Retard' : 'Retraso'}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{locale === 'ca' ? 'Estat' : 'Estado'}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{locale === 'ca' ? 'Enviament gratuït' : 'Envío gratis'}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{locale === 'ca' ? 'Posició' : 'Posición'}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{locale === 'ca' ? 'Accions' : 'Acciones'}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {[...Array(4)].map((_, i) => (
                            <tr key={i}>
                                <td className="px-6 py-4"><div className="h-4 w-8 bg-gray-200 rounded mx-auto" /></td>
                                <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded mx-auto" /></td>
                                <td className="px-6 py-4"><div className="h-10 w-16 bg-gray-200 rounded-lg mx-auto" /></td>
                                <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded mx-auto" /></td>
                                <td className="px-6 py-4"><div className="h-6 w-16 bg-gray-200 rounded-full mx-auto" /></td>
                                <td className="px-6 py-4"><div className="h-6 w-16 bg-gray-200 rounded-full mx-auto" /></td>
                                <td className="px-6 py-4"><div className="h-4 w-8 bg-gray-200 rounded mx-auto" /></td>
                                <td className="px-6 py-4"><div className="flex gap-2 justify-center"><div className="h-8 w-12 bg-gray-200 rounded-full" /><div className="h-8 w-12 bg-gray-200 rounded-full" /></div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
    return (
        <div className="space-y-12">
            <div className="overflow-x-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">{locale === 'ca' ? 'Transportistes' : 'Transportistas'}</h2>
                    <button
                        onClick={handleNewCarrier}
                        className="bg-[#00B0C8] text-white px-4 py-2 rounded hover:bg-[#00b1c8ad]"
                    >
                        {locale === 'ca' ? 'Nou Transportista' : 'Nuevo Transportista'}
                    </button>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{locale === 'ca' ? 'Nom' : 'Nombre'}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{locale === 'ca' ? 'Logotip' : 'Logotipo'}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{locale === 'ca' ? 'Retard' : 'Retraso'}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{locale === 'ca' ? 'Estat' : 'Estado'}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{locale === 'ca' ? 'Enviament gratuït' : 'Envío gratis'}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{locale === 'ca' ? 'Posició' : 'Posición'}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{locale === 'ca' ? 'Accions' : 'Acciones'}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {transportistas.map((t, index) => (
                            <tr key={t._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t.nombre}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {t.logo ? <img src={t.logo} alt="Logo" className="h-10" /> : '--'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.retraso}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${t.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {t.estado ? (locale === 'ca' ? 'Actiu' : 'Activo') : (locale === 'ca' ? 'Inactiu' : 'Inactivo')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${t.envioGratis ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {t.envioGratis ? 'Sí' : 'No'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.posicion}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => handleEditClick(t)}
                                        className="text-[#00B0C8] hover:text-[#00b1c8ad] mr-3"
                                    >
                                        {locale === 'ca' ? 'Editar' : 'Editar'}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCarrier(t._id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        {locale === 'ca' ? 'Eliminar' : 'Eliminar'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-[#00000050] bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium mb-4">
                            {editingCarrier._id
                                ? (locale === 'ca' ? 'Editar Transportista' : 'Editar Transportista')
                                : (locale === 'ca' ? 'Nou Transportista' : 'Nuevo Transportista')}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ca' ? 'Nom' : 'Nombre'}</label>
                                <input
                                    type="text"
                                    value={editingCarrier.nombre}
                                    onChange={(e) => setEditingCarrier({ ...editingCarrier, nombre: e.target.value })}
                                    className="border border-gray-200 rounded px-3 py-2 w-full"
                                />
                            </div>
                            {/* Logo image upload/selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Logotip</label>
                                <div className="flex flex-col items-center gap-2">
                                    <div
                                        className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer h-40 flex flex-col items-center justify-center ${isDragging
                                            ? 'border-[#00B0C8] bg-blue-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        onClick={handleImageClick}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                        />
                                        {imagePreview ? (
                                            <div className="relative h-full w-full flex items-center justify-center">
                                                <img
                                                    src={imagePreview}
                                                    alt="Previsualització del logotip"
                                                    className="max-h-full max-w-full object-contain"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                >
                                                    {/* You may need to import FiX from react-icons/fi */}
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                {/* You may need to import FiImage from react-icons/fi */}
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect width="20" height="14" x="2" y="5" rx="2" /><circle cx="8.5" cy="11.5" r="1.5" /><path d="M21 19l-5.5-5.5a2 2 0 0 0-2.8 0L3 19" /></svg>
                                                <span className="text-sm text-gray-500">
                                                    Arrossega i deixa anar una imatge o fes clic per seleccionar
                                                </span>
                                                <span className="text-xs text-gray-400 mt-1">
                                                    PNG, JPG, GIF fins a 5MB
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowImageSelector(true)}
                                        className="w-full px-4 py-2 text-white text-sm rounded-md bg-[#00B0C8] hover:bg-[#008A9B]"
                                    >
                                        Selecciona existent
                                    </button>
                                </div>
                                {showImageSelector && (
                                    <imgSelector
                                        onSelect={(url) => {
                                            setEditingCarrier(prev => ({ ...prev, logo: url }));
                                            setImagePreview(url);
                                            setShowImageSelector(false);
                                        }}
                                        onClose={() => setShowImageSelector(false)}
                                    />
                                )}
                            </div>
                            {/* End logo image upload/selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ca' ? 'Missatge de Retard' : 'Mensaje de Retraso'}</label>
                                <input
                                    type="text"
                                    value={editingCarrier.retraso}
                                    onChange={(e) => setEditingCarrier({ ...editingCarrier, retraso: e.target.value })}
                                    className="border border-gray-200 rounded px-3 py-2 w-full"
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="estado"
                                    checked={editingCarrier.estado}
                                    onChange={(e) => setEditingCarrier({ ...editingCarrier, estado: e.target.checked })}
                                    className="mr-2"
                                />
                                <label htmlFor="estado" className="text-sm font-medium text-gray-700">{locale === 'ca' ? 'Actiu' : 'Activo'}</label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="envioGratis"
                                    checked={editingCarrier.envioGratis || false}
                                    onChange={(e) => setEditingCarrier({ ...editingCarrier, envioGratis: e.target.checked })}
                                    className="mr-2"
                                />
                                <label htmlFor="envioGratis" className="text-sm font-medium text-gray-700">{locale === 'ca' ? 'Enviament Gratuït' : 'Envío Gratis'}</label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ca' ? 'Mínim per enviament gratuït (€)' : 'Mínimo para envío gratis (€)'}</label>
                                <input
                                    type="number"
                                    value={editingCarrier.minimoEnvioGratis || 0}
                                    onChange={(e) => setEditingCarrier({ ...editingCarrier, minimoEnvioGratis: parseFloat(e.target.value) || 0 })}
                                    className="border border-gray-200 rounded px-3 py-2 w-full"
                                    step="0.01"
                                />
                            </div>
                            {/* <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ca' ? 'Pes mínim per enviament gratuït (kg)' : 'Mínimo peso para envío gratis (kg)'}</label>
                                <input
                                    type="number"
                                    value={editingCarrier.minimoPesoGratis || 0}
                                    onChange={(e) => setEditingCarrier({ ...editingCarrier, minimoPesoGratis: parseFloat(e.target.value) || 0 })}
                                    className="border border-gray-200 rounded px-3 py-2 w-full"
                                    step="0.1"
                                />
                            </div> */}
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingCarrier(null);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                            >
                                {locale === 'ca' ? 'Cancel·lar' : 'Cancelar'}
                            </button>
                            <button
                                onClick={() => handleSaveCarrier(editingCarrier)}
                                className="bg-[#00B0C8] text-white px-4 py-2 rounded hover:bg-[#00b1c8ad]"
                            >
                                {locale === 'ca' ? 'Desar' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}