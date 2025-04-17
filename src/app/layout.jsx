import "./globals.css";
import { Providers } from './providers'

export const metadata = {
  title: "Subirana Nadons",
  description: "Tienda de ropa y accesorios para bebés",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="w-full overflow-x-hidden">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}