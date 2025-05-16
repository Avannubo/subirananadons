'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const StatsContext = createContext();

export function StatsProvider({ children, refreshInterval = 30000 }) {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalCategories: 0,
        totalBrands: 0,
        lowStockProducts: 0
    });
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [isAdminPage, setIsAdminPage] = useState(false);

    // Check if we're in an admin page that actually uses these stats
    useEffect(() => {
        const checkIfAdminPage = () => {
            const path = window.location.pathname;
            const isAdmin = path.includes('/admin') && path.includes('/products');
            setIsAdminPage(isAdmin);
        };

        checkIfAdminPage();

        // Listen for route changes
        const handleRouteChange = () => checkIfAdminPage();
        window.addEventListener('popstate', handleRouteChange);

        return () => {
            window.removeEventListener('popstate', handleRouteChange);
        };
    }, []);

    // Fetch stats from the API
    const fetchStats = useCallback(async (showLoading = true, showToast = true) => {
        // Skip stats fetching if not on admin product page
        if (!isAdminPage) {
            if (showLoading) {
                setLoading(false);
            }
            return false;
        }

        try {
            if (showLoading) {
                setRefreshing(true);
            }

            const response = await fetch('/api/stats/products');
            if (!response.ok) {
                // Provide default data instead of throwing error
                console.warn('Stats API not available, using fallback data');
                const fallbackData = {
                    totalProducts: 0,
                    totalCategories: 0,
                    totalBrands: 0,
                    lowStockProducts: 0
                };

                setStats(fallbackData);
                setLastUpdated(new Date());
                return false;
            }

            const data = await response.json();

            // Check if data has changed
            const hasChanged = JSON.stringify(data) !== JSON.stringify(stats);

            if (hasChanged) {
                setStats(data);
                setLastUpdated(new Date());
            } else if (showToast) {
                toast.success('Statistics are already up to date');
            }

            return hasChanged;
        } catch (error) {
            console.error('Error fetching stats:', error);
            if (showLoading && showToast) {
                toast.error('Error loading product statistics');
            }
            return false;
        } finally {
            if (showLoading) {
                setRefreshing(false);
                setLoading(false);
            }
        }
    }, [stats, isAdminPage]);

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

    // Notify context when changes happen (used when product updates occur)
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
        <StatsContext.Provider value={value}>
            {children}
        </StatsContext.Provider>
    );
}

// Custom hook to use the stats context
export function useStats() {
    const context = useContext(StatsContext);

    if (!context) {
        throw new Error('useStats must be used within a StatsProvider');
    }

    return context;
} 