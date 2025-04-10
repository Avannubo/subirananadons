export default function OrdersStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 mb-6 bg-white rounded-lg shadow">
            <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center"> 
                    <h3 className="text-sm font-medium text-blue-600 mr-2">Tasa de conversión</h3>
                </div>
                <div className="mt-2 flex justify-between items-end">
                    <span className="text-2xl font-bold">90%</span>
                    <span className="text-xs text-gray-500">30 días</span>
                </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center"> 
                    <h3 className="text-sm font-medium text-red-600 mr-2">Carritos abandonados</h3>
                </div>
                <div className="mt-2 flex justify-between items-end">
                    <span className="text-2xl font-bold">4</span>
                    <span className="text-xs text-gray-500">Hoy</span>
                </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center"> 
                    <h3 className="text-sm font-medium text-green-600 mr-2">Ganacias promedio del pedido</h3>
                </div>
                <div className="mt-2 flex justify-between items-end">
                    <span className="text-2xl font-bold">99,94 €</span>
                    <span className="text-xs text-gray-500">30 días</span>
                </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center"> 
                    <h3 className="text-sm font-medium text-purple-600 mr-2">Beneficio neto por visitante</h3>
                </div>
                <div className="mt-2 flex justify-between items-end">
                    <span className="text-2xl font-bold">∞</span>
                    <span className="text-xs text-gray-500">30 días</span>
                </div>
            </div>
        </div>
    );
}