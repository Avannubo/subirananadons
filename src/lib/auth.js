// @/lib/auth.js
import { auth } from "@/auth";

// Get current user in server components
export async function getCurrentUser() {
    const session = await auth();
    return session?.user;
}

// Check if user is authenticated in server components
export async function isAuthenticated() {
    const session = await auth();
    return !!session;
}

// Check if user has specific role in server components
export async function hasRole(role) {
    const session = await auth();
    return session?.user?.role === role;
}

// Export auth options for API routes
export { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Higher-order component for client-side protection
export function withAuth(Component) {
    return async function ProtectedComponent(props) {
        const session = await auth();
        if (!session) {
            redirect("/login");
            return null;
        }
        return <Component {...props} />;
    };
}