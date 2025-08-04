"use client";
import { useState } from "react";
import { useLocale } from 'next-intl';
import TransportistasTab from "@/components/admin/settings/tabs/TransportistasTab";
import OffersTab from "@/components/admin/settings/tabs/OffersTab";
import SliderTab from "@/components/admin/settings/tabs/SliderTab";
import BannerTab from "@/components/admin/settings/tabs/BannerTab";
import RecomendationTab from "@/components/admin/settings/tabs/RecomendationTab";
import TextosLegalesTab from "@/components/admin/settings/tabs/TextosLegalesTab";
import ParametersTab from "@/components/admin/settings/tabs/ParametersTab";
import EquipoTab from "@/components/admin/settings/tabs/EquipoTab";
import TabNavigation from "@/components/admin/shared/TabNavigation";
export default function SettingsTabs() {
    const [activeTab, setActiveTab] = useState('transportistas');
    const locale = useLocale();
    const tabs = [
        { id: 'transportistas', label: locale === 'ca' ? 'Transportistes' : 'Transportistas' },
        { id: 'slider', label: locale === 'ca' ? 'Slider Portada' : 'Slider Portada' },
        { id: 'images', label: locale === 'ca' ? 'Ofertes' : 'Ofertas' },
        { id: 'banner', label: locale === 'ca' ? 'Banner' : 'Banner' },
        { id: 'recomendation', label: locale === 'ca' ? 'Recomanacions' : 'Recomendaciones' },
        { id: 'politicas', label: locale === 'ca' ? 'Textos Legals' : 'Textos Legales' },
        { id: 'parameters', label: locale === 'ca' ? 'Paràmetres' : 'Parametros' },
        // { id: 'rendimiento', label: locale === 'ca' ? 'Rendiment' : 'Rendimiento' },
        // { id: 'administracion', label: locale === 'ca' ? 'Administració' : 'Administración' },
        // { id: 'email', label: locale === 'ca' ? 'Adreça electrònica' : 'Dirección de correo electrónico' },
        // { id: 'importar', label: locale === 'ca' ? 'Importar' : 'Importar' },
        // { id: 'equipo', label: locale === 'ca' ? 'Equip' : 'Equipo' }
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
                {activeTab === 'parameters' && <ParametersTab />}
                {/*{activeTab === 'equipo' && <EquipoTab />}
                */}
            </div>
        </div>
    );
}