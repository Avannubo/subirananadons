'use client';
import { useState, useEffect } from 'react';
import ShopLayout from "@/components/Layouts/shop-layout";
import { motion } from 'framer-motion';
import Image from "next/image";

const recommendations = {
    "PARA LA MADRE": [
        "Cinturón coche",
        "Faja Shrink",
        "Alargo pantalón",
        "Ropa interior pre mamá",
        "Cojín lactancia"
    ],
    "ALIMENTACIÓN Y LACTANCIA": [
        "Trona",
        "Vajilla",
        "Robot de cocina",
        "Bolsa de transporte",
        "Libro de recetas",
        "Recipientes para alimentos",
        "Cucharas",
        "Vaso educativo",
        "Bata",
        "Baberos",
        "Termo sólidos",
        "Set de termos",
        "Termo líquidos",
        "Extractor de leche",
        "Recipientes leche materna",
        "Esterilizador",
        "Calienta biberones",
        "Biberones",
        "Escobilla",
        "Dosificador de leche",
        "Bandeja",
        "Escurre biberones",
        "Tetina para agua",
        "Chupetes",
        "Cadenas chupetes",
        "Caja chupetes"
    ],
    "PASEO": [
        "Cochecito",
        "Silla de paseo",
        "Saco capazo",
        "Saco silla",
        "Colchoneta capazo",
        "Colchoneta silla",
        "Sombrilla",
        "Capota ventilada",
        "Plataforma",
        "Bolsa de cochecito",
        "Mochila porta bebé",
        "Saco mochila"
    ],
    "BAÑO": [
        "Bañera",
        "Pies bañera",
        "Tumbona baño",
        "Asiento baño",
        "Termómetro baño",
        "Juegos de baño",
        "Recogedor juegos de baño",
        "Capas de baño",
        "Toallas",
        "Caja para toallitas",
        "Contenedor pañales",
        "Recambios contenedor",
        "Orinal",
        "Banqueta",
        "Asiento WC"
    ],
    "CLÍNICA / CANASTILLA": [
        "Bolsa clínica",
        "Esponja",
        "Bastoncillos orejas",
        "Tijeras",
        "Cepillo y peine",
        "Colonia",
        "Jabón líquido",
        "Champú",
        "Crema balsámica",
        "Leche corporal",
        "Toallitas húmedas",
        "Caja toallitas",
        "Pack cosmética",
        "Discos protectores pecho",
        "Gorro",
        "2 Envolturas",
        "2 muselinas",
        "3 Batistas",
        "4 Conjuntos camiseta / braguita",
        "4 Conjunto calcetines"
    ],
    "VIAJE": [
        "Silla de coche G.0",
        "Silla de coche G.0-1",
        "Silla de coche G.0-1-2",
        "Silla de coche G.2-3",
        "Silla de coche G.0-1-2-3",
        "Saco G.0",
        "Funda de rizo G.0",
        "Funda de rizo G.0-1",
        "Funda de rizo G.2-3",
        "Funda de rizo G.0-1-2-3",
        "Protector asiento",
        "Adaptadores de G.0",
        "Cama de viaje",
        "Saco de viaje",
        "Trona de viaje",
        "Bañera de viaje"
    ],
    "HABITACIÓN": [
        "Cama / Moisés",
        "Sábanas moisés",
        "Sábanas bajeras moisés",
        "Protector de colchón moisés",
        "Manta moisés",
        "Saco moisés",
        "Nórdico",
        "Relleno",
        "Colcha",
        "Protector de colchón moisés",
        "Manta cama",
        "Sábanas de cama",
        "Sábanas bajeras cama",
        "Protector de colchón cama",
        "Vestidor acolchado",
        "Funda vestidor",
        "Cojín relleno",
        "Cojín cama",
        "Colchón",
        "Barandilla cama",
        "Mobiliario"
    ],
    "CASA": [
        "Intercomunicadores",
        "Hamaca",
        "Juguetes hamaca",
        "Parque",
        "Andador",
        "Barreras puerta"
    ],
    "SALUD": [
        "Cojín cabeza plano",
        "Cojín primeros meses",
        "Aspirador nasal",
        "Humidificador",
        "Termómetro clínico"
    ],
    "JUEGOS EDUCATIVOS": [
        "Alfombra de actividades",
        "Móvil musical",
        "Muñecos"
    ]
};

export default function RecommendationsPage() {
    const [selectedCategory, setSelectedCategory] = useState('TODOS');
    const [bannerImage, setBannerImage] = useState(null);
    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const res = await fetch('/api/portimg/active');
                if (!res.ok) throw new Error('Failed to fetch banner');
                const data = await res.json();
                if (data && data.imageUrl) {
                    setBannerImage(data.imageUrl);
                }
            } catch (err) {
                console.error('Error fetching banner:', err);
            }
        };
        fetchBanner();
    }, []);

    return (
        <ShopLayout>
            <motion.div
                className="relative w-full mt-10 h-[30vw] min-h-[120px] max-h-[180px] sm:h-[40vh] flex flex-col justify-center items-center rounded-b-2xl overflow-hidden shadow-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Image
                    src={bannerImage || "/assets/images/bg-beagrumb.jpg"}
                    alt="Background"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-white/70 z-10 pointer-events-none" />
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                    <motion.h1
                        className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-800 shadow-amber-50 mt-8 lg:mt-20 drop-shadow-lg"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        Recomendaciones
                        
                    </motion.h1>
                    <motion.div
                        className="w-full max-w-2xl"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        <p className="text-sm my-2 text-gray-800 text-center drop-shadow">
                            A continuación un listado de los principales productos que le ayudarán a crear su lista de nacimiento.
                        </p>
                    </motion.div>

                </div>
            </motion.div>
            <div className="container mx-auto px-4 py-8">
                <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                    {Object.entries(recommendations).map(([category, items]) => (
                        <motion.div
                            key={category}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`${selectedCategory !== 'TODOS' && selectedCategory !== category ? 'hidden' : ''
                                } break-inside-avoid-column mb-4`}
                        >
                            <div className="bg-white rounded-lg shadow-md p-6 h-fit">
                                <h2 className="text-xl font-bold mb-4 text-gray-800">{category}</h2>
                                <ul className="space-y-2">
                                    {items.map((item, index) => (
                                        <motion.li
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="text-gray-600  transition-colors"
                                        >
                                            {item}
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </ShopLayout>
    );
}