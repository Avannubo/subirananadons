'use client';
import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { FiList, FiPackage, FiBarChart2 } from 'react-icons/fi';
import ProductsTable from './ProductsTable';
import StockManagement from './StockManagement';
import ProductsStats from './ProductsStats';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function ProductsTabs() {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const tabs = [
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

    return (
        <div className="w-full">
            <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
                <Tab.List className="flex space-x-2 rounded-t-lg bg-blue-50 p-1 mb-4">
                    {tabs.map((tab, index) => (
                        <Tab
                            key={index}
                            className={({ selected }) =>
                                classNames(
                                    'w-full py-2.5 text-sm font-medium leading-5 flex items-center justify-center outline-none transition-all duration-150',
                                    selected
                                        ? 'bg-white rounded-t shadow text-[#00B0C8] border-t border-l border-r border-gray-200'
                                        : 'text-gray-600 hover:text-[#00B0C8] hover:bg-white/[0.35]'
                                )
                            }
                        >
                            {tab.icon}
                            {tab.name}
                        </Tab>
                    ))}
                </Tab.List>
                <Tab.Panels className="mt-2">
                    {tabs.map((tab, index) => (
                        <Tab.Panel key={index}>
                            {tab.component}
                        </Tab.Panel>
                    ))}
                </Tab.Panels>
            </Tab.Group>
        </div>
    );
} 