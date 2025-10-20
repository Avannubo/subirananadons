// Utility to get translated field from product (name/description)
export function getTranslatedField(product, field, locale = 'es') {
    if (!product) return '';
    // Normalize locale to primary language (e.g., 'es-ES' -> 'es')
    const lang = (locale || 'es').split('-')[0];
    // Try translations object first
    if (product.translations && product.translations[lang] && product.translations[lang][field]) {
        return product.translations[lang][field];
    }
    // Try direct object (for admin style: { name: { es: '', ca: '' } })
    if (typeof product[field] === 'object' && product[field] !== null) {
        return product[field][lang] || product[field].es || product[field].ca || '';
    }
    // Fallback to string
    return product[field] || '';
}