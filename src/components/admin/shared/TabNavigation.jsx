'use client';

export default function TabNavigation({ tabs, activeTab, setActiveTab, counts }) {
    return (
        <div className="flex flex-wrap overflow-x-auto border-b border-gray-200">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === tab
                        ? 'border-b-2 border-[#00B0C8] text-[#00B0C8] bg-blue-50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
} 