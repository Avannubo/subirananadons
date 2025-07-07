import { useEffect, useState } from "react";

export default function useShopParameter(key) {
    const [value, setValue] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchParam() {
            try {
                const res = await fetch("/api/shop-parameters");
                if (!res.ok) throw new Error("Failed to fetch parameters");
                const params = await res.json();
                const param = params.find((p) => p.key === key);
                setValue(param ? param.value : "");
            } finally {
                setLoading(false);
            }
        }
        fetchParam();
    }, [key]);

    return { value, loading };
}
