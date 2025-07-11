import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';
import { NextIntlClientProvider } from 'next-intl';
import messages from '../../messages/ca.json'; // Default to Catalan


export const metadata = {
  title: 'Subirana Nadons',
  description: 'Tienda de productos para bebés',
};
if (typeof window !== 'undefined') {
  document.cookie = `locale=${locale}; path=/; max-age=31536000`;
}
export default function RootLayout({ children }) {
  return (
    <html lang="ca">
      <body>
        <NextIntlClientProvider locale="ca" messages={messages}>
          <Providers>
            {children}
          </Providers>
          <Toaster position="bottom-right" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}