import React from 'react';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import { Info, Database, FileText, Shield, User, Contact, RefreshCw } from 'lucide-react';

export const metadata = {
    title: 'Política de Privacidad | Subirana',
    description: 'Política de privacidad de Subirana, información sobre cómo protegemos sus datos personales',
};

export default function PrivacyPage() {
    return (
        <>
            <Header />
            <div className="container mx-auto px-4 py-12 max-w-[1500px]">
                <h1 className="text-3xl font-bold mb-8">Política de Privacidad</h1>
                <div className="prose max-w-none">
                    <section className="mb-8">
                        <div className="flex items-center mb-4">
                            <Info className="text-[#00B0C8] mr-2" size={24} />
                            <h2 className="text-2xl font-semibold">1. Información General</h2>
                        </div>
                        <p>
                            En Subirana nos tomamos muy en serio la protección de sus datos personales.
                            Esta Política de Privacidad describe cómo recopilamos, utilizamos y protegemos
                            la información que usted nos proporciona cuando utiliza nuestro sitio web.
                        </p>
                        <p>
                            La presente política se aplica a la información que recopilamos a través de:
                        </p>
                        <ul className="list-disc pl-6 my-4">
                            <li>Nuestro sitio web</li>
                            <li>Correo electrónico, mensajes de texto y otras comunicaciones electrónicas</li>
                            <li>Nuestras tiendas físicas</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <div className="flex items-center mb-4">
                            <Database className="text-[#00B0C8] mr-2" size={24} />
                            <h2 className="text-2xl font-semibold">2. Información que Recopilamos</h2>
                        </div>
                        <p>Podemos recopilar varios tipos de información personal, incluyendo:</p>
                        <ul className="list-disc pl-6 my-4">
                            <li>Información de identificación (nombre, dirección, correo electrónico, teléfono)</li>
                            <li>Información de pago (número de tarjeta de crédito, dirección de facturación)</li>
                            <li>Historial de compras</li>
                            <li>Información de navegación y uso del sitio web</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <div className="flex items-center mb-4">
                            <FileText className="text-[#00B0C8] mr-2" size={24} />
                            <h2 className="text-2xl font-semibold">3. Cómo Utilizamos su Información</h2>
                        </div>
                        <p>Utilizamos su información personal para:</p>
                        <ul className="list-disc pl-6 my-4">
                            <li>Procesar pedidos y transacciones</li>
                            <li>Proporcionar servicio al cliente</li>
                            <li>Enviar comunicaciones sobre productos, servicios y promociones</li>
                            <li>Mejorar nuestro sitio web y experiencia de compra</li>
                            <li>Cumplir con obligaciones legales</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <div className="flex items-center mb-4">
                            <Shield className="text-[#00B0C8] mr-2" size={24} />
                            <h2 className="text-2xl font-semibold">4. Protección de Datos</h2>
                        </div>
                        <p>
                            Implementamos medidas de seguridad técnicas y organizativas apropiadas
                            para proteger sus datos personales contra el acceso no autorizado,
                            la alteración, la divulgación o la destrucción accidental.
                        </p>
                    </section>

                    <section className="mb-8">
                        <div className="flex items-center mb-4">
                            <User className="text-[#00B0C8] mr-2" size={24} />
                            <h2 className="text-2xl font-semibold">5. Sus Derechos</h2>
                        </div>
                        <p>Como titular de los datos, usted tiene derecho a:</p>
                        <ul className="list-disc pl-6 my-4">
                            <li>Acceder a sus datos personales</li>
                            <li>Rectificar datos inexactos</li>
                            <li>Solicitar la eliminación de sus datos</li>
                            <li>Oponerse al procesamiento de sus datos</li>
                            <li>Retirar su consentimiento en cualquier momento</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <div className="flex items-center mb-4">
                            <Contact className="text-[#00B0C8] mr-2" size={24} />
                            <h2 className="text-2xl font-semibold">6. Contacto</h2>
                        </div>
                        <p>
                            Si tiene alguna pregunta sobre esta Política de Privacidad o sobre
                            cómo tratamos sus datos personales, puede contactarnos en:
                        </p>
                        <ul className="list-none my-4">
                            <li><strong>Email:</strong> info@subirana.com</li>
                            <li><strong>Teléfono:</strong> +34 93 243 25 10</li>
                            <li><strong>Dirección:</strong> C/ Ejemplo, 123, Barcelona</li>
                        </ul>
                    </section>

                    <section>
                        <div className="flex items-center mb-4">
                            <RefreshCw className="text-[#00B0C8] mr-2" size={24} />
                            <h2 className="text-2xl font-semibold">7. Actualizaciones de la Política</h2>
                        </div>
                        <p>
                            Podemos actualizar esta política periódicamente. La fecha de la última
                            actualización aparecerá en la parte inferior de esta página.
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