"use client";

import { useTranslations } from 'next-intl';

export default function LoginButton() {
    const t = useTranslations('UserAuthModal');
    return (
        <button
            type="button"
            className="mt-8 px-6 py-3 bg-[#00B0C8] text-white rounded-lg font-semibold shadow hover:bg-[#0090a8] transition-colors"
            onClick={() => {
                const btn = document.getElementById('login-button');
                if (btn) btn.click();
            }}
        >
            {t('loginBtnShort', { default: 'Iniciar sesión' })}
        </button>
    );
}
