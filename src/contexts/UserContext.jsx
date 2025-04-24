'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

// Create context
const UserContext = createContext();

export function UserProvider({ children }) {
    const { data: session, status, update: updateSession } = useSession();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize user data from session whenever session changes
    useEffect(() => {
        if (session?.user) {
            setUserData(session.user);
        } else if (status === 'unauthenticated') {
            setUserData(null);
        }

        if (status !== 'loading') {
            setLoading(false);
        }
    }, [session, status]);

    // Function to update user data globally
    const updateUserData = async (newUserData) => {
        try {
            setLoading(true);

            // Update session with new user data
            await updateSession({
                ...session,
                user: {
                    ...session.user,
                    ...newUserData
                }
            });

            // Update local state
            setUserData(prev => ({
                ...prev,
                ...newUserData
            }));

            return true;
        } catch (error) {
            console.error('Error updating user data:', error);
            toast.error('Failed to update user data');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Function to refresh user data from server
    const refreshUserData = async () => {
        if (!session?.user?.id) return;

        try {
            setLoading(true);
            const response = await fetch('/api/user/profile');

            if (!response.ok) {
                throw new Error('Failed to refresh user data');
            }

            const data = await response.json();

            // Update session
            await updateSession({
                ...session,
                user: {
                    ...session.user,
                    ...data.user
                }
            });

            // Update local state
            setUserData(prev => ({
                ...prev,
                ...data.user
            }));

            console.log('User data refreshed from server');
        } catch (error) {
            console.error('Error refreshing user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user: userData,
        loading,
        updateUser: updateUserData,
        refreshUser: refreshUserData
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

// Custom hook to use the user context
export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
} 