'use client'

import { SessionProvider } from 'next-auth/react'
import { CartProvider } from '@/contexts/CartContext'
import { Toaster } from 'react-hot-toast'

export function Providers({ children }) {
    return (
        <SessionProvider refetchInterval={0}>
            <CartProvider>
                {children}
            </CartProvider>
            <Toaster position="bottom-right" />
        </SessionProvider>
    )
} 