"use client";
import { useState } from "react";
import TransportistasTab from "@/components/admin/settings/tabs/TransportistasTab";
import OffersTab from "@/components/admin/settings/tabs/OffersTab";
import SliderTab from "@/components/admin/settings/tabs/SliderTab";
import BannerTab from "@/components/admin/settings/tabs/BannerTab";
import RecomendationTab from "@/components/admin/settings/tabs/RecomendationTab";
import TextosLegalesTab from "@/components/admin/settings/tabs/TextosLegalesTab";
import EmailTab from "@/components/admin/settings/tabs/EmailTab";
import EquipoTab from "@/components/admin/settings/tabs/EquipoTab";
import TabNavigation from "@/components/admin/shared/TabNavigation";
export default function SettingsTabs() {
    const [activeTab, setActiveTab] = useState('transportistas');
    const tabs = [
        { id: 'transportistas', label: 'Transportistas' },
        { id: 'slider', label: 'Slider Conf.' },
        { id: 'images', label: 'Ofertas Conf.' },
        { id: 'banner', label: 'Banner Img.' },
        { id: 'recomendation', label: 'Recomendation Conf.' },
        { id: 'politicas', label: 'Textos de politicas' },
        // { id: 'informacion', label: 'Información' },
        // { id: 'rendimiento', label: 'Rendimiento' },
        // { id: 'administracion', label: 'Administración' },
        // { id: 'email', label: 'Dirección de correo electrónico' },
        // { id: 'importar', label: 'Importar' },
        //{ id: 'equipo', label: 'Equipo' }
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
                {activeTab === 'slider' && <SliderTab />}
                {activeTab === 'images' && <OffersTab />}
                {activeTab === 'banner' && <BannerTab />}
                {activeTab === 'recomendation' && <RecomendationTab />}
                {activeTab === 'politicas' && <TextosLegalesTab />}
                {/*{activeTab === 'email' && <EmailTab />}
                {activeTab === 'equipo' && <EquipoTab />}
                */}
            </div>
        </div>
    );
}