"use client";
import { useTranslations } from 'next-intl';
export default function LoginButton() {
    const t = useTranslations('UserAuthModal');
    return (
        <button
            type="button"
            className="mt-4 md:mt-0 px-8 py-3 bg-white text-[#36A9E1] rounded-full font-medium hover:bg-gray-100 transition-colors"
            onClick={() => {
                const btn = document.getElementById('login-button');
                if (btn) btn.click();
            }}
        >
            {t('CrearLista', { default: 'Crear lista' })}
        </button>
    );
}
