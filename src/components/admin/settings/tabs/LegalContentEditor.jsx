"use client";
import { useState, useEffect } from "react";
import useShopParameter from "@/lib/useShopParameter";
import TextEditModal from "@/components/admin/TextEditModal";
import { toast } from "react-hot-toast";
import { FiEdit2 } from "react-icons/fi";
const LEGAL_KEYS = [
    { key: "privacy_policy", label: "POLÍTICA DE PRIVACIDAD" },
    // { key: "cookies_policy", label: "POLÍTICA DE COOKIES" },
    // { key: "legal_notice", label: "AVISO LEGAL" },
    { key: "terms_conditions", label: "TÉRMINOS Y CONDICIONES" },
    { key: "list_conditions", label: "CONDICIONES DE USO DE LAS LISTAS" },
];
export default function LegalContentEditor() {
    const [content, setContent] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [editingKey, setEditingKey] = useState(null);
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
                setContent(map);
            } catch {
                setError("No se pudieron cargar los textos legales");
                toast.error("Error al cargar los textos legales");
            } finally {
                setLoading(false);
            }
        }
        fetchAll();
    }, []);
    const handleSave = async (key, updatedContent) => {
        try {
            const res = await fetch("/api/shop-parameters", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    key,
                    value: {
                        ca: { value: updatedContent.ca },
                        es: { value: updatedContent.es }
                    },
                    description: key
                }),
            });
            if (!res.ok) throw new Error();
            setContent(prev => ({
                ...prev,
                [key]: {
                    ca: updatedContent.ca,
                    es: updatedContent.es
                }
            }));
            toast.success("Contenido guardado correctamente");
        } catch {
            toast.error("No se pudo guardar el texto legal");
        }
    };
    const getTitle = (key) => {
        const item = LEGAL_KEYS.find(k => k.key === key);
        return item ? item.label : '';
    };
    return (
        <div className="space-y-8">
            {error && <div className="text-red-500 mb-4">{error}</div>}
            {LEGAL_KEYS.map(({ key, label }) => (
                <div key={key} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">{label}</h2>
                        <button
                            onClick={() => setEditingKey(key)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#36A9E1] text-white rounded-md hover:bg-[#2D8EC0] transition-colors"
                        >
                            <FiEdit2 className="w-4 h-4" />
                            <span>Editar</span>
                        </button>
                    </div>
                    {/* <div className="prose max-w-none mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-2 uppercase">CATALÀ</h3>
                                <div className="bg-white p-4 rounded border border-gray-200 min-h-[100px] whitespace-pre-wrap h-full">
                                    {content[key]?.ca || <span className="text-gray-400">No hi ha contingut</span>}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-2 uppercase">ESPAÑOL</h3>
                                <div className="bg-white p-4 rounded border border-gray-200 min-h-[100px] whitespace-pre-wrap h-full">  
                                    {content[key]?.es || <span className="text-gray-400">No hay contenido</span>}
                                </div>
                            </div>
                        </div>
                    </div> */}
                </div>
            ))}
            {editingKey && (
                <TextEditModal
                    isOpen={true}
                    onClose={() => setEditingKey(null)}
                    title={getTitle(editingKey)}
                    content={{
                        ca: content[editingKey]?.ca || '',
                        es: content[editingKey]?.es || ''
                    }}
                    onSave={(updatedContent) => {
                        handleSave(editingKey, updatedContent);
                        setEditingKey(null);
                    }}
                />
            )}
        </div>
    );
}
