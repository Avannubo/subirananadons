"use client";
import { useState, useEffect } from "react";
import useShopParameter from "@/lib/useShopParameter";

const LEGAL_KEYS = [
    { key: "privacy_policy", label: "POLÍTICA DE PRIVACIDAD" },
    // { key: "cookies_policy", label: "POLÍTICA DE COOKIES" },
    // { key: "legal_notice", label: "AVISO LEGAL" },
    { key: "terms_conditions", label: "Términos y Condiciones" },
    { key: "list_conditions", label: "Condiciones de uso de las listas" },
];

export default function LegalContentEditor() {
    const [edit, setEdit] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [initial, setInitial] = useState({});

    useEffect(() => {
        async function fetchAll() {
            setLoading(true);
            setError("");
            try {
                const res = await fetch("/api/shop-parameters");
                const params = await res.json();
                const map = {};
                LEGAL_KEYS.forEach(({ key }) => {
                    const param = params.find((p) => p.key === key);
                    map[key] = {
                        ca: param?.value?.ca?.value || "",
                        es: param?.value?.es?.value || ""
                    };
                });
                setEdit(map);
                setInitial(map);
            } catch {
                setError("No se pudieron cargar los textos legales");
            } finally {
                setLoading(false);
            }
        }
        fetchAll();
    }, []);

    const handleChange = (key, lang, value) => {
        setEdit((prev) => ({
            ...prev,
            [key]: {
                ...prev[key],
                [lang]: value
            }
        }));
    };

    const handleSave = async (key) => {
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            const res = await fetch("/api/shop-parameters", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    key,
                    value: {
                        ca: { value: edit[key].ca },
                        es: { value: edit[key].es }
                    },
                    description: key // send as string, not object
                }),
            });
            if (!res.ok) throw new Error();
            setSuccess("Guardado");
            setInitial((prev) => ({ ...prev, [key]: { ...edit[key] } }));
        } catch {
            setError("No se pudo guardar el texto legal");
        } finally {
            setLoading(false);
            setTimeout(() => setSuccess(""), 1500);
        }
    };

    return (
        <div className="space-y-8">
            {error && <div className="text-red-500">{error}</div>}
            {LEGAL_KEYS.map(({ key, label }) => (
                <div key={key} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h2 className="font-bold mb-2">{label}</h2>
                    <div className="mb-2">
                        <label className="block font-semibold mb-1">Català</label>
                        <textarea
                            className="w-full min-h-[120px] border border-gray-300 rounded p-2 mb-2"
                            value={edit[key]?.ca || ""}
                            onChange={(e) => handleChange(key, 'ca', e.target.value)}
                            disabled={loading}
                        />
                        <label className="block font-semibold mb-1">Castellano</label>
                        <textarea
                            className="w-full min-h-[120px] border border-gray-300 rounded p-2"
                            value={edit[key]?.es || ""}
                            onChange={(e) => handleChange(key, 'es', e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            className="px-3 py-1 bg-[#00B0C8] text-white rounded hover:bg-[#0090a8]"
                            onClick={() => handleSave(key)}
                            disabled={loading || (edit[key]?.ca === initial[key]?.ca && edit[key]?.es === initial[key]?.es)}
                        >
                            Guardar
                        </button>
                        <button
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                            onClick={() => setEdit((prev) => ({ ...prev, [key]: { ...initial[key] } }))}
                            disabled={loading || (edit[key]?.ca === initial[key]?.ca && edit[key]?.es === initial[key]?.es)}
                        >
                            Cancelar
                        </button>
                        {success && <span className="text-green-600">{success}</span>}
                    </div>
                </div>
            ))}
        </div>
    );
}
