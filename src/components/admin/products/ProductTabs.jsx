'use client';
import { useState } from 'react';
import ProductsTable from '@/components/admin/products/ProductsTable';
import StockManagement from '@/components/admin/products/StockManagement';
import BrandsTable from '@/components/admin/products/BrandsTable';
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
    const tabs = ['Productos', 'Stocks', 'Marcas']; //, 'Descuentos'
    return (
        <div>
            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-200 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-medium text-sm ${activeTab === tab
                            ? 'border-b-2 border-blue-500 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            {/* Content Switching */}
            {activeTab === 'Productos' && <ProductsTable products={products} />}
            {activeTab === 'Stocks' && <StockManagement products={products} />}
            {activeTab === 'Marcas' && <BrandsTable brands={brands} />}
            {activeTab === 'Descuentos' && (
                <div className="text-gray-500 italic">Descuentos: Próximamente...</div>
            )}
        </div>
    );
}
