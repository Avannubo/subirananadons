import { useState, useEffect } from 'react';
import { FiSearch, FiImage, FiCheck, FiX, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function ImageSelector({ onSelect, onClose }) {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        async function fetchImages() {
            try {
                setLoading(true);
                const response = await fetch('/api/cloudinary/getImages');
                const data = await response.json();
                if (response.ok) {
                    setImages(data.resources || []);
                } else {
                    throw new Error(data.error || 'Failed to fetch images');
                }
            } catch (error) {
                toast.error(error.message);
                console.error('Error fetching images:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchImages();
    }, []);

    const filteredImages = images.filter(img =>
        img.public_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = () => {
        if (selectedImage) {
            onSelect(selectedImage.secure_url);
            onClose();
        }
    };

    // Delete image handler
    const handleDelete = async (img) => {
        if (!window.confirm('Segur que vols eliminar aquesta imatge?')) return;
        try {
            const res = await fetch('/api/cloudinary/deleteImage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ public_id: img.public_id })
            });
            const data = await res.json();
            if (res.ok) {
                setImages((prev) => prev.filter((i) => i.public_id !== img.public_id));
                toast.success('Imatge eliminada correctament');
                if (selectedImage?.public_id === img.public_id) setSelectedImage(null);
            } else {
                toast.error(data.error || 'Error eliminant la imatge');
            }
        } catch (err) {
            toast.error('Error eliminant la imatge');
        }
    };

    return (
        <div className="fixed inset-0 h-screen bg-[#00000050] bg-opacity-50 flex items-center justify-center p-4 z-50 border-gray-300">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center border-b border-gray-300 p-4">
                    <h2 className="text-xl font-semibold">Selecciona una imatge</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 ">
                        <FiX size={24} />
                    </button>
                </div>

                <div className="p-4 border-b border-gray-300">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cerca imatges..."
                            className="w-full pl-10 pr-4 py-2 border-gray-300 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B0C8] transition-colors"
                            autoFocus
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        {/* Skeleton grid for loading */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 w-full p-4">
                            {Array.from({ length: 24 }).map((_, idx) => (
                                <div key={idx} className="animate-pulse bg-gray-200 rounded-lg h-32 w-full" />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-4">
                        {filteredImages.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                {searchTerm ? 'No s\'han trobat imatges coincidents' : 'No hi ha imatges disponibles'}
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                {filteredImages.map((img) => (
                                    <div
                                        key={img.public_id}
                                        className={`relative rounded-lg overflow-hidden border-2 border-gray-200 cursor-pointer transition-all ${selectedImage?.public_id === img.public_id ? 'border-[#00b1c8] ring-2 ring-[#00b1c84f] ' : 'border-transparent hover:border-gray-200'}`}
                                    >
                                        {/* Delete icon (top right) */}
                                        <button
                                            type="button"
                                            className="absolute top-1 right-1 z-20 bg-white shadow-md bg-opacity-80 rounded-full p-1 hover:bg-red-100 text-red-600 hover:text-red-800 transition"
                                            title="Elimina la imatge"
                                            onClick={e => { e.stopPropagation(); handleDelete(img); }}
                                        >
                                            <FiTrash2 size={18} />
                                        </button>
                                        <div onClick={() => setSelectedImage(img)}>
                                            <img
                                                src={img.secure_url}
                                                alt={img.public_id}
                                                className="w-full h-32 object-cover"
                                            />
                                            {selectedImage?.public_id === img.public_id && (
                                                <div className="absolute inset-0 bg-[#00b1c88f] bg-opacity-30 flex items-center justify-center">
                                                    <FiCheck className="text-white text-2xl" />
                                                </div>
                                            )}
                                        </div>
                                        {/* <div className="absolute bottom-0 left-0 right-0 bg-[#00b1c8be] bg-opacity-50 text-white p-2 text-xs truncate">
                                            {img.public_id.split('/').pop()}
                                        </div> */}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-end p-4 border-t border-gray-300 ">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 mr-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
                    >
                        Cancel·la
                    </button>
                    <button
                        onClick={handleSelect}
                        disabled={!selectedImage}
                        className={`px-4 py-2 text-white rounded-lg ${!selectedImage ? 'bg-[#00b1c8ab]  cursor-not-allowed' : 'bg-[#00b1c8]  hover:bg-[#00b1c8] '}`}
                    >
                        Selecciona imatge
                    </button>
                </div>
            </div>
        </div>
    );
}