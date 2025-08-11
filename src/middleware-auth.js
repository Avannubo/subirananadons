import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        const path = req.nextUrl.pathname;
        // Allow access to dashboard for authenticated users
        if (path === '/dashboard') {
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
        if (isAdminRoute && userRole !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: [
        '/dashboard',
        '/dashboard/:path*'
    ],
};
