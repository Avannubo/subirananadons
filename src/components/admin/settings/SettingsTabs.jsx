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
import TabNavigation from "@/components/admin/shared/TabNavigation";

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

    // Format tabs for the TabNavigation component
    const tabNavItems = tabs.map(tab => tab.label);

    // Handle tab click for object-based tabs
    const handleTabChange = (label) => {
        const tab = tabs.find(t => t.label === label);
        if (tab) {
            setActiveTab(tab.id);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <TabNavigation
                    tabs={tabNavItems}
                    activeTab={tabs.find(t => t.id === activeTab)?.label || ''}
                    setActiveTab={handleTabChange}
                />
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