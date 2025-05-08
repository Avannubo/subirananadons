'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const ClientStatsContext = createContext();

export function ClientStatsProvider({ children, refreshInterval = 30000 }) {
    const [stats, setStats] = useState({
        totalClients: 0,
        activeClients: 0,
        inactiveClients: 0,
        newsletterSubscribers: 0,
        partnerOffersSubscribers: 0,
        averageAge: 0,
        ordersPerClient: 0
    });
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch stats from the API
    const fetchStats = useCallback(async (showLoading = true, showToast = true) => {
        try {
            if (showLoading) {
                setRefreshing(true);
            }

            const response = await fetch('/api/clients/stats');
            if (!response.ok) {
                throw new Error('Failed to fetch client stats');
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch client stats');
            }

            // Check if data has changed
            const hasChanged = JSON.stringify(data.stats) !== JSON.stringify(stats);

            if (hasChanged) {
                setStats(data.stats);
                setLastUpdated(new Date());
            } else if (showToast) {
                toast.success('Estadísticas de clientes ya actualizadas');
            }

            return hasChanged;
        } catch (error) {
            console.error('Error fetching client stats:', error);
            if (showLoading && showToast) {
                toast.error('Error al cargar estadísticas de clientes');
            }
            return false;
        } finally {
            if (showLoading) {
                setRefreshing(false);
                setLoading(false);
            }
        }
    }, [stats]);

    // Initial load
    useEffect(() => {
        fetchStats(true, false);
    }, [fetchStats]);

    // Set up polling
    useEffect(() => {
        if (!refreshInterval) return;

        const intervalId = setInterval(() => {
            fetchStats(false, false);
        }, refreshInterval);

        return () => clearInterval(intervalId);
    }, [fetchStats, refreshInterval]);

    // Manually trigger refresh
    const refreshStats = useCallback(() => {
        if (refreshing) return Promise.resolve(false);
        return fetchStats(true, true);
    }, [fetchStats, refreshing]);

    // Notify context when changes happen (used when client updates occur)
    const notifyChange = useCallback(() => {
        return fetchStats(true, false);
    }, [fetchStats]);

    // Value to be provided by the context
    const value = {
        stats,
        loading,
        refreshing,
        lastUpdated,
        refreshStats,
        notifyChange
    };

    return (
        <ClientStatsContext.Provider value={value}>
            {children}
        </ClientStatsContext.Provider>
    );
}

// Custom hook to use the client stats context
export function useClientStats() {
    const context = useContext(ClientStatsContext);

    if (!context) {
        throw new Error('useClientStats must be used within a ClientStatsProvider');
    }

    return context;
} 