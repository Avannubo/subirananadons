"use client";
import { useTranslations } from 'next-intl';
export default function LoginButton() {
    const t = useTranslations('UserAuthModal');
    return (
        <button
            type="button"
            className="mt-8 px-6 py-3 bg-[#36A9E1] text-white rounded-lg font-semibold shadow hover:bg-[#3f93ba] transition-colors"
            onClick={() => {
                const btn = document.getElementById('login-button');
                if (btn) btn.click();
            }}
        >
            {t('loginBtnShort', { default: 'Iniciar sesión' })}
        </button>
    );
}
