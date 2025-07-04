import { useEffect, useState } from "react";
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
} from "lucide-react";

const iconMap = {
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
};

export default function useShopSocials() {
    const [socials, setSocials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSocials() {
            try {
                const res = await fetch("/api/shop-parameters");
                if (!res.ok) throw new Error("Failed to fetch parameters");
                const params = await res.json();
                const socials = params
                    .filter((p) => p.key.startsWith("social_") && p.value)
                    .map((p) => {
                        let name = p.key.replace("social_", "");
                        let icon = "Globe";
                        if (p.description) {
                            try {
                                const desc = JSON.parse(p.description);
                                name = desc.name || name;
                                icon = desc.icon || icon;
                            } catch { }
                        }
                        return {
                            key: p.key,
                            name,
                            link: p.value,
                            icon,
                            Icon: iconMap[icon] || Globe,
                        };
                    });
                setSocials(socials);
            } finally {
                setLoading(false);
            }
        }
        fetchSocials();
    }, []);

    return { socials, loading };
}
