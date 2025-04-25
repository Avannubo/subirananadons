'use client'

import { SessionProvider } from 'next-auth/react'
import { CartProvider } from '@/contexts/CartContext'
import { UserProvider } from '@/contexts/UserContext'
import { StatsProvider } from '@/contexts/StatsContext'
import { Toaster } from 'react-hot-toast'

export function Providers({ children }) {
    return (
        <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
            <UserProvider>
                <CartProvider>
                    <StatsProvider>
                        {children}
                    </StatsProvider>
                </CartProvider>
            </UserProvider>
            <Toaster position="bottom-right" />
        </SessionProvider>
    )
} 