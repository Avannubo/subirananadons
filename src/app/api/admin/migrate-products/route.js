import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// POST /api/admin/migrate-products - Run product stock model migration
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        // Check authentication
        if (!session || !session.user) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        // Check if the user has admin role
        const isAdmin = session.user.role === 'admin';
        if (!isAdmin) {
            return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
        }

        // Connect to MongoDB
        await dbConnect();
        console.log('Connected to MongoDB');

        // Get all products
        const products = await Product.find({});
        console.log(`Found ${products.length} products to migrate`);

        let migratedCount = 0;
        let errorCount = 0;
        let results = [];

        // Process each product
        for (const product of products) {
            try {
                const originalProduct = { ...product.toObject() };
                let changes = [];

                // Handle stock structure changes
                if (product.stock) {
                    // Make sure physical exists and has a value
                    if (!product.stock.physical) {
                        product.stock.physical = product.stock.available || 0;
                        changes.push(`Set physical to ${product.stock.physical}`);
                    }

                    // Make sure minStock exists and has a value
                    if (!product.stock.minStock) {
                        // Convert from reserved to minStock if needed
                        product.stock.minStock = product.stock.reserved || 5;
                        changes.push(`Set minStock to ${product.stock.minStock}`);
                    }

                    // Make sure available is set
                    product.stock.available = product.stock.physical;
                    changes.push(`Set available to ${product.stock.available}`);

                    // Remove any old fields that are no longer in the schema
                    if (product.stock.reserved !== undefined) {
                        delete product.stock.reserved;
                        changes.push(`Removed reserved field`);
                    }
                } else {
                    // Initialize stock if it doesn't exist
                    product.stock = {
                        physical: 0,
                        available: 0,
                        minStock: 5
                    };
                    changes.push(`Initialized stock structure`);
                }

                // Clean up any other fields not in the schema
                if (product.stockHistory !== undefined) {
                    delete product.stockHistory;
                    changes.push(`Removed stockHistory field`);
                }

                // Save the updated product only if there were changes
                if (changes.length > 0) {
                    await product.save();
                    migratedCount++;
                    results.push({
                        id: product._id,
                        name: product.name,
                        changes
                    });
                }
            } catch (error) {
                console.error(`Error migrating product ${product._id}:`, error);
                errorCount++;
                results.push({
                    id: product._id,
                    error: error.message
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Migration complete. Successfully migrated ${migratedCount} products. Errors: ${errorCount}`,
            results
        });
    } catch (error) {
        console.error('Migration failed:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
} 