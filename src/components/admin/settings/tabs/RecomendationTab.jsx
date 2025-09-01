
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslations, useLocale } from 'next-intl';

export default function ProductosTab() {
    const locale = useLocale();
    const [groups, setGroups] = useState([]);
    const [editGroupIdx, setEditGroupIdx] = useState(null);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({ groupTitle: { ca: '', es: '' }, name: { ca: '', es: '' }, category: '' });
    const [recommendations, setRecommendations] = useState([]);
    const [editIdx, setEditIdx] = useState(null);
    const [loading, setLoading] = useState(false);

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
        // Defensive: ensure groupTitle and category are always objects, and handle MongoDB ObjectId
        setForm({
            groupTitle: typeof group.title === 'object' ? group.title : { ca: '', es: '' },
            name: { ca: '', es: '' },
            category: ''
        });
        setRecommendations(
            (group.groups || []).map(g => {
                // Handle MongoDB ObjectId for category
                let categoryId = '';
                if (g.category) {
                    if (typeof g.category === 'object' && g.category.$oid) {
                        categoryId = g.category.$oid;
                    } else if (g.category._id && typeof g.category._id === 'object' && g.category._id.$oid) {
                        categoryId = g.category._id.$oid;
                    } else if (typeof g.category === 'string') {
                        categoryId = g.category;
                    } else if (g.category._id) {
                        categoryId = g.category._id;
                    }
                }
                // Defensive: ensure groupTitle is always an object
                let groupTitle = g.groupTitle;
                if (typeof groupTitle !== 'object' || groupTitle === null) {
                    groupTitle = { ca: '', es: '' };
                }
                return {
                    name: groupTitle,
                    category: categoryId,
                    categoryName: '' // Will be filled when adding/editing
                };
            })
        );
    }


    function handleAddRecommendation(e) {
        e.preventDefault();
        if (!form.category) {
            toast.error(locale === 'es' ? 'Debes seleccionar una categoría' : locale === 'en' ? 'You must select a category' : 'Has de seleccionar una categoria');
            return;
        }
        if (!form.name.ca || !form.name.es) return;
        const selectedCategory = categories.find(c => {
            // Defensive: handle MongoDB ObjectId
            if (typeof c._id === 'object' && c._id.$oid) {
                return c._id.$oid === form.category;
            }
            return c._id === form.category;
        });
        const categoryName = (selectedCategory && typeof selectedCategory.name === 'object')
            ? (selectedCategory.name[locale] || selectedCategory.name.ca || selectedCategory.name.es || '')
            : (selectedCategory?.name || '');
        if (editIdx !== null) {
            // Edit mode
            setRecommendations(prev => prev.map((r, idx) => idx === editIdx ? {
                name: { ...form.name },
                category: form.category,
                categoryName
            } : r));
            setEditIdx(null);
        } else {
            // Add mode
            setRecommendations(prev => [
                ...prev,
                { name: { ...form.name }, category: form.category, categoryName }
            ]);
        }
        setForm(f => ({ ...f, name: { ca: '', es: '' }, category: '' }));
    }

    function handleEditRecommendation(idx) {
        const rec = recommendations[idx];
        setForm(f => ({ ...f, name: { ...rec.name }, category: rec.category }));
        setEditIdx(idx);
    }

    function handleRemoveRecommendation(idx) {
        setRecommendations(prev => prev.filter((_, i) => i !== idx));
        // If editing the one being removed, reset edit
        if (editIdx === idx) {
            setEditIdx(null);
            setForm(f => ({ ...f, name: { ca: '', es: '' }, category: '' }));
        }
    }

    async function handleSaveGroup(e) {
        e.preventDefault();
        setLoading(true);
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
            toast.success(editGroupIdx !== null ?
                (locale === 'es' ? 'Grupo actualizado' : locale === 'en' ? 'Group updated' : 'Grup actualitzat') :
                (locale === 'es' ? 'Grupo añadido' : locale === 'en' ? 'Group added' : 'Grup afegit'));
            setForm({ groupTitle: { ca: '', es: '' }, name: { ca: '', es: '' }, category: '' });
            setRecommendations([]);
            setEditGroupIdx(null);
            fetchGroups();
        } catch {
            toast.error(locale === 'es' ? 'Error al guardar el grupo' : locale === 'en' ? 'Error saving group' : 'Error al desar el grup');
        } finally {
            setLoading(false);
        }
    }

    // Delete group handler
    async function handleDeleteGroup(idx) {
        if (!window.confirm(locale === 'es' ? '¿Seguro que quieres eliminar este grupo?' : locale === 'en' ? 'Are you sure you want to delete this group?' : 'Segur que vols eliminar aquest grup?')) return;
        const group = groups[idx];
        if (!group || !group._id) return;
        setLoading(true);
        try {
            const res = await fetch('/api/admin/recommendations', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: group._id })
            });
            if (!res.ok) throw new Error();
            toast.success(locale === 'es' ? 'Grupo eliminado' : locale === 'en' ? 'Group deleted' : 'Grup eliminat');
            fetchGroups();
        } catch (e) {
            toast.error(locale === 'es' ? 'Error al eliminar el grupo' : locale === 'en' ? 'Error deleting group' : 'Error al eliminar el grup');
        } finally {
            setLoading(false);
            setTimeout(() => setSuccess(''), 1500);
        }
    }

    return (
        <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-bold mb-4">{locale === 'es' ? 'Grupos de Recomendaciones' : locale === 'en' ? 'Recommendation Groups' : 'Grups de Recomanacions'}</h2>
            <form className="mb-6 flex flex-col gap-2" onSubmit={handleSaveGroup}>
                <div className='flex-1 flex felx-col mb-2 space-x-4'>
                    <div className='flex-1'>
                        <label className="block text-sm font-medium">{locale === 'es' ? 'Título del Grupo (CA)' : locale === 'en' ? 'Group Title (CA)' : 'Títol del Grup (CA)'}</label>

                        <input
                            className="border border-gray-300 rounded px-2 py-1 w-full mb-1"
                            value={form.groupTitle.ca}
                            onChange={e => setForm(f => ({ ...f, groupTitle: { ...f.groupTitle, ca: e.target.value } }))}
                            required
                        />
                    </div>
                    <div className='flex-1'>
                        <label className="block text-sm font-medium">{locale === 'es' ? 'Título del Grupo (ES)' : locale === 'en' ? 'Group Title (ES)' : 'Títol del Grup (ES)'}</label>
                        <input
                            className="border border-gray-300 rounded px-2 py-1 w-full"
                            value={form.groupTitle.es}
                            onChange={e => setForm(f => ({ ...f, groupTitle: { ...f.groupTitle, es: e.target.value } }))}
                            required
                        />
                    </div>

                </div>
                <div className='flex flex-row gap-2 space-x-2 items-end'>
                    <div className='flex-1'>
                        <label className="block text-sm font-medium">{locale === 'es' ? 'Nombre de Recomendación (CA)' : locale === 'en' ? 'Recommendation Name (CA)' : 'Nom de Recomanació (CA)'}</label>
                        <input
                            className="border border-gray-300 rounded px-2 py-1 w-full mb-1"
                            value={form.name.ca}
                            onChange={e => setForm(f => ({ ...f, name: { ...f.name, ca: e.target.value } }))}
                        />
                    </div>

                    <div className='flex-1'>

                        <label className="block text-sm font-medium">{locale === 'es' ? 'Nombre de Recomendación (ES)' : locale === 'en' ? 'Recommendation Name (ES)' : 'Nom de Recomanació (ES)'}</label>
                        <input
                            className="border border-gray-300 rounded px-2 py-1 w-full"
                            value={form.name.es}
                            onChange={e => setForm(f => ({ ...f, name: { ...f.name, es: e.target.value } }))}
                        />
                    </div>
                    <div className='flex-1'>
                        <label className="block text-sm font-medium">{locale === 'es' ? 'Categoría' : locale === 'en' ? 'Category' : 'Categoria'}</label>
                        <select
                            className="border border-gray-300 rounded px-2 py-1 w-full"
                            value={form.category}
                            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                        >
                            <option value="">{locale === 'es' ? 'Selecciona una categoría' : locale === 'en' ? 'Select a category' : 'Selecciona una categoria'}</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name?.[locale]}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        className="bg-[#36A9E1] text-white px-4 py-2 rounded hover:bg-[#3f93ba]"
                        onClick={handleAddRecommendation}
                        type="button"
                        disabled={!form.name.ca || !form.name.es || !form.category}
                    >
                        {locale === 'es' ? 'Añadir' : locale === 'en' ? 'Add' : 'Afegir'}
                    </button>
                </div>
                {/* Llista de recomanacions a afegir al grup */}
                {recommendations.length > 0 && (
                    <div className="mt-4">
                        <h4 className="font-semibold mb-2">{locale === 'es' ? 'Recomendaciones en este grupo:' : locale === 'en' ? 'Recommendations in this group:' : 'Recomanacions en aquest grup:'}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                            <ul className="list-disc ml-6">
                                {recommendations.filter((_, idx) => idx % 2 === 0).map((r, idx) => {
                                    const realIdx = idx * 2;
                                    return (
                                        <li key={realIdx} className="flex items-center gap-2">
                                            <span>
                                                <span className="font-medium cursor-pointer text-[#36A9E1] hover:underline" onClick={() => handleEditRecommendation(realIdx)}>
                                                    {r.name?.ca || ''}
                                                    {r.name?.es ? ` / ${r.name.es}` : ''}
                                                </span>
                                                {/* <span className="text-sm text-gray-500"> ({r.categoryName[locale]})</span> */}
                                            </span>
                                            <button
                                                type="button"
                                                className="ml-2 text-red-500 hover:text-red-700 text-xs border border-red-200 rounded px-1"
                                                onClick={() => handleRemoveRecommendation(realIdx)}
                                            >
                                                Treure
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
                                                <span className="font-medium cursor-pointer text-[#36A9E1] hover:underline" onClick={() => handleEditRecommendation(realIdx)}>
                                                    {r.name?.ca || ''}
                                                    {r.name?.es ? ` / ${r.name.es}` : ''}
                                                </span>
                                                {/* <span className="text-sm text-gray-500"> {r.categoryName}</span> */}
                                            </span>
                                            <button
                                                type="button"
                                                className="ml-2 text-red-500 hover:text-red-700 text-xs border border-red-200 rounded px-1"
                                                onClick={() => handleRemoveRecommendation(realIdx)}
                                            >
                                                Treure
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                        {editIdx !== null && (
                            <div className="text-xs text-blue-600 mt-2">
                                {locale === 'es'
                                    ? 'Editando recomendación, guarda o cancela para continuar.'
                                    : locale === 'en'
                                        ? 'Editing recommendation, save or cancel to continue.'
                                        : 'Editant recomanació, desa o cancel·la per continuar.'}
                            </div>
                        )}
                    </div>
                )}
                <button
                    type="submit"
                    className="bg-[#36A9E1] text-white px-4 py-2 rounded hover:bg-[#3f93ba] mt-2 md:mt-0"
                    disabled={loading || !form.groupTitle || recommendations.length === 0}
                >
                    {editGroupIdx !== null
                        ? (locale === 'es' ? 'Actualizar Grupo' : locale === 'en' ? 'Update Group' : 'Actualitzar Grup')
                        : (locale === 'es' ? 'Crear Grupo' : locale === 'en' ? 'Create Group' : 'Crear Grup')
                    }
                </button>
                {editGroupIdx !== null && (
                    <button
                        type="button"
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 mt-2 md:mt-0"
                        onClick={() => {
                            setEditGroupIdx(null);
                            setForm({ groupTitle: { ca: '', es: '' }, name: { ca: '', es: '' }, category: '' });
                            setRecommendations([]);
                        }}
                    >
                        {locale === 'es' ? 'Cancelar Edición' : locale === 'en' ? 'Cancel Editing' : 'Cancel·lar Edició'}
                    </button>
                )}
            </form>

            <div>
                <h3 className="text-lg font-semibold mb-2">{locale === 'es' ? 'Grupos guardados' : locale === 'en' ? 'Saved Groups' : 'Grups desats'}</h3>
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
                                        {container.title?.ca || ''}
                                        {container.title?.es ? ` / ${container.title.es}` : ''}
                                        <button
                                            className="text-xs text-[#36A9E1] border border-[#00B0C820] rounded px-2 py-1 hover:bg-[#00B0C810]"
                                            onClick={() => handleEditGroup(idx)}
                                        >
                                            {locale === 'es' ? 'Editar' : locale === 'en' ? 'Edit' : 'Editar'}
                                        </button>
                                        <button
                                            className="text-xs text-red-500 border border-red-200 rounded px-2 py-1 hover:bg-red-50"
                                            onClick={() => handleDeleteGroup(idx)}
                                        >
                                            {locale === 'es' ? 'Eliminar' : locale === 'en' ? 'Delete' : 'Eliminar'}
                                        </button>
                                    </div>

                                    {container.groups && container.groups.length > 0 && (
                                        <ul className="space-y-2 mt-2">
                                            {container.groups.map((g, gidx) => {
                                                // Defensive: ensure groupTitle is always an object
                                                let groupTitle = g.groupTitle;
                                                if (typeof groupTitle !== 'object' || groupTitle === null) {
                                                    groupTitle = { ca: '', es: '' };
                                                }
                                                // Defensive: handle MongoDB ObjectId for category
                                                let categoryName = '';
                                                if (g.category && g.category.name) {
                                                    if (typeof g.category.name === 'object') {
                                                        categoryName = g.category.name[locale] || g.category.name.ca || g.category.name.es || '';
                                                    } else {
                                                        categoryName = g.category.name;
                                                    }
                                                }
                                                return (
                                                    <li key={g._id || gidx}>
                                                        <span className="font-medium">
                                                            {groupTitle.ca || ''}
                                                            {groupTitle.es ? ` / ${groupTitle.es}` : ''}
                                                        </span>
                                                        {categoryName && (
                                                            <span className="ml-2 text-sm text-gray-600">
                                                                ({categoryName})
                                                            </span>
                                                        )}
                                                    </li>
                                                );
                                            })}
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