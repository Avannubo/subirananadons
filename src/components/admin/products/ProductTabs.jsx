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
    const [activeTab, setActiveTab] = useState('Productos');
    const tabs = ['Productos', 'Categorías', 'Stocks', 'Marcas']; //, 'Descuentos'

    return (
        <div>
            {/* Tabs Navigation */}
            <TabNavigation
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            {/* Content Switching */}
            {activeTab === 'Productos' && <ProductsTable products={products} />}
            {activeTab === 'Categorías' && <CategoriesTree />}
            {activeTab === 'Stocks' && <StockManagement products={products} />}
            {activeTab === 'Marcas' && <BrandsTable brands={brands} />}
            {activeTab === 'Descuentos' && (
                <div className="text-gray-500 italic">Descuentos: Próximamente...</div>
            )}
        </div>
    );
}
