// Utility to get translated field from product (name/description)
export function getTranslatedField(product, field, locale = 'es') {
    if (!product) return '';
    // Try translations object first
    if (product.translations && product.translations[locale] && product.translations[locale][field]) {
        return product.translations[locale][field];
    }
    // Try direct object (for admin style: { name: { es: '', ca: '' } })
    if (typeof product[field] === 'object' && product[field] !== null) {
        return product[field][locale] || product[field].es || product[field].ca || '';
    }
    // Fallback to string
    return product[field] || '';
}