// import { redirect } from 'next/navigation';
// import { cookies } from 'next/headers';
import LogoutBtn from '@/components/ui/LogoutBtn';
import Link from 'next/link';
export default async function Sidebar() {
    // const cookieStore = cookies();
    // const token = await cookieStore.has('token');
    // if (!token) {
    //     redirect('/');
    // }
    return (
        <div className="w-64 bg-white  min-h-screen text-xl p-4 pt-30">
            <div className="space-y-4">
                <button className="w-full mb-2 shadow rounded-sm  bg-gray-100 hover:bg-[#00B0C830] p-2 text-center">
                    <Link href="/dashboard/productos" className="text-gray-800 font-medium no-underline rounded-2xl">Productos</Link>
                </button>
                <button className="w-full mb-2 shadow rounded-sm bg-gray-100 hover:bg-[#00B0C830]  p-2 text-center">
                    <Link href="/dashboard/pedidos" className="text-gray-800 font-medium no-underline">Pedidos</Link>
                </button>
                <button className="w-full mb-2 shadow rounded-sm  bg-gray-100 hover:bg-[#00B0C830] p-2 text-center">
                    <Link href="/dashboard/clientes" className="text-gray-800 font-medium no-underline">Clientes</Link>
                </button>
                <button className="w-full mb-2 shadow rounded-sm  bg-gray-100 hover:bg-[#00B0C830] p-2 text-center">
                    <Link href="/dashboard/listas" className="text-gray-800 font-medium no-underline text-nowrap">Listas de nacimientos</Link>
                </button>
                <button className="w-full mb-2 shadow rounded-sm  bg-gray-100 hover:bg-[#00B0C830] p-2 text-center">
                    <Link href="/dashboard/configuracion" className="text-gray-800 font-medium no-underline">Configuraciones</Link>
                </button>
                <button className="w-full mb-2 shadow rounded-sm  bg-gray-100 hover:bg-[#00B0C830] p-2 text-center">
                    <LogoutBtn/>
                </button>
            </div>
        </div>
    );
}
