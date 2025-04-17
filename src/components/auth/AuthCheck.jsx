import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';

export async function AuthCheck({ children }) {
    const session = await getServerSession();

    if (!session) {
        redirect('/');
    }

    return children;
} 