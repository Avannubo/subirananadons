'use client'

import { SessionProvider, useSession } from 'next-auth/react'
import { UserProvider } from '@/contexts/UserContext'
import { StatsProvider } from '@/contexts/StatsContext'
import { ClientStatsProvider } from '@/contexts/ClientStatsContext'
import { ListStatsProvider } from '@/contexts/ListStatsContext'
import { Toaster } from 'react-hot-toast'

// Wrapper component that has access to session
function ListStatsWithAuth({ children }) {
    const { data: session } = useSession();
    const userRole = session?.user?.role || 'user';

    return (
        <ListStatsProvider userRole={userRole}>
            {children}
        </ListStatsProvider>
    );
}

export function Providers({ children }) {
    return (
        <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
            <UserProvider>
                <StatsProvider>
                    <ClientStatsProvider>
                        <ListStatsWithAuth>
                            {children}
                            <Toaster />
                        </ListStatsWithAuth>
                    </ClientStatsProvider>
                </StatsProvider>
            </UserProvider>
        </SessionProvider>
    );
}