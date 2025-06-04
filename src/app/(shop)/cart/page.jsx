'use client'
import ShopLayout from "@/components/Layouts/shop-layout";
import Link from "next/link";
import { motion } from 'framer-motion';

export default function CartPage() {
    return (
        <ShopLayout>
            <div className="container mx-auto px-4 py-8 mt-24">
                <motion.div
                    className="text-center py-16"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <h2 className="text-2xl font-bold mb-4">Tu carrito está vacío</h2>
                    <p className="text-gray-500 mb-8">¿No sabes qué comprar? ¡Miles de productos te esperan!</p>
                    <Link
                        href="/products"
                        className="inline-block bg-[#00B0C8] text-white py-3 px-6 rounded-md hover:bg-[#0090a8] transition-colors duration-300"
                    >
                        Continuar comprando
                    </Link>
                </motion.div>
            </div>
        </ShopLayout>
    );
}