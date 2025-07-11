import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
    // Match all pathnames except for
    // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    // - … if they start with `/dashboard` (allow dashboard to work without i18n)
    matcher: [
        '/((?!api|trpc|_next|_vercel|dashboard|.*\\..*).*)',
    ]
};