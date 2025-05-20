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

        // Get low stock products count - comprehensive query to handle different data structures
        const lowStockProducts = await db.collection('products')
            .countDocuments({
                $or: [
                    // Case 1: Products using nested stock object structure (stock.physical < stock.minStock)
                    {
                        $and: [
                            { "stock.physical": { $exists: true } },
                            { "stock.minStock": { $exists: true } },
                            { $expr: { $lt: ["$stock.physical", "$stock.minStock"] } }
                        ]
                    },
                    // Case 2: Products using flat structure (stock < minStock)
                    {
                        $and: [
                            { "stock": { $type: "number" } },
                            { "minStock": { $type: "number" } },
                            { $expr: { $lt: ["$stock", "$minStock"] } }
                        ]
                    },
                    // Case 3: Products with stock.available < stock.minStock
                    {
                        $and: [
                            { "stock.available": { $exists: true } },
                            { "stock.minStock": { $exists: true } },
                            { $expr: { $lt: ["$stock.available", "$stock.minStock"] } }
                        ]
                    },
                    // Case 4: Products with quantity < minQuantity naming pattern
                    {
                        $and: [
                            { "quantity": { $exists: true } },
                            { "minQuantity": { $exists: true } },
                            { $expr: { $lt: ["$quantity", "$minQuantity"] } }
                        ]
                    }
                ]
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