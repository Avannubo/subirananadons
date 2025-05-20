'use client';
import { useState } from 'react';
import { FiList, FiPackage, FiBarChart2 } from 'react-icons/fi';
import ProductsTable from './ProductsTable';
import StockManagement from './StockManagement';
import ProductsStats from './ProductsStats';
import TabNavigation from '@/components/admin/shared/TabNavigation';

export default function ProductsTabs() {
    const [activeTab, setActiveTab] = useState('Productos');

    const tabConfig = [
        {
            name: 'Productos',
            icon: <FiList className="mr-2" />,
            component: <ProductsTable />
        },
        {
            name: 'Stock',
            icon: <FiPackage className="mr-2" />,
            component: <StockManagement />
        },
        {
            name: 'Estadísticas',
            icon: <FiBarChart2 className="mr-2" />,
            component: <ProductsStats />
        }
    ];

    // Format tabs for the TabNavigation component
    const tabs = tabConfig.map(tab => tab.name);

    // Get the current component based on active tab
    const activeComponent = tabConfig.find(tab => tab.name === activeTab)?.component || null;

    return (
        <div className="w-full">
            <TabNavigation
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            <div className="mt-4">
                {activeComponent}
            </div>
        </div>
    );
} 