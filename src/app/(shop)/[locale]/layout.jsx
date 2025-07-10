import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import React from 'react';

export default function LocaleLayout({ children, params: { locale } }) {
    let messages;
    try {
        messages = require(`@/locales/${locale}.json`);
    } catch (error) {
        notFound();
    }

    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
        </NextIntlClientProvider>
    );
}
