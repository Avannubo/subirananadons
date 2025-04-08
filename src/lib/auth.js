// @/lib/auth.js
import { auth } from "@/auth";

// Get current user in server components
export async function getCurrentUser() {
    const session = await auth();
    return session?.user;
}

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