import React from 'react';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import { Cookie, List, ExternalLink, Settings, RefreshCw, Contact } from 'lucide-react';

export const metadata = {
    title: 'Política de Cookies | Subirana',
    description: 'Información sobre el uso de cookies en el sitio web de Subirana',
};

export default function CookiesPage() {
    return (
        <>
            <Header />
            <div className="container mx-auto px-4 py-12 max-w-[1500px]">
                <h1 className="text-3xl font-bold mb-8">Política de Cookies</h1>

                <div className="prose max-w-none">
                    <section className="mb-8">
                        <div className="flex items-center mb-4">
                            <Cookie className="text-[#00B0C8] mr-2" size={24} />
                            <h2 className="text-2xl font-semibold">1. ¿Qué son las cookies?</h2>
                        </div>
                        <p>
                            Las cookies son pequeños archivos de texto que se almacenan en su dispositivo
                            (ordenador, tablet, teléfono móvil) cuando visita sitios web. Se utilizan
                            ampliamente para hacer que los sitios web funcionen correctamente, de manera más
                            eficiente, y para proporcionar información a los propietarios del sitio.
                        </p>
                    </section>

                    <section className="mb-8">
                        <div className="flex items-center mb-4">
                            <List className="text-[#00B0C8] mr-2" size={24} />
                            <h2 className="text-2xl font-semibold">2. Tipos de cookies que utilizamos</h2>
                        </div>
                        <h3 className="text-xl font-medium mt-6 mb-3">Cookies esenciales</h3>
                        <p>
                            Estas cookies son necesarias para el funcionamiento básico de nuestro sitio web.
                            Le permiten navegar por el sitio y utilizar sus funciones, como acceder a áreas
                            seguras. Sin estas cookies, no podríamos proporcionar los servicios que ha solicitado.
                        </p>

                        <h3 className="text-xl font-medium mt-6 mb-3">Cookies de rendimiento</h3>
                        <p>
                            Estas cookies recopilan información sobre cómo los visitantes utilizan nuestro sitio web,
                            por ejemplo, qué páginas visitan con más frecuencia y si reciben mensajes de error.
                            Nos ayudan a mejorar el rendimiento de nuestro sitio web.
                        </p>

                        <h3 className="text-xl font-medium mt-6 mb-3">Cookies de funcionalidad</h3>
                        <p>
                            Estas cookies permiten que el sitio web recuerde las elecciones que hace (como su
                            nombre de usuario, idioma o la región en la que se encuentra) y proporciona funciones
                            mejoradas y más personales.
                        </p>

                        <h3 className="text-xl font-medium mt-6 mb-3">Cookies de publicidad</h3>
                        <p>
                            Estas cookies se utilizan para entregar anuncios más relevantes para usted y sus
                            intereses. También se utilizan para limitar el número de veces que ve un anuncio,
                            así como para medir la efectividad de las campañas publicitarias.
                        </p>
                    </section>

                    <section className="mb-8">
                        <div className="flex items-center mb-4">
                            <ExternalLink className="text-[#00B0C8] mr-2" size={24} />
                            <h2 className="text-2xl font-semibold">3. Cookies de terceros</h2>
                        </div>
                        <p>
                            Además de nuestras propias cookies, podemos utilizar cookies de terceros para
                            analizar cómo utiliza nuestro sitio web, personalizar nuestro contenido y
                            ofrecerle publicidad relevante. Estos terceros incluyen servicios de análisis
                            y redes publicitarias.
                        </p>
                    </section>

                    <section className="mb-8">
                        <div className="flex items-center mb-4">
                            <Settings className="text-[#00B0C8] mr-2" size={24} />
                            <h2 className="text-2xl font-semibold">4. Gestión de cookies</h2>
                        </div>
                        <p>
                            La mayoría de los navegadores web permiten cierto control de la mayoría de las
                            cookies a través de la configuración del navegador. Para obtener más información
                            sobre las cookies, incluido cómo ver qué cookies se han establecido y cómo
                            gestionarlas y eliminarlas, visite <a href="https://www.allaboutcookies.org" className="text-[#00B0C8] hover:underline">www.allaboutcookies.org</a>.
                        </p>
                        <p className="mt-4">
                            Puede configurar su navegador para que rechace todas las cookies, acepte solo
                            cookies de nuestro sitio, o para mostrar un aviso cuando un sitio web intenta
                            establecer o actualizar una cookie. Si desactiva o rechaza las cookies, tenga
                            en cuenta que algunas partes de nuestro sitio web pueden volverse inaccesibles o
                            no funcionar correctamente.
                        </p>
                    </section>

                    <section className="mb-8">
                        <div className="flex items-center mb-4">
                            <RefreshCw className="text-[#00B0C8] mr-2" size={24} />
                            <h2 className="text-2xl font-semibold">5. Cambios en nuestra política de cookies</h2>
                        </div>
                        <p>
                            Cualquier cambio que podamos hacer en nuestra política de cookies en el futuro
                            se publicará en esta página. Compruebe con frecuencia si hay actualizaciones o cambios.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center mb-4">
                            <Contact className="text-[#00B0C8] mr-2" size={24} />
                            <h2 className="text-2xl font-semibold">6. Contacto</h2>
                        </div>
                        <p>
                            Si tiene alguna pregunta sobre esta política de cookies, puede contactarnos en:
                        </p>
                        <ul className="list-none my-4">
                            <li><strong>Email:</strong> info@subirana.com</li>
                            <li><strong>Teléfono:</strong> +34 93 243 25 10</li>
                        </ul>
                        <p className="mt-4 text-sm text-gray-600">
                            Última actualización: Mayo 2023
                        </p>
                    </section>
                </div>
            </div>
            <Footer />
        </>
    );
} 