
import React, { useEffect, useState } from 'react';

export default function ProductosTab() {
    const [groups, setGroups] = useState([]);
    const [editGroupIdx, setEditGroupIdx] = useState(null);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({ groupTitle: '', name: '', category: '' });
    const [recommendations, setRecommendations] = useState([]);
    const [editIdx, setEditIdx] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchCategories();
        fetchGroups();
    }, []);

    async function fetchCategories() {
        try {
            const catResponse = await fetch('/api/categories?includeChildren=true');
            if (!catResponse.ok) throw new Error('Failed to fetch categories');
            const catData = await catResponse.json();
            setCategories(catData || []);
        } catch {
            setCategories([]);
        }
    }

    async function fetchGroups() {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/recommendations');
            const data = await res.json();
            setGroups(data.containers || []);
        } catch {
            setGroups([]);
        } finally {
            setLoading(false);
        }
    }

    function handleEditGroup(idx) {
        const group = groups[idx];
        setEditGroupIdx(idx);
        setForm({ groupTitle: group.title, name: '', category: '' });
        setRecommendations(
            (group.groups || []).map(g => ({
                name: g.groupTitle,
                category: g.category?._id || g.category,
                categoryName: g.category?.name || ''
            }))
        );
    }


    function handleAddRecommendation(e) {
        e.preventDefault();
        if (!form.name || !form.category) return;
        if (editIdx !== null) {
            // Edit mode
            setRecommendations(prev => prev.map((r, idx) => idx === editIdx ? {
                name: form.name,
                category: form.category,
                categoryName: categories.find(c => c._id === form.category)?.name || ''
            } : r));
            setEditIdx(null);
        } else {
            // Add mode
            setRecommendations(prev => [
                ...prev,
                { name: form.name, category: form.category, categoryName: categories.find(c => c._id === form.category)?.name || '' }
            ]);
        }
        setForm(f => ({ ...f, name: '', category: '' }));
    }

    function handleEditRecommendation(idx) {
        const rec = recommendations[idx];
        setForm(f => ({ ...f, name: rec.name, category: rec.category }));
        setEditIdx(idx);
    }

    function handleRemoveRecommendation(idx) {
        setRecommendations(prev => prev.filter((_, i) => i !== idx));
        // If editing the one being removed, reset edit
        if (editIdx === idx) {
            setEditIdx(null);
            setForm(f => ({ ...f, name: '', category: '' }));
        }
    }

    async function handleSaveGroup(e) {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            let res;
            if (editGroupIdx !== null && groups[editGroupIdx]) {
                // Update existing group
                res = await fetch('/api/admin/recommendations', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: groups[editGroupIdx]._id,
                        title: form.groupTitle,
                        groups: recommendations.map(r => ({ groupTitle: r.name, category: r.category, items: [] }))
                    })
                });
            } else {
                // Create new group
                res = await fetch('/api/admin/recommendations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: form.groupTitle,
                        groups: recommendations.map(r => ({ groupTitle: r.name, category: r.category, items: [] }))
                    })
                });
            }
            if (!res.ok) throw new Error();
            setSuccess(editGroupIdx !== null ? 'Grupo actualizado' : 'Grupo añadido');
            setForm({ groupTitle: '', name: '', category: '' });
            setRecommendations([]);
            setEditGroupIdx(null);
            fetchGroups();
        } catch {
            setError('Error al guardar grupo');
        } finally {
            setLoading(false);
            setTimeout(() => setSuccess(''), 1500);
        }
    }

    return (
        <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Grupos de Recomendaciones</h2>
            <form className="mb-6 flex flex-col gap-2" onSubmit={handleSaveGroup}>
                <div className='flex-1 mb-2'>
                    <label className="block text-sm font-medium">Título del Grupo</label>
                    <input
                        className="border border-gray-300 rounded px-2 py-1 w-full"
                        value={form.groupTitle}
                        onChange={e => setForm(f => ({ ...f, groupTitle: e.target.value }))}
                        required
                    />
                </div>
                <div className='flex flex-row gap-2 space-x-2 items-end'>
                    <div className='flex-1'>
                        <label className="block text-sm font-medium">Nombre de Recomendación</label>
                        <input
                            className="border border-gray-300 rounded px-2 py-1 w-full"
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        />
                    </div>
                    <div className='flex-1'>
                        <label className="block text-sm font-medium">Categoría</label>
                        <select
                            className="border border-gray-300 rounded px-2 py-1 w-full"
                            value={form.category}
                            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                        >
                            <option value="">Selecciona una categoría</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        className="bg-[#00B0C8] text-white px-4 py-2 rounded hover:bg-[#0090a8]"
                        onClick={handleAddRecommendation}
                        type="button"
                        disabled={!form.name || !form.category}
                    >
                        Añadir
                    </button>
                </div>
                {/* List of recommendations to be added to the group */}
                {recommendations.length > 0 && (
                    <div className="mt-4">
                        <h4 className="font-semibold mb-2">Recomendaciones en este grupo:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                            <ul className="list-disc ml-6">
                                {recommendations.filter((_, idx) => idx % 2 === 0).map((r, idx) => {
                                    const realIdx = idx * 2;
                                    return (
                                        <li key={realIdx} className="flex items-center gap-2">
                                            <span>
                                                <span className="font-medium cursor-pointer text-[#00B0C8] hover:underline" onClick={() => handleEditRecommendation(realIdx)}>{r.name}</span>
                                                <span className="text-sm text-gray-500"> ({r.categoryName})</span>
                                            </span>
                                            <button
                                                type="button"
                                                className="ml-2 text-red-500 hover:text-red-700 text-xs border border-red-200 rounded px-1"
                                                onClick={() => handleRemoveRecommendation(realIdx)}
                                            >
                                                Quitar
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                            <ul className="list-disc ml-6">
                                {recommendations.filter((_, idx) => idx % 2 === 1).map((r, idx) => {
                                    const realIdx = idx * 2 + 1;
                                    return (
                                        <li key={realIdx} className="flex items-center gap-2">
                                            <span>
                                                <span className="font-medium cursor-pointer text-[#00B0C8] hover:underline" onClick={() => handleEditRecommendation(realIdx)}>{r.name}</span>
                                                <span className="text-sm text-gray-500"> ({r.categoryName})</span>
                                            </span>
                                            <button
                                                type="button"
                                                className="ml-2 text-red-500 hover:text-red-700 text-xs border border-red-200 rounded px-1"
                                                onClick={() => handleRemoveRecommendation(realIdx)}
                                            >
                                                Quitar
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                        {editIdx !== null && (
                            <div className="text-xs text-blue-600 mt-2">Editando recomendación, guarda o cancela para continuar.</div>
                        )}
                    </div>
                )}
                <button
                    type="submit"
                    className="bg-[#00B0C8] text-white px-4 py-2 rounded hover:bg-[#0090a8] mt-2 md:mt-0"
                    disabled={loading || !form.groupTitle || recommendations.length === 0}
                >
                    {editGroupIdx !== null ? 'Actualizar Grupo' : 'Crear Grupo'}
                </button>
                {editGroupIdx !== null && (
                    <button
                        type="button"
                        className="ml-2 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 mt-2 md:mt-0"
                        onClick={() => {
                            setEditGroupIdx(null);
                            setForm({ groupTitle: '', name: '', category: '' });
                            setRecommendations([]);
                        }}
                    >
                        Cancelar Edición
                    </button>
                )}
            </form>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            {success && <div className="text-green-600 mb-2">{success}</div>}
            <div>
                <h3 className="text-lg font-semibold mb-2">Grupos Guardados</h3>
                {loading ? (
                    <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, idx) => (
                            <li key={idx} className="bg-white rounded shadow p-3 animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
                                <ul className="space-y-2 mt-2">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <li key={i} className="h-4 bg-gray-100 rounded w-3/4"></li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                        {groups.map((container, idx) => (
                            <div key={container._id} className="break-inside-avoid-column mb-4">
                                <div className="bg-white rounded shadow p-3">
                                    <div className="font-bold flex items-center gap-2">
                                        {container.title}
                                        <button
                                            className="text-xs text-[#00B0C8] border border-[#00B0C820] rounded px-2 py-1 hover:bg-[#00B0C810]"
                                            onClick={() => handleEditGroup(idx)}
                                        >
                                            Editar
                                        </button>
                                    </div>
                                    {container.groups && container.groups.length > 0 && (
                                        <ul className="space-y-2 mt-2">
                                            {container.groups.map((g, gidx) => (
                                                <li key={g._id || gidx}>
                                                    <span className="font-medium">{g.groupTitle}</span>
                                                    {g.category && g.category.name && (
                                                        <span className="ml-2 text-sm text-gray-600">({g.category.name})</span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}