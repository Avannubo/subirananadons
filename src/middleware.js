import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        const path = req.nextUrl.pathname;
        console.log('------- Middleware Debug -------');
        console.log('Path:', path);
        console.log('Token:', JSON.stringify(req.nextauth.token, null, 2));
        console.log('User Role:', req.nextauth.token?.role);

        // Allow access to dashboard for authenticated users
        if (path === '/dashboard') {
            console.log('Accessing main dashboard - allowed for all authenticated users');
            return NextResponse.next();
        }

        // Check admin routes
        const isAdminRoute = path.startsWith('/dashboard/admin') ||
            path.startsWith('/dashboard/productos') ||
            path.startsWith('/dashboard/pedidos') ||
            path.startsWith('/dashboard/clientes') ||
            path.startsWith('/dashboard/facturacion') ||
            path.startsWith('/dashboard/configuracion');

        const userRole = req.nextauth.token?.role || 'user';

        console.log('Is Admin Route:', isAdminRoute);
        console.log('User Role:', userRole);

        if (isAdminRoute && userRole !== 'admin') {
            console.log('Unauthorized admin access attempt - redirecting');
            return NextResponse.redirect(new URL('/dashboard/orders', req.url));
        }

        console.log('Access granted');
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => {
                console.log('Auth Check - Token present:', !!token);
                return !!token;
            },
        },
    }
);

// Update matcher to include all dashboard routes
export const config = {
    matcher: [
        '/dashboard',
        '/dashboard/:path*'
    ],
}; 