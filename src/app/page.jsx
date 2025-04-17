import FadeSlider from "@/components/landing/FadeSlider";
import ImageGallery from "@/components/landing/ImageGalaryHome";
import ProductSlider from "@/components/landing/ProductSlider";
import ShopLayout from "../components/Layouts/shop-layout";
// Featured products data
const featuredProducts = [
  {
    id: 1,
    name: "Peck 2 Pints Silicon",
    price: "23,95 €",
    imageUrl: "/assets/images/Screenshot_4.png",
    imageUrlHover: "/assets/images/Screenshot_1.png",
    category: "Alimentación"
  },
  {
    id: 2,
    name: "Sac Cobés Bùba Paper Boat",
    price: "78,00 €",
    imageUrl: "/assets/images/Screenshot_3.png",
    imageUrlHover: "/assets/images/Screenshot_2.png",
    category: "Habitación"
  },
  {
    id: 3,
    name: "Robot De Cuina Chefy6",
    price: "119,00 €",
    imageUrl: "/assets/images/Screenshot_2.png",
    imageUrlHover: "/assets/images/Screenshot_3.png",
    category: "Alimentación"
  },
  {
    id: 4,
    name: "Trona De Viaje Arlo",
    price: "49,90 €",
    imageUrl: "/assets/images/Screenshot_1.png",
    imageUrlHover: "/assets/images/Screenshot_4.png",
    category: "Alimentación"
  },
  {
    id: 5,
    name: "Tripp Trapp Natural",
    price: "259,00 €",
    imageUrl: "/assets/images/Screenshot_4.png",
    imageUrlHover: "/assets/images/Screenshot_1.png",
    category: "Habitación"
  },
  {
    id: 6,
    name: "Termo papillero",
    price: "24,90 €",
    imageUrl: "/assets/images/Screenshot_3.png",
    imageUrlHover: "/assets/images/Screenshot_2.png",
    category: "Alimentación"
  },
  {
    id: 7,
    name: "Biberón aprendizaje",
    price: "12,90 €",
    imageUrl: "/assets/images/Screenshot_2.png",
    imageUrlHover: "/assets/images/Screenshot_3.png",
    category: "Alimentación"
  },
  {
    id: 8,
    name: "Newborn Set Tripp Trapp",
    price: "99,00 €",
    imageUrl: "/assets/images/Screenshot_1.png",
    imageUrlHover: "/assets/images/Screenshot_4.png",
    category: "Habitación"
  }
];
export default function Home() {
  return (
    <ShopLayout>
      <div className="w-full h-full flex flex-col justify-start items-start">
        <FadeSlider />
        <ImageGallery />
        <div className="w-full py-8">
          <ProductSlider
            title="Productos Destacados"
            products={featuredProducts}
            className="w-full"
            slidesPerView={{
              mobile: 2,
              tablet: 3,
              desktop: 4
            }}
          />
        </div>  
        {/* New Section with Background */}
        <div
          className="w-[100%] overflow-hidden h-[80vh] py-20 px-4 bg-gradient-to-r from-blue-50 to-purple-50"
          style={{
            backgroundImage: "url('/assets/images/Screenshot_4.png')",
            backgroundSize: "contain",
            backgroundPosition: "center",
          }}
        >
        </div>
      </div>
      <div className="w-full">
        <div className="w-full py-16 bg-white">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="flex flex-col items-center text-center p-6 rounded-lg transition-colors">
                <div className=" flex items-center justify-center mb-4 hover:rotate-360 transition-transform duration-300">
                  <svg className="w-8 h-8 text-gray-600 hover:text-[#00B0C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-md font-bold text-gray-700 mb-2">Crea llista</h3>
              </div>
              {/* Feature 2 */}
              <div className="flex flex-col items-center text-center p-6 rounded-lg transition-colors">
                <div className=" flex items-center justify-center mb-4 hover:rotate-360 transition-transform duration-300">
                  <svg className="w-8 h-8 text-gray-600 hover:text-[#00B0C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-md font-bold text-gray-700 mb-2">Afegeix els teus favorits</h3>
              </div>
              {/* Feature 3 */}
              <div className="flex flex-col items-center text-center p-6 rounded-lg transition-colors">
                <div className=" flex items-center justify-center mb-4 hover:rotate-360 transition-transform duration-300">
                  <svg className="w-8 h-8 text-gray-600 hover:text-[#00B0C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-md font-bold text-gray-700 mb-2">Comparteix la llista</h3>
              </div>
              {/* Feature 4 */}
              <div className="flex flex-col items-center text-center p-6 rounded-lg transition-colors">
                <div className=" flex items-center justify-center mb-4 hover:rotate-360 transition-transform duration-300">
                  <svg className="w-8 h-8 text-gray-600 hover:text-[#00B0C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m8-8v13m-8 0V8m-8 8v13" />
                  </svg>
                </div>
                <h3 className="text-md font-bold text-gray-700 mb-2">Rep els regals</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}
