import React from 'react';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
export const metadata = {
    title: 'Aviso Legal | Subirana',
    description: 'Aviso legal, términos y condiciones de uso del sitio web de Subirana',
};

export default function LegalPage() {
    return (
        <>
            <Header />
            <div className="container mx-auto px-4 py-12 max-w-[1500px]">
                <h1 className="text-3xl font-bold mb-8">Aviso Legal</h1>

                <div className="prose max-w-none">
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">1. Información del Titular</h2>
                        <p>
                            En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad
                            de la Información y Comercio Electrónico, le informamos que:
                        </p>
                        <ul className="list-none my-4">
                            <li><strong>Denominación social:</strong> Subirana Nadons, S.L.</li>
                            <li><strong>NIF:</strong> B12345678</li>
                            <li><strong>Domicilio social:</strong> C/ Ejemplo, 123, 08001 Barcelona</li>
                            <li><strong>Email:</strong> info@subirana.com</li>
                            <li><strong>Teléfono:</strong> +34 93 243 25 10</li>
                            <li><strong>Inscripción:</strong> Registro Mercantil de Barcelona, Tomo XXXX, Folio XXX, Hoja B-XXXXX</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">2. Condiciones de Uso</h2>
                        <p>
                            El acceso y uso de este sitio web está sujeto a las presentes condiciones de uso
                            y a todas las leyes y reglamentos aplicables. El acceso a este sitio web y su uso
                            implica la aceptación plena y sin reservas de todas las condiciones incluidas en
                            este Aviso Legal.
                        </p>
                        <p className="mt-4">
                            Subirana se reserva el derecho de modificar en cualquier momento las condiciones
                            aquí establecidas, así como cualquier otra condición general o particular. Del
                            mismo modo, se reserva el derecho a suspender, interrumpir o dejar de operar este
                            sitio en cualquier momento.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">3. Propiedad Intelectual e Industrial</h2>
                        <p>
                            Todos los contenidos del sitio web, como textos, fotografías, gráficos, imágenes,
                            iconos, tecnología, software, así como su diseño gráfico y códigos fuente, constituyen
                            una obra cuya propiedad pertenece a Subirana, sin que puedan entenderse cedidos
                            al usuario ninguno de los derechos de explotación reconocidos por la normativa vigente
                            en materia de propiedad intelectual sobre los mismos.
                        </p>
                        <p className="mt-4">
                            Las marcas, nombres comerciales o signos distintivos son titularidad de Subirana,
                            sin que pueda entenderse que el acceso al sitio web atribuya ningún derecho sobre
                            las citadas marcas, nombres comerciales y/o signos distintivos.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">4. Enlaces (Links)</h2>
                        <p>
                            La presencia de enlaces (links) en este sitio web hacia otros sitios de internet
                            tiene finalidad meramente informativa y en ningún caso supone sugerencia, invitación
                            o recomendación sobre los mismos. Subirana no asume responsabilidad por los contenidos
                            de un enlace perteneciente a un sitio web ajeno, ni garantiza la fiabilidad, exactitud,
                            amplitud, veracidad, validez y disponibilidad técnica.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">5. Exclusión de Garantías y Responsabilidad</h2>
                        <p>
                            Subirana no garantiza la disponibilidad y continuidad del funcionamiento del sitio web.
                            Cuando ello sea razonablemente posible, Subirana advertirá previamente de las
                            interrupciones en el funcionamiento del sitio web.
                        </p>
                        <p className="mt-4">
                            Subirana excluye cualquier responsabilidad por los daños y perjuicios de toda
                            naturaleza que puedan deberse a la falta de disponibilidad o de continuidad del
                            funcionamiento del sitio web, a la defraudación de la utilidad que los usuarios
                            hubieren podido atribuir al sitio web, a la falibilidad del mismo, y en particular,
                            aunque no de modo exclusivo, a los fallos en el acceso a las distintas páginas web
                            o a aquellas desde las que se prestan los servicios.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">6. Ley Aplicable y Jurisdicción</h2>
                        <p>
                            Las presentes condiciones se rigen por la legislación española. Para la resolución
                            de cualquier controversia que pudiera surgir por el acceso a esta página web, el
                            usuario y Subirana acuerdan someterse a los Juzgados y Tribunales de Barcelona
                            (España), con renuncia expresa a cualquier otro fuero que pudiera corresponderles.
                        </p>
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