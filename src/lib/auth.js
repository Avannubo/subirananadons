// @/lib/auth.js
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Get current user in server components
export async function getCurrentUser() {
    const session = await getServerSession(authOptions);
    return session?.user;
}

// Check if user is authenticated in server components
export async function isAuthenticated() {
    const session = await getServerSession(authOptions);
    return !!session;
}

// Check if user has specific role in server components
export async function hasRole(role) {
    const session = await getServerSession(authOptions);
    return session?.user?.role === role;
}

// Export auth options for API routes
export { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Higher-order component for client-side protection
export function withAuth(Component) {
    return async function ProtectedComponent(props) {
        const session = await getServerSession(authOptions);
        if (!session) {
            redirect("/login");
            return null;
        }
        return <Component {...props} />;
    };
}