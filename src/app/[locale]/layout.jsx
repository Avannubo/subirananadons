import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
export default async function LocaleLayout({ children, params }) {
    let messages;
    try {
        messages = (await import(`@/../../messages/${params.locale}.json`)).default;
    } catch (error) {
        console.error(`Failed to load messages for locale ${params.locale}:`, error);
        notFound();
    }
    return (
        <NextIntlClientProvider locale={params.locale} messages={messages}>
            {children}
        </NextIntlClientProvider>
    );
}
