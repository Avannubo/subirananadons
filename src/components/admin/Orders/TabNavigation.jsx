import React from 'react';

export default function TabNavigation({ tabs = [], activeTab, setActiveTab, counts = {} }) {
    return (
        <nav className="flex space-x-2 mb-4">
            {tabs.map(tab => (
                <button
                    key={tab}
                    className={`px-4 py-2 rounded ${activeTab === tab ? 'bg-[#00B0C8] text-white' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => setActiveTab(tab)}
                >
                    {tab} {counts[tab] !== undefined ? `(${counts[tab]})` : ''}
                </button>
            ))}
        </nav>
    );
}
