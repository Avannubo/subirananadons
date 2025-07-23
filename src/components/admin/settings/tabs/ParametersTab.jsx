import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Youtube,
    Github,
    Dribbble,
    Twitch,
    Mail,
    Globe,
    Pencil,
    Trash2
} from 'lucide-react';
import { useLocale } from 'next-intl';

// Helper for fetching and saving parameters
async function fetchParameters() {
    const res = await fetch("/api/shop-parameters");
    if (!res.ok) throw new Error("Failed to fetch parameters");
    return await res.json();
}

async function saveParameter(key, value, description = "") {
    const res = await fetch("/api/shop-parameters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value, description }),
    });
    if (!res.ok) throw new Error("Failed to save parameter");
    return await res.json();
}

export default function ParametersTab() {
    const locale = useLocale();

    // Generalized parameter state
    const [parameters, setParameters] = useState({});
    const [edit, setEdit] = useState({}); // { key: value }
    const [editing, setEditing] = useState({}); // { key: boolean }
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Load parameters and socials on mount
    useEffect(() => {
        fetchParameters()
            .then((params) => {
                const paramMap = {};
                const socialsArr = [];
                params.forEach((p) => {
                    paramMap[p.key] = p.value;
                    if (p.key.startsWith('social_')) {
                        let name = p.key.replace('social_', '');
                        let icon = 'Globe';
                        let iconId = 'Globe';
                        if (p.description) {
                            try {
                                const desc = JSON.parse(p.description);
                                name = desc.name || name;
                                icon = desc.icon || icon;
                                iconId = desc.iconId || icon;
                            } catch { }
                        }
                        socialsArr.push({
                            key: p.key,
                            name,
                            link: p.value,
                            icon,
                            iconId,
                        });
                    }
                });
                setParameters(paramMap);
                setSocials(socialsArr);
            })
            .catch(() => setError(locale === 'ca' ? "No s'han pogut carregar els paràmetres" : "No se pudieron cargar los parámetros"));
    }, []);

    // Helper for starting edit
    const startEdit = (key) => {
        setEdit((prev) => ({ ...prev, [key]: parameters[key] }));
        setEditing((prev) => ({ ...prev, [key]: true }));
    };
    // Helper for canceling edit
    const cancelEdit = (key) => {
        setEdit((prev) => ({ ...prev, [key]: parameters[key] }));
        setEditing((prev) => ({ ...prev, [key]: false }));
    };
    // Helper for saving edit
    const saveEdit = async (key, description = "") => {
        setLoading(true);
        setError("");
        try {
            const saved = await saveParameter(key, edit[key], description);
            setParameters((prev) => ({ ...prev, [key]: saved.value }));
            setEditing((prev) => ({ ...prev, [key]: false }));
        } catch (e) {
            setError(locale === 'ca' ? "No s'ha pogut desar el paràmetre" : "No se pudo guardar el parámetro");
        } finally {
            setLoading(false);
        }
    };

    // Define parameters to show (add more here)
    const parameterDefs = [
        {
            key: "iva",
            label: "IVA (%)",
            type: "number",
            min: 0,
            max: 100,
            description: "Porcentaje de IVA aplicado en la tienda",
            unit: "%",
        },
        {
            key: "telephone",
            label: "Teléfono",
            type: "text",
            description: "Teléfono de contacto mostrado en la web",
            unit: "",
        },
        {
            key: "whatsapp",
            label: "WhatsApp",
            type: "text",
            description: "Número de WhatsApp mostrado en la web (solo los 9 dígitos, sin prefijo ni espacios)",
            unit: "",
            sanitize: (value) => {
                // Remove country code, non-digits, and keep first 9 digits
                const digits = (value || "").replace(/\D/g, "");
                return digits.slice(-9); // Take last 9 digits (in case user pastes with country code)
            }
        },
        {
            key: "address",
            label: "Dirección",
            type: "text",
            description: "Dirección física de la tienda mostrada en la web",
            unit: "",
        },
        {
            key: "horari",
            label: "Horario",
            type: "text",
            description: "Horario de apertura mostrado en la web",
            unit: "",
        },
        {
            key: "email",
            label: "Email",
            type: "email",
            description: "Correo electrónico de contacto mostrado en la web",
            unit: "",
        },
    ];

    // Socials parameter state
    const [socials, setSocials] = useState([]);

    // For adding new social
    const [newSocial, setNewSocial] = useState({ name: '', link: '', icon: 'Instagram' });
    const [addingSocial, setAddingSocial] = useState(false);

    // Icon options
    const iconOptions = [
        { name: 'Facebook', Icon: Facebook },
        { name: 'Twitter', Icon: Twitter },
        { name: 'Instagram', Icon: Instagram },
        { name: 'Linkedin', Icon: Linkedin },
        { name: 'Youtube', Icon: Youtube },
        { name: 'Github', Icon: Github },
        { name: 'Dribbble', Icon: Dribbble },
        { name: 'Twitch', Icon: Twitch },
        { name: 'Mail', Icon: Mail },
        { name: 'Globe', Icon: Globe },
    ];

    // Add new social
    const handleAddSocial = async () => {
        const name = newSocial.name.trim();
        const link = newSocial.link.trim();
        const icon = newSocial.icon;
        if (!name || !link) return;
        // Generate a unique key for the social based on the name
        const key = `social_${name.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
        try {
            setLoading(true);
            setError("");
            // Save icon id as 'iconId' for clarity
            await saveParameter(key, link, JSON.stringify({ name, icon, iconId: icon }));
            setSocials(prev => [...prev, { ...newSocial, name, link, icon, iconId: icon, key }]);
            setParameters(prev => ({ ...prev, [key]: link }));
            setNewSocial({ name: '', link: '', icon: 'Instagram' });
            setAddingSocial(false);
        } catch (e) {
            setError(locale === 'ca' ? "No s'ha pogut desar la xarxa social" : "No se pudo guardar la red social");
        } finally {
            setLoading(false);
        }
    };

    // Remove social (from UI and DB)
    const handleRemoveSocial = async (key) => {
        setLoading(true);
        setError("");
        try {
            // Remove from DB
            await fetch("/api/shop-parameters", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key }),
            });
            // Remove from UI state
            setSocials(prev => prev.filter(s => s.key !== key));
            setParameters(prev => {
                const copy = { ...prev };
                delete copy[key];
                return copy;
            });
        } catch (e) {
            setError(locale === 'ca' ? "No s'ha pogut eliminar la xarxa social" : "No se pudo eliminar la red social");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 mx-auto ">
            {error && <div className="text-red-500">{error}</div>}
            {/* General Parameters */}
            {parameterDefs.map((param) => (
                <div key={param.key} className="bg-gray-50 p-4 flex flex-row justify-between items-center rounded-lg border border-gray-200">
                    <div className="flex-1 flex-col w-full">
                        <h2 className="text-lg font-semibold mb-2">{param.label}</h2>
                        {param.key === "whatsapp" && (
                            <span className="text-xs text-gray-500 mb-2">{locale === 'ca' ? "Introdueix només el número espanyol, sense prefix internacional ni espais. Exemple: 612345678" : "Introduce solo el número español, sin prefijo internacional ni espacios. Ejemplo: 612345678"}</span>
                        )}
                    </div>
                    {editing[param.key] ? (
                        <div className="flex-1 flex flex-row justify-end items-center gap-2">
                            {param.key === "horari" ? (
                                <textarea
                                    value={edit[param.key] ?? ""}
                                    onChange={e => setEdit((prev) => ({ ...prev, [param.key]: e.target.value }))}
                                    className="w-64 h-20 border border-gray-300 rounded-md p-2 text-sm resize-y"
                                    placeholder={locale === 'ca' ? 'Introdueix el horari' : 'Introduce el horario'}
                                />
                            ) : (
                                <Input
                                    type={param.type}
                                    min={param.min}
                                    max={param.max}
                                    value={edit[param.key] ?? ""}
                                    onChange={e => {
                                        let val = e.target.value;
                                        if (param.key === "whatsapp" && param.sanitize) {
                                            val = param.sanitize(val);
                                        } else if (param.type === "number") {
                                            val = Number(val);
                                        }
                                        setEdit((prev) => ({ ...prev, [param.key]: val }));
                                    }}
                                    className="w-24"
                                />
                            )}
                            {param.unit && <span>{param.unit}</span>}
                            <button
                                onClick={() => saveEdit(param.key, param.description)}
                                className="px-3 py-1 bg-[#00B0C8] text-white rounded hover:bg-[#0090a8]"
                                disabled={loading}
                            >
                                {locale === 'ca' ? 'Desar' : 'Guardar'}
                            </button>
                            <button
                                onClick={() => cancelEdit(param.key)}
                                className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                disabled={loading}
                            >
                                {locale === 'ca' ? 'Cancel·lar' : 'Cancelar'}
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 justify-end">
                            {param.key === "horari" ? (
                                <span className="text-md whitespace-pre-line text-right block">{parameters[param.key]}</span>
                            ) : (
                                <span className="text-md">{parameters[param.key]} {param.unit}</span>
                            )}
                            <button
                                onClick={() => startEdit(param.key)}
                                className="p-1 rounded hover:bg-[#e6f7fa] border border-[#F6A609] transition"
                                title="Editar"
                            >
                                <Pencil size={18} className="text-[#F6A609]" />
                            </button>
                        </div>
                    )}
                </div>
            ))}

            {/* Socials Parameters */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <h2 className="text-lg font-bold mb-4 flex items-center justify-between">{locale === 'ca' ? 'Xarxes Socials' : 'Redes Sociales'}
                    <button
                        className="ml-4 px-3 py-1 bg-[#00B0C8]/10 text-[#00B0C8] rounded hover:bg-[#00B0C8]/20 border border-[#00B0C8] text-sm transition"
                        onClick={() => setAddingSocial(v => !v)}
                    >
                        {addingSocial ? (locale === 'ca' ? 'Cancel·lar' : 'Cancelar') : (locale === 'ca' ? 'Afegir nova' : 'Añadir nueva')}
                    </button>
                </h2>
                {addingSocial && (
                    <div className="flex flex-col md:flex-row gap-2 mb-4 items-center">
                        <Input
                            type="text"
                            placeholder={locale === 'ca' ? 'Nom' : 'Nombre'}
                            value={newSocial.name}
                            onChange={e => setNewSocial(s => ({ ...s, name: e.target.value }))}
                            className="w-40"
                        />
                        <Input
                            type="text"
                            placeholder={locale === 'ca' ? 'Enllaç' : 'Enlace'}
                            value={newSocial.link}
                            onChange={e => setNewSocial(s => ({ ...s, link: e.target.value }))}
                            className="w-40"
                        />
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">{locale === 'ca' ? 'Icona:' : 'Icono:'}</span>
                            <select
                                value={newSocial.icon}
                                onChange={e => setNewSocial(s => ({ ...s, icon: e.target.value }))}
                                className="border border-gray-200 rounded-md p-2 text-sm"
                            >
                                {iconOptions.map(({ name }) => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                            {(() => {
                                const Icon = iconOptions.find(i => i.name === newSocial.icon)?.Icon;
                                return Icon ? <span className="ml-1"><Icon size={20} /></span> : null;
                            })()}
                        </div>
                        <button
                            className="px-3 py-1 bg-[#00B0C8] text-white rounded hover:bg-[#0090a8] text-sm transition"
                            onClick={handleAddSocial}
                        >
                            {locale === 'ca' ? 'Afegir' : 'Añadir'}
                        </button>
                    </div>
                )}
                <div className="space-y-4">
                    {socials.map((param) => {
                        const Icon = iconOptions.find(i => i.name === param.icon)?.Icon;
                        return (
                            <div key={param.key} className="flex flex-row justify-between items-center">
                                <label className="font-medium w-40 flex items-center gap-2" htmlFor={param.key}>
                                    {Icon && <Icon size={20} />}
                                    {param.name}
                                </label>
                                {editing[param.key] ? (
                                    <div className="flex items-center gap-2 ">
                                        <Input
                                            id={param.key}
                                            type="text"
                                            value={edit[param.key] ?? param.link}
                                            placeholder={param.link}
                                            onChange={e => setEdit((prev) => ({ ...prev, [param.key]: e.target.value }))}
                                            className="w-full max-w-xs"
                                        />
                                        <button
                                            onClick={() => saveEdit(param.key, param.name)}
                                            className="px-3 py-1 bg-[#00B0C8] text-white rounded hover:bg-[#0090a8] transition"
                                            disabled={loading}
                                        >
                                            {locale === 'ca' ? 'Desar' : 'Guardar'}
                                        </button>
                                        <button
                                            onClick={() => cancelEdit(param.key)}
                                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 border border-gray-300 transition"
                                            disabled={loading}
                                        >
                                            {locale === 'ca' ? 'Cancel·lar' : 'Cancelar'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4 ">
                                        <span className="truncate text-md text-gray-700 max-w-xs">{parameters[param.key] || param.link || <span className="text-gray-400">{locale === 'ca' ? 'No configurat' : 'No configurado'}</span>}</span>
                                        <button
                                            onClick={() => startEdit(param.key)}
                                            className="p-1 rounded hover:bg-[#fff7e6] border border-[#F6A609] transition"
                                            title="Editar"
                                        >
                                            <Pencil size={18} className="text-[#F6A609]" />
                                        </button>
                                        <button
                                            onClick={() => handleRemoveSocial(param.key)}
                                            className="p-1 rounded hover:bg-[#ffd6d6] border border-[#e53935] transition"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={18} className="text-[#e53935]" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}