'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
export default function AuthCheck({ children }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    useEffect(() => {
        if (status === 'loading') {
            return;
        }
        if (status === 'unauthenticated') {
            router.replace('/');
            return;
        }
    }, [status, session, router]);
    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#36A9E1]"></div>
            </div>
        );
    }
    if (!session) {
        return null;
    }
    return children;
} 