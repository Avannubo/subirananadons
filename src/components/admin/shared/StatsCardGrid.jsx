'use client';

export default function StatsCardGrid({ children, lastUpdated, refreshStats, refreshing }) {
    return (
        <div className="space-y-4 mb-6">
            {(lastUpdated || refreshStats) && (
                <div className="flex justify-between items-center">
                    {lastUpdated && (
                        <div className="text-sm text-gray-500">
                            <span>Última actualización: {lastUpdated}</span>
                        </div>
                    )}
                    {refreshStats && (
                        <button
                            onClick={refreshStats}
                            disabled={refreshing}
                            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                            <span>{refreshing ? 'Actualizando...' : 'Actualizar'}</span>
                        </button>
                    )}
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {children}
            </div>
        </div>
    );
} 