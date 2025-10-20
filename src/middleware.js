import createIntlMiddleware from 'next-intl/middleware';
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { routing } from './i18n/routing';
// Define allowed routes for normal users
const ALLOWED_USER_ROUTES = [
    '/dashboard',
    '/dashboard/account',
    '/dashboard/orders',
    '/dashboard/lists',
    '/dashboard/listas'  // Add Spanish version
];
// Define routes that require admin access
const ADMIN_ROUTES = [
    '/dashboard/productos',
    '/dashboard/products',
    '/dashboard/categories',
    '/dashboard/brands',
    '/dashboard/users',
    '/dashboard/settings',
    '/dashboard/admin',
    '/dashboard/facturacion',
    '/dashboard/configuracion',
    '/dashboard/clientes',
    '/dashboard/featured-products',
    '/dashboard/facturas'
];
const authMiddleware = withAuth(
    function middleware(req) {
        const path = req.nextUrl.pathname;
        
        // If user is not authenticated, redirect to home with login modal parameter
        if (!req.nextauth.token) {
            const homeUrl = new URL('/', req.url);
            // Add parameter to trigger login modal
            homeUrl.searchParams.set('showLogin', 'true');
            // Store the original URL to redirect back after login
            homeUrl.searchParams.set('callbackUrl', req.url);
            return NextResponse.redirect(homeUrl);
        }

        const userRole = req.nextauth.token?.role || 'user';
        
        // First check if it's an admin route
        const isAdminRoute = ADMIN_ROUTES.some(route => path.startsWith(route));
        if (isAdminRoute) {
            // If user is not an admin, redirect to dashboard
            if (userRole !== 'admin') {
                return NextResponse.redirect(new URL('/dashboard', req.url));
            }
            // If user is admin, allow access
            return NextResponse.next();
        }
        
        // Then check if it's an allowed user route
        const isAllowedUserRoute = ALLOWED_USER_ROUTES.some(route =>
            path === route || path.startsWith(route + '/'));
        if (isAllowedUserRoute) {
            return NextResponse.next();
        }
        
        // If the path starts with /dashboard but isn't in either list, handle based on role
        if (path.startsWith('/dashboard/')) {
            if (userRole !== 'admin') {
                return NextResponse.redirect(new URL('/dashboard', req.url));
            }
        }
        
        // Allow access to dashboard root for all authenticated users
        if (path === '/dashboard') {
            return NextResponse.next();
        }
        
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);
const intlMiddleware = createIntlMiddleware(routing);
// Combine both middlewares
export default function middleware(req) {
    const path = req.nextUrl.pathname;
    // Apply auth middleware to dashboard routes
    if (path.startsWith('/dashboard')) {
        return authMiddleware(req);
    }
    // Apply intl middleware to other routes
    return intlMiddleware(req);
}
export const config = {
    // Match all pathnames except for api routes and static files
    matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)', '/dashboard', '/dashboard/:path*']
};