import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
    // Match all pathnames except for
    // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    // - … if they start with `/dashboard` (allow dashboard to work without i18n),
    //   EXCEPT for /dashboard/account, /dashboard/orders, /dashboard/listas which should be matched by i18n
    //'/((?!api|trpc|_next|_vercel|dashboard/(?!account|orders|listas)|.*\\..*).*)',
    matcher: [
        '/((?!api|trpc|_next|_vercel|dashboard|.*\\..*).*)',
    ]
};