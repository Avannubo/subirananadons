import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export default async function LocaleLayout({ children, params }) {

    const messages = (await import(`@/../../messages/${params.locale}.json`)).default;
    return (
        <NextIntlClientProvider locale={params.locale} messages={messages}>
            {children}
        </NextIntlClientProvider>
    );
}
