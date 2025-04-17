'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function withAuth(WrappedComponent) {
    return function AuthComponent(props) {
        const { data: session, status } = useSession();
        const router = useRouter();

        useEffect(() => {
            if (status === 'unauthenticated') {
                router.push('/');
            }
        }, [status, router]);

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

        return <WrappedComponent {...props} session={session} />;
    };
} 