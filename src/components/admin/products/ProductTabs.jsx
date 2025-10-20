'use client';
import { useState } from 'react';
import ProductsTable from '@/components/admin/products/ProductsTable';
import StockManagement from '@/components/admin/products/StockManagement';
import BrandsTable from '@/components/admin/products/BrandsTable';
import CategoriesTree from '@/components/admin/products/CategoriesTree';
import TabNavigation from '@/components/admin/shared/TabNavigation';
export default function ProductTabs() {
    const [activeTab, setActiveTab] = useState('Productes');
    const tabs = ['Productes', 'Categories', 'Estocs', 'Marques']; //, 'Descomptes'
    return (
        <div>
            {/* Tabs Navigation */}
            <TabNavigation
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />
            {/* Content Switching */}
            {activeTab === 'Productes' && <ProductsTable />}
            {activeTab === 'Categories' && <CategoriesTree />}
            {activeTab === 'Estocs' && <StockManagement />}
            {activeTab === 'Marques' && <BrandsTable />}
        </div>
    );
}
