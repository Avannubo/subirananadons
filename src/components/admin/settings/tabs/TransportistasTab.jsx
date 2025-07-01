import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
export default function TransportistasTab() {
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
    if (loading) return <div className="p-4">Cargando...</div>;
    return (
        <div className="space-y-12">
            {/* <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            /> */}
            <div className="overflow-x-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Transportistas</h2>
                    <button
                        onClick={handleNewCarrier}
                        className="bg-[#00B0C8] text-white px-4 py-2 rounded hover:bg-[#00b1c8ad]"
                    >
                        Nuevo Transportista
                    </button>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logotipo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retraso</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Envío gratis</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posición</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
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
                                        {t.estado ? 'Activo' : 'Inactivo'}
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
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCarrier(t._id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* <div>
                <h2 className="text-xl font-semibold mb-4">Preferencias</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-medium mb-3">Manipulación</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gastos de manipulación y gestión</label>
                                <div className="flex">
                                    <input
                                        type="number"
                                        name="gastosManipulacion"
                                        value={preferences.gastosManipulacion}
                                        onChange={handlePreferenceChange}
                                        className="border border-gray-200 rounded-l px-3 py-2 w-full"
                                        step="0.01"
                                    />
                                    <span className="bg-gray-200 px-3 py-2 rounded-r text-nowrap">€ (impuestos excl.)</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Envío gratuito a partir de</label>
                                <div className="flex">
                                    <input
                                        type="number"
                                        name="minimoEnvioGratis"
                                        value={preferences.minimoEnvioGratis}
                                        onChange={handlePreferenceChange}
                                        className="border border-gray-200 rounded-l px-3 py-2 w-full"
                                        step="0.1"
                                    />
                                    <span className="bg-gray-200 px-3 py-2 rounded-r">€</span>
                                </div>
                            </div>
                            {/* <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Envío gratuito a partir de</label>
                                <div className="flex">
                                    <input
                                        type="number"
                                        name="minimoPesoGratis"
                                        value={preferences.minimoPesoGratis}
                                        onChange={handlePreferenceChange}
                                        className="border border-gray-200 rounded-l px-3 py-2 w-full"
                                    />
                                    <span className="bg-gray-200 px-3 py-2 rounded-r">kg</span>
                                </div>
                            </div>  
                        </div>
                    </div>
                    <div className="p-4 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-medium mb-3">Opciones del transportista</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Transportista predeterminado</label>
                                <select
                                    name="transportistaPredeterminado"
                                    value={preferences.transportistaPredeterminado}
                                    onChange={handlePreferenceChange}
                                    className="border border-gray-200 rounded w-full px-3 py-2"
                                >
                                    <option value="">Seleccionar transportista</option>
                                    {transportistas.map(t => (
                                        <option key={t._id} value={t._id}>{t.nombre}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Transportista por defecto de tu tienda.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
                                <select
                                    name="ordenarPor"
                                    value={preferences.ordenarPor}
                                    onChange={handlePreferenceChange}
                                    className="border border-gray-200 rounded w-full px-3 py-2"
                                >
                                    <option value="precio">Precio</option>
                                    <option value="nombre">Nombre</option>
                                    <option value="posicion">Posición</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Esto solo será visible en el Front.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
                                <select
                                    name="ordenDireccion"
                                    value={preferences.ordenDireccion}
                                    onChange={handlePreferenceChange}
                                    className="border border-gray-200 rounded w-full px-3 py-2"
                                >
                                    <option value="ascendente">Ascendente</option>
                                    <option value="descendente">Descendente</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Esto solo será visible en el Front.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-6">
                    <button
                        onClick={handleSavePreferences}
                        className="bg-[#00B0C8] text-white px-4 py-2 rounded hover:bg-[#00b1c8ad]"
                    >
                        Guardar Preferencias
                    </button>
                </div>
            </div >  
            */
}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-[#00000050] bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium mb-4">
                            {editingCarrier._id ? 'Editar Transportista' : 'Nuevo Transportista'}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    value={editingCarrier.nombre}
                                    onChange={(e) => setEditingCarrier({ ...editingCarrier, nombre: e.target.value })}
                                    className="border border-gray-200 rounded px-3 py-2 w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">URL del Logotipo</label>
                                <input
                                    type="text"
                                    value={editingCarrier.logo}
                                    onChange={(e) => setEditingCarrier({ ...editingCarrier, logo: e.target.value })}
                                    className="border border-gray-200 rounded px-3 py-2 w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje de Retraso</label>
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
                                <label htmlFor="estado" className="text-sm font-medium text-gray-700">Activo</label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="envioGratis"
                                    checked={editingCarrier.envioGratis || false}
                                    onChange={(e) => setEditingCarrier({ ...editingCarrier, envioGratis: e.target.checked })}
                                    className="mr-2"
                                />
                                <label htmlFor="envioGratis" className="text-sm font-medium text-gray-700">Envío Gratis</label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mínimo para envío gratis (€)</label>
                                <input
                                    type="number"
                                    value={editingCarrier.minimoEnvioGratis || 0}
                                    onChange={(e) => setEditingCarrier({ ...editingCarrier, minimoEnvioGratis: parseFloat(e.target.value) || 0 })}
                                    className="border border-gray-200 rounded px-3 py-2 w-full"
                                    step="0.01"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mínimo peso para envío gratis (kg)</label>
                                <input
                                    type="number"
                                    value={editingCarrier.minimoPesoGratis || 0}
                                    onChange={(e) => setEditingCarrier({ ...editingCarrier, minimoPesoGratis: parseFloat(e.target.value) || 0 })}
                                    className="border border-gray-200 rounded px-3 py-2 w-full"
                                    step="0.1"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingCarrier(null);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleSaveCarrier(editingCarrier)}
                                className="bg-[#00B0C8] text-white px-4 py-2 rounded hover:bg-[#00b1c8ad]"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}