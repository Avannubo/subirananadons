"use client";
import Link from "next/link";

export default function CartFailedPage() {
    return (
       
        <div className="min-h-[60vh] flex flex-col items-center justify-center py-16">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Pago cancelado o fallido</h1>
            <p className="mb-2">El pago ha sido cancelado o ha fallado. No se ha realizado ningún cargo.</p>
            <div className="flex gap-4 mt-6">
                <Link href="/cart" className="bg-[#00B0C8] text-white px-6 py-2 rounded-md">Volver al carrito</Link>
                <Link href="/products" className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md">Seguir comprando</Link>
            </div>
        </div>
    );
}
