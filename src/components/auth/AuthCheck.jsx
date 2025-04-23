'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthCheck({ children }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        console.log('AuthCheck - Session Status:', status);
        console.log('AuthCheck - Session Data:', session);

        if (status === 'loading') {
            console.log('AuthCheck - Loading session...');
            return;
        }

        if (status === 'unauthenticated') {
            console.log('AuthCheck - No session found, redirecting to home');
            router.replace('/');
            return;
        }

        console.log('AuthCheck - Session valid, user authenticated');
    }, [status, session, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#00B0C8]"></div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return children;
} 