import { useEffect, useState } from "react";
import { FiUpload, FiPlus } from "react-icons/fi";
import { toast } from "react-hot-toast";
export default function ConfiguracionTab() {
    const [sliders, setSliders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        imageUrl: '',
        btnText: '',
        btnLink: '',
        order: 0,
        active: true
    });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    // Image upload states
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    // Fetch slider items
    useEffect(() => {
        fetch('/api/slider')
            .then(res => res.json())
            .then(data => {
                setSliders(data);
                setLoading(false);
            });
    }, []);
    // Handle form input
    const handleChange = e => {
        const { name, value, type, checked } = e.target;
        setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    };
    // Handle image selection
    const handleImageChange = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setSelectedImage(files[0]);
            // Show preview
            const fileReader = new FileReader();
            fileReader.onload = () => {
                setImagePreview(fileReader.result);
            };
            fileReader.readAsDataURL(files[0]);
        }
    };
    // Upload image to server
    const uploadImage = async () => {
        if (!selectedImage) return null;
        setIsUploading(true);
        try {
            // Convert image to base64
            const base64Image = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(selectedImage);
            });
            // Upload to server
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: base64Image })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error uploading image');
            }
            const data = await response.json();
            return data.url;
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Error al subir la imagen');
            return null;
        } finally {
            setIsUploading(false);
        }
    };
    // Add or update slider
    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        try {
            // If there's a selected image, upload it first
            let imageUrl = form.imageUrl;
            if (selectedImage) {
                const uploadedUrl = await uploadImage();
                if (!uploadedUrl) return;
                imageUrl = uploadedUrl;
            }
            const method = editingId ? 'PUT' : 'POST';
            const body = {
                ...form,
                imageUrl: imageUrl || form.imageUrl,
                _id: editingId
            };
            const res = await fetch('/api/slider', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!res.ok) {
                throw new Error('Error saving slider');
            }
            const data = await res.json();
            if (editingId) {
                setSliders(sliders.map(s => s._id === editingId ? data : s));
            } else {
                setSliders([...sliders, data]);
            }
            // Reset form
            setForm({ imageUrl: '', btnText: '', btnLink: '', order: 0, active: true });
            setEditingId(null);
            setSelectedImage(null);
            setImagePreview('');
            toast.success('Slider saved successfully');
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        }
    };
    // Edit slider
    const handleEdit = slider => {
        setForm({
            imageUrl: slider.imageUrl || '',
            btnText: slider.btnText || '',
            btnLink: slider.btnLink || '',
            order: slider.order || 0,
            active: slider.active !== false
        });
        setImagePreview(slider.imageUrl || '');
        setEditingId(slider._id);
    };
    // Delete slider
    const handleDelete = async id => {
        if (!window.confirm('Delete this slider?')) return;
        const res = await fetch('/api/slider', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ _id: id })
        });
        if (!res.ok) return setError('Error deleting slider');
        setSliders(sliders.filter(s => s._id !== id));
        if (editingId === id) {
            setForm({ imageUrl: '', btnText: '', btnLink: '', order: 0, active: true });
            setEditingId(null);
            setImagePreview('');
        }
        toast.success('Slider deleted successfully');
    };
    return (
        <div className="p-6 bg-white rounded-xl">
            <h2 className="font-bold mb-6 text-lg text-gray-800">Slider Images</h2>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            <form onSubmit={handleSubmit} className="mb-8 space-y-6">
                {/* Image Upload Section */}
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-full p-2 h-44 relative rounded-lg border border-dashed border-gray-300 overflow-hidden bg-gray-50">
                        {isUploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                            </div>
                        )}
                        {imagePreview ? (
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-full object-contain rounded-lg"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full">
                                <FiUpload className="w-10 h-10 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-500">No image selected</p>
                            </div>
                        )}
                    </div>
                    <div className="w-full grid grid-cols-2 gap-2">
                        <div>
                            <label
                                htmlFor="sliderImage"
                                className={`block w-full px-4 py-2 text-center text-white text-sm rounded-md ${isUploading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-[#00B0C8] hover:bg-[#008A9B] cursor-pointer'
                                    }`}
                            >
                                {isUploading ? 'Uploading...' : 'Select Images'}
                            </label>
                            <input
                                type="file"
                                id="sliderImage"
                                accept="image/*"
                                onChange={handleImageChange}
                                disabled={isUploading}
                                className="hidden"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                if (form.imageUrl) {
                                    setImagePreview(form.imageUrl);
                                }
                            }}
                            disabled={isUploading || !form.imageUrl}
                            className={`w-full px-4 py-2 text-white text-sm rounded-md flex items-center justify-center gap-1 ${isUploading || !form.imageUrl
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700'
                                }`}
                        >
                            <FiPlus size={16} />
                            <span>Preview URL</span>
                        </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 text-center">
                        Formats: JPG, PNG. Max: 5MB
                    </p>
                    {/* Manual URL input */}
                    <div className="w-full">
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                            Image URL (optional)
                        </label>
                        <div className="flex mt-1">
                            <input
                                type="text"
                                id="imageUrl"
                                name="imageUrl"
                                value={form.imageUrl}
                                onChange={handleChange}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-[#00B0C8] focus:border-[#00B0C8]"
                                placeholder="https://example.com/image.jpg"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    if (form.imageUrl) {
                                        setImagePreview(form.imageUrl);
                                    }
                                }}
                                className="text-nowrap bg-gray-200 px-3 py-2 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-300"
                            >
                                Preview
                            </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            Or paste the URL directly here
                        </p>
                    </div>
                </div>
                {/* Other form fields */}
                <div className="flex flex-col md:flex-row gap-2">
                    <input
                        name="btnText"
                        value={form.btnText}
                        onChange={handleChange}
                        placeholder="Button Text"
                        className="border border-gray-300 p-2 rounded w-full bg-gray-50"
                    />
                    <input
                        name="btnLink"
                        value={form.btnLink}
                        onChange={handleChange}
                        placeholder="Button Link"
                        className="border border-gray-300 p-2 rounded w-full bg-gray-50"
                    />
                    <input
                        name="order"
                        type="number"
                        value={form.order}
                        onChange={handleChange}
                        placeholder="Order"
                        className="border border-gray-300 p-2 rounded w-full bg-gray-50"
                    />
                </div>
                <label className="flex items-center gap-2">
                    <input
                        name="active"
                        type="checkbox"
                        checked={form.active}
                        onChange={handleChange}
                    />
                    Active
                </label>
                <div className="flex gap-2">
                    <button
                        type="submit"
                        className="bg-[#00B0C8] hover:bg-[#62b7c2] text-white px-4 py-2 rounded shadow-sm"
                        disabled={isUploading}
                    >
                        {editingId ? 'Update' : 'Add'} Slider
                    </button>
                    {editingId && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditingId(null);
                                setForm({ imageUrl: '', btnText: '', btnLink: '', order: 0, active: true });
                                setImagePreview('');
                            }}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded bg-gray-100 hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
            {loading ? <div>Loading...</div> : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm bg-white rounded-xl shadow border border-gray-200">
                        <thead>
                            <tr className="bg-gray-50 text-gray-700 uppercase text-xs">
                                <th className="py-3 px-2 font-semibold text-left">Imagen</th>
                                <th className="py-3 px-2 font-semibold text-left">Texto del botón</th>
                                <th className="py-3 px-2 font-semibold text-left">Enlace del botón</th>
                                <th className="py-3 px-2 font-semibold text-left">Orden</th>
                                <th className="py-3 px-2 font-semibold text-left">Activo</th>
                                <th className="py-3 px-2 font-semibold text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sliders.map(slider => (
                                <tr key={slider._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                    <td className="py-2 px-2">
                                        {slider.imageUrl && (
                                            <img src={slider.imageUrl} alt="slider" className="h-12 w-20 object-cover rounded-lg border border-gray-200 bg-gray-100" />
                                        )}
                                    </td>
                                    <td className="py-2 px-2">{slider.btnText}</td>
                                    <td className="py-2 px-2">{slider.btnLink}</td>
                                    <td className="py-2 px-2">{slider.order}</td>
                                    <td className="py-2 px-2">
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${slider.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{slider.active ? 'Yes' : 'No'}</span>
                                    </td>
                                    <td className="py-2 px-2 h-20  flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(slider)}
                                            className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 border border-blue-100 text-xs h-8 flex items-center justify-center"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(slider._id)}
                                            className="bg-red-50 text-red-600 px-3 py-1 rounded-full hover:bg-red-100 border border-red-100 text-xs h-8 flex items-center justify-center"
                                        >
                                            Delete
                                        </button>
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