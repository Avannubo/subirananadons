import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
    try {
        const { db } = await connectToDatabase();

        // Get total product count
        const totalProducts = await db.collection('products').countDocuments();

        // Get total categories count
        const totalCategories = await db.collection('categories').countDocuments();

        // Get total brands count
        const totalBrands = await db.collection('brands').countDocuments();

        // Get low stock products count (products with stock less than their minStock threshold)
        const lowStockProducts = await db.collection('products')
            .countDocuments({
                $expr: {
                    $lt: ["$stock.physical", "$stock.minStock"]
                },
                "stock.physical": { $gte: 0 }
            });

        return NextResponse.json({
            totalProducts,
            totalCategories,
            totalBrands,
            lowStockProducts
        });
    } catch (error) {
        console.error('Error fetching product stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch product statistics' },
            { status: 500 }
        );
    }
} 