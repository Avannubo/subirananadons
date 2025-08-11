import { useTranslations } from 'next-intl';
import LoginButton from '../../../components/ui/LoginButton';
import FadeSlider from "@/components/landing/FadeSlider";
import ImageGallery from "@/components/landing/ofertas";
import FeaturedProducts from "@/components/landing/FeaturedProducts";
import ShopLayout from "../../../components/Layouts/shop-layout";
export default function Home() {
    const t = useTranslations('HomePage');
    return (
        <ShopLayout>
            <div className="w-full h-full flex flex-col justify-start items-start">
                <FadeSlider />
                <ImageGallery />
                <FeaturedProducts />
                {/* New Section with Background */}
                <div
                    className="w-full  h-[40vw] py-10 bg-no-repeat md:py-20 px-2 md:px-4 bg-gradient-to-r from-blue-50 to-purple-50"
                    style={{
                        backgroundImage: "url('/assets/images/Screenshot_4.png')",
                        backgroundSize: "contain",
                        backgroundPosition: "center",
                    }}
                >
                </div>
            </div>
            <div className="w-full">
                <div className="w-full py-10 md:py-16 bg-white">
                    <div className="container mx-auto px-2 md:px-4">
                        <h2 className="text-2xl font-bold text-center mb-8 md:mb-12">{t('howWorksTitle')}</h2>
                        <div className="flex flex-col p-4 md:flex-row md:space-x-4 space-y-8 md:space-y-0 overflow-x-auto">
                            <div className="flex-1 min-w-[220px] shadow-md p-6 rounded-lg text-center">
                                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4">
                                    <svg className="w-8 h-8 text-[#00B0C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{t('howWorksStep1Title', { default: 'Crea tu lista / Crea la teva llista' })}</h3>
                                <p className="text-gray-600">{t('howWorksStep1Desc', { default: 'Inicia sesión con tu usuario, accede a tu perfil y crea y personaliza tu lista / Inicia sesió amb el teu usuari, accedeix al teu perfil i crea i personalitza la teva llista' })}</p>
                            </div>
                            <div className="flex-1 min-w-[220px] shadow-md p-6 rounded-lg  text-center">
                                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4">
                                    <svg className="w-8 h-8  text-[#00B0C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{t('howWorksStep2Title', { default: 'Añade los productos / Afegeix els productes' })}</h3>
                                <p className="text-gray-600">{t('howWorksStep2Desc', { default: 'Elige tus productos favoritos entre todo el catalogo de nuestra tienda / Eligeix els teus productes favorits entre tot el cataleg de la nostra botiga' })}</p>
                            </div>
                            <div className="flex-1 min-w-[220px] shadow-md p-6 rounded-lg  text-center">
                                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4">
                                    <svg className="w-8 h-8  text-[#00B0C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{t('howWorksStep3Title', { default: 'Comparte tu lista / Comparteix la teva llista' })}</h3>
                                <p className="text-gray-600">{t('howWorksStep3Desc', { default: 'Envía el enlace generado para que tus amigos y familiares compren tus regalos / Enviía l’enllaç generat per a que els teus amics i familiars comprin els teus regals' })}</p>
                            </div>
                            <div className="flex-1 min-w-[220px] shadow-md  p-6 rounded-lg  text-center">
                                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4">
                                    <svg className="w-8 h-8  text-[#00B0C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m8-8v13m-8 0V8m-8 8v13" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{t('howWorksStep4Title', { default: 'Adquiere tus regalos / Adquireix els teus regals' })}</h3>
                                <p className="text-gray-600">{t('howWorksStep4Desc', { default: 'Cuando la lista esté finalizada, podrás recoger todos los regalos en la tienda / Quan la llista estigui finalitzada podràs recollir tots els teus regals a la botiga' })}</p>
                            </div>
                        </div>
                        <div className='mt-8 flex justify-center'>
                        <LoginButton />
                        </div> 
                    </div>
                </div>
            </div>
        </ShopLayout>
    );
}
