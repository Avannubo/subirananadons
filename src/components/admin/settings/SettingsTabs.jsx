"use client";
import { useState } from "react";
import TransportistasTab from "@/components/admin/settings/tabs/TransportistasTab";
import PagoTab from "@/components/admin/settings/tabs/PagoTab";
import ConfiguracionTab from "@/components/admin/settings/tabs/ConfiguracionTab";
import PedidosTab from "@/components/admin/settings/tabs/PedidosTab";
import ProductosTab from "@/components/admin/settings/tabs/ProductosTab";
import InformacionTab from "@/components/admin/settings/tabs/InformacionTab";
import EmailTab from "@/components/admin/settings/tabs/EmailTab";
import EquipoTab from "@/components/admin/settings/tabs/EquipoTab";

export default function SettingsTabs() {
    const [activeTab, setActiveTab] = useState('transportistas');

    const tabs = [
        { id: 'transportistas', label: 'Transportistas' },
        // { id: 'preferencias', label: 'Preferencias' },
        { id: 'pago', label: 'Pago' },
        { id: 'configuracion', label: 'Configuración' },
        { id: 'pedidos', label: 'Configuración de Pedidos' },
        { id: 'productos', label: 'Configuración de Productos' },
        // { id: 'informacion', label: 'Información' },
        // { id: 'rendimiento', label: 'Rendimiento' },
        // { id: 'administracion', label: 'Administración' },
        { id: 'email', label: 'Dirección de correo electrónico' },
        // { id: 'importar', label: 'Importar' },
        { id: 'equipo', label: 'Equipo' }
    ];

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="flex overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === tab.id ? 'border-b-2 border-[#00B0C8] text-[#00a4b9]' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
                {activeTab === 'transportistas' && <TransportistasTab />} 
                {activeTab === 'pago' && <PagoTab />}
                {activeTab === 'configuracion' && <ConfiguracionTab />}
                {activeTab === 'pedidos' && <PedidosTab />}
                {activeTab === 'productos' && <ProductosTab />}
                {activeTab === 'informacion' && <InformacionTab />}  
                {activeTab === 'email' && <EmailTab />} 
                {activeTab === 'equipo' && <EquipoTab />}
            </div>
        </div>
    );
}