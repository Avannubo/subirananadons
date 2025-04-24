'use client'

import { SessionProvider } from 'next-auth/react'
import { CartProvider } from '@/contexts/CartContext'
import { UserProvider } from '@/contexts/UserContext'
import { Toaster } from 'react-hot-toast'

export function Providers({ children }) {
    return (
        <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
            <UserProvider>
                <CartProvider>
                    {children}
                </CartProvider>
            </UserProvider>
            <Toaster position="bottom-right" />
        </SessionProvider>
    )
} 