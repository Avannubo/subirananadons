export class DiscountService {
    static async updateProductDiscounts() {
        try {
            const response = await fetch('/api/products/update-discounts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed to update discounts');
            }
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error updating discounts:', error);
            throw error;
        }
    }
    static isDiscountActive(discount) {
        if (!discount || !discount.startDate || !discount.endDate) {
            return false;
        }
        const now = new Date();
        const startDate = new Date(discount.startDate);
        const endDate = new Date(discount.endDate);
        return now >= startDate && now <= endDate;
    }
}
