import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export async function POST() {
    try {
        await dbConnect();

        const now = new Date();

        // Find all products with active discounts that have both start and end dates
        const products = await Product.find({
            'discount.active': true,
            'discount.startDate': { $exists: true, $ne: null, $ne: '' },
            'discount.endDate': { $exists: true, $ne: null, $ne: '' }
        });

        let updatedCount = 0;

        for (const product of products) {
            // Only process products that have valid dates
            if (product.discount.startDate && product.discount.endDate) {
                const startDate = new Date(product.discount.startDate);
                const endDate = new Date(product.discount.endDate);

                // Check if the discount has expired
                if (now > endDate) {
                    // Reset discount only if it's expired
                    product.discount = {
                        active: false,
                        type: 'percentage',
                        value: null,
                        startDate: null,
                        endDate: null,
                        minPurchaseAmount: null,
                        minQuantity: null,
                        finalPrice: null
                    };
                    await product.save();
                    updatedCount++;
                } else if (now >= startDate && !product.discount.active) {
                    // Activate the discount if it's time and not already active
                    product.discount.active = true;
                    await product.save();
                    updatedCount++;
                }
            }
        }

        return NextResponse.json({ success: true, updated: updatedCount });
    } catch (error) {
        console.error('Error updating discounts:', error);
        return NextResponse.json(
            { error: 'Failed to update discounts' },
            { status: 500 }
        );
    }
}
