'use client';
import { useState } from 'react';
import ProductsTable from '@/components/admin/products/ProductsTable';
import StockManagement from '@/components/admin/products/StockManagement';
import BrandsTable from '@/components/admin/products/BrandsTable';
import CategoriesTree from '@/components/admin/products/CategoriesTree';
import TabNavigation from '@/components/admin/shared/TabNavigation';

const brands = [
    { id: 212, name: '7AM', products: 2 },
    { id: 196, name: 'Angelcare', products: 2 },
    { id: 257, name: 'Axkid', products: 5 },
    { id: 238, name: 'Baby Brezza', products: 3 },
];

const products = [
    {
        id: 9256,
        image: '/assets/images/joolz.png',
        name: 'Máx.',
        reference: 'TEST',
        category: 'Inicio',
        price_excl_tax: '0,00 €',
        price_incl_tax: '0,00 €',
        status: 'active'
    },
    {
        id: 9606,
        image: '/assets/images/joie.png',
        name: 'Gorro Jirafa',
        reference: 'P',
        category: 'Ropa bebé',
        price_excl_tax: '3,26 €',
        price_incl_tax: '3,95 €',
        status: 'active'
    },
];

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
            {activeTab === 'Productes' && <ProductsTable products={products} />}
            {activeTab === 'Categories' && <CategoriesTree />}
            {activeTab === 'Estocs' && <StockManagement products={products} />}
            {activeTab === 'Marques' && <BrandsTable brands={brands} />}
            {/* {activeTab === 'Descomptes' && (
                <div className="text-gray-500 italic">Descomptes: Aviat disponible...</div>
            )} */}
        </div>
    );
}
