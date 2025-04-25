'use client';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FiDatabase } from 'react-icons/fi';

export default function MigrateStockButton() {
    const [loading, setLoading] = useState(false);

    const handleMigration = async () => {
        if (!confirm('¿Estás seguro de que deseas migrar el modelo de stock de todos los productos? Esta acción no se puede deshacer y actualizará todos los productos en la base de datos.')) {
            return;
        }

        setLoading(true);
        const toastId = toast.loading('Migrando productos...');

        try {
            const response = await fetch('/api/admin/migrate-products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al migrar productos');
            }

            const data = await response.json();
            toast.success(`Migración completada. Se actualizaron ${data.updatedProducts} productos.`, { id: toastId });
        } catch (error) {
            console.error('Error during migration:', error);
            toast.error(`Error durante la migración: ${error.message}`, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleMigration}
            disabled={loading}
            className="px-4 py-2 bg-amber-600 text-white rounded-md flex items-center space-x-2 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
        >
            <FiDatabase className="h-5 w-5" />
            <span>{loading ? 'Migrando...' : 'Migrar Modelo de Stock'}</span>
        </button>
    );
} 