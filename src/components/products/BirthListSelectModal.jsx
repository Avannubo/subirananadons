import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { fetchBirthLists, addProductToBirthList } from '@/services/BirthListService';
import { toast } from 'react-hot-toast';
import { useLocale } from 'next-intl';

export default function BirthListSelectModal({ show, onClose, product, userId }) {
    const locale = useLocale();
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedList, setSelectedList] = useState(null);

    useEffect(() => {
        if (show && userId) {
            setLoading(true);
            fetchBirthLists(userId)
                .then(res => {
                    setLists(res.data || []);
                })
                .catch(() => {
                    toast.error(locale === 'es' ? 'Error cargando las listas' : locale === 'en' ? 'Error loading lists' : 'Error carregant les llistes');
                })
                .finally(() => setLoading(false));
        }
    }, [show, userId]);

    const handleAddToList = async (listId) => {
        try {
            setLoading(true);
            setSelectedList(listId);
            await addProductToBirthList(listId, product.id || product._id);
            toast.success(locale === 'es' ? '¡Producto añadido a la lista!' : locale === 'en' ? 'Product added to the list!' : 'Producte afegit a la llista!');
            onClose();
        } catch (error) {
            toast.error(locale === 'es' ? 'Error añadiendo el producto' : locale === 'en' ? 'Error adding the product' : 'Error afegint el producte');
        } finally {
            setLoading(false);
            setSelectedList(null);
        }
    };

    if (!show) return null;

    // Prevent background scroll when modal is open
    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [show]);

    // Backdrop click closes modal
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed inset-0 bg-[#00000050] z-[9999] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleBackdropClick}
                    aria-modal="true"
                    role="dialog"
                >
                    <motion.div
                        className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto relative"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors p-1"
                            disabled={loading}
                        >
                            ✕
                        </button>

                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">
                                {locale === 'es' ? 'Selecciona una lista de nacimiento' :
                                    locale === 'en' ? 'Select a birth list' :
                                        'Selecciona una llista de naixement'}
                            </h2>

                            {loading && !selectedList ? (
                                <div className="flex justify-center items-center py-10">
                                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00B0C8]"></div>
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-200 max-h-[200px] overflow-y-auto">
                                    {(!userId) ? (
                                        <li className="py-4 text-center text-gray-500">
                                            {locale === 'es' ? 'Debes iniciar sesión para ver o crear listas' :
                                                locale === 'en' ? 'You must log in to view or create lists' :
                                                    'Has d\'iniciar sessió per veure o crear llistes'}
                                        </li>
                                    ) : lists.length === 0 ? (
                                        <li className="py-4 text-center text-gray-500">
                                            {locale === 'es' ? 'No tienes ninguna lista creada. Crea una lista para añadir productos.' :
                                                locale === 'en' ? 'You don\'t have any lists created. Create a list to add products.' :
                                                    'No tens cap llista creada. Crea una llista per afegir productes.'}
                                        </li>
                                    ) : (
                                        lists.map(list => (
                                            <li
                                                key={list._id}
                                                className={`py-3 px-4 transition-colors rounded-lg ${selectedList === list._id
                                                    ? 'bg-[#00B0C850] bg-opacity-10'
                                                    : 'hover:bg-gray-100 cursor-pointer'
                                                    }`}
                                                onClick={() => !loading && handleAddToList(list._id)}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <span className="font-semibold block">{list.title}</span>
                                                        {list.babyName && (
                                                            <span className="text-sm text-gray-500">
                                                                {list.babyName}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {selectedList === list._id && (
                                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#00B0C8]"></div>
                                                    )}
                                                </div>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}