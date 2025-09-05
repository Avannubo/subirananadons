import { useEffect, useState } from "react";
import { FiUpload, FiPlus } from "react-icons/fi";
import { toast } from "react-hot-toast";
import ImageSelector from "@/components/admin/shared/ImageSelector"; // Adjust the import based on your file structure
export default function OffersTab() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        imageUrl: '',
        title: { es: '', ca: '' },
        description: { es: '', ca: '' },
        brand: '',
        brandLogo: '',
        discount: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [brands, setBrands] = useState([]);
    const [showImageSelector, setShowImageSelector] = useState(false);
    const maxOffers = 4;
    useEffect(() => {
        async function fetchOffers() {
            try {
                const res = await fetch('/api/offers');
                const data = await res.json();
                setOffers(data);
                console.log(data);
            } catch (err) {
                toast.error('Error al cargar las ofertas');
            } finally {
                setLoading(false);
            }
        }
        fetchOffers();
        // Fetch brands from API
        fetch('/api/brands?limit=1000')
            .then(res => res.json())
            .then(data => {
                if (data && data.brands) {
                    setBrands(data.brands.map(b => ({
                        id: b._id || b.id,
                        name: b.name,
                        logo: b.logo || ''
                    })));
                }
            });
    }, []);
    const handleChange = e => {
        const { name, value } = e.target;
        if (name === 'brand') {
            const selectedBrand = brands.find(b => b.id === value || b.name === value);
            setForm(f => ({
                ...f,
                [name]: value,
                brandLogo: selectedBrand?.logo || ''
            }));
        } else if (name.startsWith('title.')) {
            const lang = name.split('.')[1];
            setForm(f => ({
                ...f,
                title: { ...f.title, [lang]: value }
            }));
        } else if (name.startsWith('description.')) {
            const lang = name.split('.')[1];
            setForm(f => ({
                ...f,
                description: { ...f.description, [lang]: value }
            }));
        } else {
            setForm(f => ({ ...f, [name]: value }));
        }
    };
    const handleImageChange = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setSelectedImage(files[0]);
            const fileReader = new FileReader();
            fileReader.onload = () => {
                setImagePreview(fileReader.result);
            };
            fileReader.readAsDataURL(files[0]);
        }
    };
    const uploadImage = async () => {
        if (!selectedImage) return null;
        setIsUploading(true);
        try {
            const base64Image = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(selectedImage);
            });
            const response = await fetch('/api/cloudinary/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64Image })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error uploading image');
            }
            const data = await response.json();
            return data.url;
        } catch (error) {
            toast.error('Error al subir la imagen');
            return null;
        } finally {
            setIsUploading(false);
        }
    };
    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        if (offers.length >= maxOffers && !editingId) {
            toast.error('Solo puedes agregar hasta 4 ofertas.');
            return;
        }
        try {
            let imageUrl = form.imageUrl;
            if (selectedImage) {
                const uploadedUrl = await uploadImage();
                if (!uploadedUrl) {
                    toast.error('No se pudo subir la imagen');
                    return;
                }
                imageUrl = uploadedUrl;
            }
            // Find the selected brand from the brands list
            const selectedBrand = brands.find(b => b.id === form.brand || b.name === form.brand);
            if (!selectedBrand) {
                toast.error('Selecciona una marca válida.');
                return;
            }
            // Always use the logo from the selectedBrand if available
            const brandLogo = selectedBrand.logo ? selectedBrand.logo : '';
            // Prepare the offer data with brand ObjectId
            const offerData = {
                imageUrl: imageUrl || form.imageUrl,
                title: form.title,
                description: form.description,
                discount: form.discount,
                brand: selectedBrand.id, // Send ObjectId
                brandLogo
            };
            // Add _id if editing
            if (editingId) {
                offerData._id = editingId;
            }
            const res = await fetch('/api/offers', {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(offerData)
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Error saving offer');
            }
            if (editingId) {
                setOffers(offers.map(o => o._id === editingId ? data : o));
            } else {
                setOffers([...offers, data]);
            }
            // Reset form
            setForm({
                imageUrl: '',
                title: { es: '', ca: '' },
                description: { es: '', ca: '' },
                brand: '',
                brandLogo: '',
                discount: ''
            });
            setEditingId(null);
            setSelectedImage(null);
            setImagePreview('');
            toast.success('Oferta guardada correctamente');
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        }
    };
    const handleEdit = offer => {
        // Determine the brand id for the select input
        let brandId = '';
        if (offer.brand && typeof offer.brand === 'object') {
            brandId = offer.brand._id || offer.brand.id || '';
        } else if (typeof offer.brand === 'string') {
            brandId = offer.brand;
        }
        setForm({
            imageUrl: offer.imageUrl || '',
            title: offer.title || { es: '', ca: '' },
            description: offer.description || { es: '', ca: '' },
            brand: brandId,
            brandLogo: offer.brandLogo || '',
            discount: offer.discount || ''
        });
        setImagePreview(offer.imageUrl || '');
        setEditingId(offer._id);
    };
    const handleDelete = async id => {
        if (!window.confirm('¿Eliminar esta oferta?')) return;
        const res = await fetch('/api/offers', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ _id: id })
        });
        if (!res.ok) return setError('Error eliminando la oferta');
        setOffers(offers.filter(o => o._id !== id));
        if (editingId === id) {
            setForm({ imageUrl: '', title: '', description: '', brand: '', brandLogo: '', discount: '' });
            setEditingId(null);
            setImagePreview('');
        }
        toast.success('Oferta eliminada correctamente');
    };
    return (
        <div className="p-6 bg-white rounded-xl">
            <h2 className="font-bold mb-6 text-lg text-gray-800">Ofertes Destacades</h2>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            <form onSubmit={handleSubmit} className="mb-8 space-y-6">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-full p-2 h-44 relative rounded-lg border border-dashed border-gray-300 overflow-hidden bg-gray-50">
                        {isUploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                            </div>
                        )}
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full">
                                <FiUpload className="w-10 h-10 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-500">No s'ha seleccionat cap imatge</p>
                            </div>
                        )}
                    </div>
                    <div className="w-full grid grid-cols-2 gap-2">
                        <div>
                            <label htmlFor="offerImage" className={`block w-full px-4 py-2 text-center text-white text-sm rounded-md ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#36A9E1] hover:bg-[#008A9B] cursor-pointer'}`}>{isUploading ? 'Pujant...' : 'Selecciona Imatge'}</label>
                            <input type="file" id="offerImage" accept="image/*" onChange={handleImageChange} disabled={isUploading} className="hidden" />
                        </div>
                        <button type="button" onClick={() => { if (form.imageUrl) { setImagePreview(form.imageUrl); } }} disabled={isUploading || !form.imageUrl} className={`w-full px-4 py-2 text-white text-sm rounded-md flex items-center justify-center gap-1 ${isUploading || !form.imageUrl ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
                            <FiPlus size={16} />
                            <span>Previsualitza URL</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowImageSelector(true)}
                            disabled={isUploading}
                            className={`w-full col-span-2 px-4 py-2 text-white text-sm rounded-md ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#36A9E1] hover:bg-[#008A9B]'}`}
                        >
                            Selecciona existent
                        </button>
                    </div>
                    {showImageSelector && (
                        <ImageSelector
                            onSelect={(url) => {
                                setForm(f => ({ ...f, imageUrl: url }));
                                setImagePreview(url);
                                setShowImageSelector(false);
                            }}
                            onClose={() => setShowImageSelector(false)}
                        />
                    )}
                    <p className="mt-1 text-xs text-gray-500 text-center">Formats: JPG, PNG. Màx: 5MB</p>
                    <div className="w-full">
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">URL de la imatge (opcional)</label>
                        <div className="flex mt-1">
                            <input type="text" id="imageUrl" name="imageUrl" value={form.imageUrl} onChange={handleChange} className="block w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-[#36A9E1] focus:border-[#36A9E1]" placeholder="https://example.com/image.jpg" />
                            <button type="button" onClick={() => { if (form.imageUrl) { setImagePreview(form.imageUrl); } }} className="text-nowrap bg-gray-200 px-3 py-2 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-300">Vista previa</button>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">O enganxa la URL directament aquí</p>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                    <input name="title.ca" value={form.title.ca} onChange={handleChange} placeholder="Títol (CA)" className="border border-gray-300 p-2 rounded w-full bg-gray-50" />
                    <input name="title.es" value={form.title.es} onChange={handleChange} placeholder="Título (ES)" className="border border-gray-300 p-2 rounded w-full bg-gray-50" />
                </div>
                <div className="flex flex-col md:flex-row gap-2 mt-2">
                    <input name="description.ca" value={form.description.ca} onChange={handleChange} placeholder="Descripció (CA)" className="border border-gray-300 p-2 rounded w-full bg-gray-50" />
                    <input name="description.es" value={form.description.es} onChange={handleChange} placeholder="Descripción (ES)" className="border border-gray-300 p-2 rounded w-full bg-gray-50" />
                </div>
                {/* Brand selector and discount */}
                <div className="flex flex-col md:flex-row gap-2">
                    <select name="brand" value={form.brand} onChange={handleChange} className="border border-gray-300 p-2 rounded w-full bg-gray-50">
                        <option value="">Selecciona una marca</option>
                        {brands.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                    {/* <input name="discount" type="number" value={form.discount ?? ''} onChange={handleChange} placeholder="% Descompte" className="border border-gray-300 p-2 rounded w-full bg-gray-50" min="0" max="100" /> */}
                </div>
                <div className="flex gap-2">
                    <button type="submit" className="bg-[#36A9E1] hover:bg-[#62b7c2] text-white px-4 py-2 rounded shadow-sm" disabled={isUploading || (offers.length >= maxOffers && !editingId)}>{editingId ? 'Actualitza' : 'Afegeix'} Oferta</button>
                    {editingId && (
                        <button type="button" onClick={() => { setEditingId(null); setForm({ imageUrl: '', title: '', description: '', brand: '', brandLogo: '', discount: '' }); setImagePreview(''); }} className="px-4 py-2 text-gray-700 border border-gray-300 rounded bg-gray-100 hover:bg-gray-200">Cancel·la</button>
                    )}
                    {offers.length >= maxOffers && !editingId && (
                        <div className="text-red-500 text-center align-middle">*Només pots afegir fins a 4 ofertes. Elimina una per afegir-ne una altra.</div>
                    )}
                </div>
            </form>
            {loading ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm bg-white rounded-xl shadow border border-gray-200 animate-pulse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-700 uppercase text-xs">
                                <th className="py-3 px-2 font-semibold text-left">Imatge</th>
                                <th className="py-3 px-2 font-semibold text-left">Títol</th>
                                <th className="py-3 px-2 font-semibold text-left">Descripció</th>
                                <th className="py-3 px-2 font-semibold text-left">Marca</th>
                                {/* <th className="py-3 px-2 font-semibold text-left">Descompte %</th> */}
                                <th className="py-3 px-2 font-semibold text-left">Accions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...Array(4)].map((_, i) => (
                                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                    <td className="py-2 px-2">
                                        <div className="h-12 w-20 bg-gray-200 rounded-lg mx-auto" />
                                    </td>
                                    <td className="py-2 px-2">
                                        <div className="h-4 w-24 bg-gray-200 rounded mx-auto" />
                                    </td>
                                    <td className="py-2 px-2">
                                        <div className="h-4 w-32 bg-gray-200 rounded mx-auto" />
                                    </td>
                                    <td className="py-2 px-2">
                                        <div className="h-4 w-20 bg-gray-200 rounded mx-auto" />
                                    </td>
                                    {/* <td className="py-2 px-2">
                                        <div className="h-4 w-10 bg-gray-200 rounded mx-auto" />
                                    </td> */}
                                    <td className="py-2 px-2">
                                        <div className="flex gap-2 justify-start">
                                            <div className="h-8 w-12 bg-gray-200 rounded-full" />
                                            <div className="h-8 w-12 bg-gray-200 rounded-full" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm bg-white rounded-xl shadow border border-gray-200">
                        <thead>
                            <tr className="bg-gray-50 text-gray-700 uppercase text-xs">
                                <th className="py-3 px-2 font-semibold text-left">Imagen</th>
                                <th className="py-3 px-2 font-semibold text-left">Título</th>
                                <th className="py-3 px-2 font-semibold text-left">Descripción</th>
                                <th className="py-3 px-2 font-semibold text-left">Marca</th>
                                {/* <th className="py-3 px-2 font-semibold text-left">Desc. %</th> */}
                                <th className="py-3 px-2 font-semibold text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {offers.map(offer => (
                                <tr key={offer._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                    <td className="py-2 px-2">
                                        {offer.imageUrl && (
                                            <img src={offer.imageUrl} alt="offer" className="h-12 w-20 object-cover rounded-lg border border-gray-200 bg-gray-100" />
                                        )}
                                    </td>
                                    <td className="py-2 px-2">
                                        <span className="block"><span className="font-semibold">CA:</span> {offer.title?.ca || ''}</span>
                                        <span className="block text-xs text-gray-400"><span className="font-semibold">ES:</span> {offer.title?.es || ''}</span>
                                    </td>
                                    <td className="py-2 px-2">
                                        <span className="block"><span className="font-semibold">CA:</span> {offer.description?.ca || ''}</span>
                                        <span className="block text-xs text-gray-400"><span className="font-semibold">ES:</span> {offer.description?.es || ''}</span>
                                    </td>
                                    <td className="py-2 px-2">
                                        <a
                                            href={
                                                offer.brand && typeof offer.brand === 'object' && offer.brand._id
                                                    ? `/brands?brand=${offer.brand._id}`
                                                    : `/brands?brand=${offer.brand}`
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 underline"
                                        >
                                            {offer.brand && typeof offer.brand === 'object'
                                                ? offer.brand.name
                                                : (brands.find(b => b.id === offer.brand)?.name || offer.brand)}
                                        </a>
                                    </td>
                                    {/* <td className="py-2 px-2">{offer.discount ? `${offer.discount}%` : ''}</td> */}
                                    <td className="py-2 px-2 flex gap-2">
                                        <button onClick={() => handleEdit(offer)} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 border border-blue-100 text-xs">Edita</button>
                                        <button onClick={() => handleDelete(offer._id)} className="bg-red-50 text-red-600 px-3 py-1 rounded-full hover:bg-red-100 border border-red-100 text-xs">Elimina</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
