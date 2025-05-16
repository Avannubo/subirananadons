'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const ListStatsContext = createContext();

export function ListStatsProvider({ children, refreshInterval = 30000, userRole = 'user' }) {
    const [stats, setStats] = useState({
        totalLists: 0,
        activeLists: 0,
        completedLists: 0,
        canceledLists: 0,
        listsThisMonth: 0,
        activeListsThisMonth: 0,
        completedListsThisMonth: 0,
        canceledListsThisMonth: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [isListsAdminPage, setIsListsAdminPage] = useState(false);

    // Check if we're in an admin page that actually uses these stats
    useEffect(() => {
        const checkIfListsAdminPage = () => {
            const path = window.location.pathname;
            const isListsAdmin = path.includes('/admin') && path.includes('/birthlists');
            setIsListsAdminPage(isListsAdmin);
        };

        checkIfListsAdminPage();

        // Listen for route changes
        const handleRouteChange = () => checkIfListsAdminPage();
        window.addEventListener('popstate', handleRouteChange);

        return () => {
            window.removeEventListener('popstate', handleRouteChange);
        };
    }, []);

    // Fetch stats from the API
    const fetchStats = useCallback(async (showLoading = true, showToast = true) => {
        // Skip API call if user is not admin or not on the lists admin page
        if (userRole !== 'admin' || !isListsAdminPage) {
            setLoading(false);
            return false;
        }

        try {
            if (showLoading) {
                setRefreshing(true);
            }

            // Clear any previous errors
            setError(null);

            const response = await fetch('/api/birthlists/stats');
            if (!response.ok) {
                // Use default values instead of throwing error
                console.warn('List stats API not available or returned an error, using fallback data');

                const fallbackData = {
                    totalLists: 0,
                    activeLists: 0,
                    completedLists: 0,
                    canceledLists: 0,
                    listsThisMonth: 0,
                    activeListsThisMonth: 0,
                    completedListsThisMonth: 0,
                    canceledListsThisMonth: 0
                };

                setStats(fallbackData);
                setLastUpdated(new Date());
                return false;
            }

            const data = await response.json();

            if (!data.success) {
                // Use default values instead of throwing error
                console.warn('List stats API returned unsuccessful response, using fallback data');

                const fallbackData = {
                    totalLists: 0,
                    activeLists: 0,
                    completedLists: 0,
                    canceledLists: 0,
                    listsThisMonth: 0,
                    activeListsThisMonth: 0,
                    completedListsThisMonth: 0,
                    canceledListsThisMonth: 0
                };

                setStats(fallbackData);
                setLastUpdated(new Date());
                return false;
            }

            // Check if data has changed
            const hasChanged = JSON.stringify(data.stats) !== JSON.stringify(stats);

            if (hasChanged) {
                setStats(data.stats);
                setLastUpdated(new Date());
            } else if (showToast) {
                toast.success('Estadísticas de listas ya actualizadas');
            }

            return hasChanged;
        } catch (error) {
            console.error('Error fetching list statistics:', error);
            setError(error.message || 'Error desconocido al cargar estadísticas');

            if (showLoading && showToast) {
                toast.error(`Error al cargar estadísticas de listas: ${error.message}`);
            }
            return false;
        } finally {
            if (showLoading) {
                setRefreshing(false);
                setLoading(false);
            }
        }
    }, [stats, userRole, isListsAdminPage]);

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

    // Notify context when changes happen (used when list updates occur)
    const notifyChange = useCallback(() => {
        return fetchStats(true, false);
    }, [fetchStats]);

    // Format the last updated time
    const formatLastUpdated = useCallback(() => {
        if (!lastUpdated) return '';

        return new Intl.DateTimeFormat('es', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(lastUpdated);
    }, [lastUpdated]);

    // Value to be provided by the context
    const value = {
        stats,
        loading,
        refreshing,
        lastUpdated,
        formatLastUpdated,
        refreshStats,
        notifyChange,
        error
    };

    return (
        <ListStatsContext.Provider value={value}>
            {children}
        </ListStatsContext.Provider>
    );
}

// Custom hook to use the list stats context
export function useListStats() {
    const context = useContext(ListStatsContext);

    if (!context) {
        throw new Error('useListStats must be used within a ListStatsProvider');
    }

    return context;
} 