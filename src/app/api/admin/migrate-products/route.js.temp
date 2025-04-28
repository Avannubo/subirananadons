import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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
                    // Make sure available exists and has a value
                    if (product.stock.available === undefined) {
                        // If available is missing but physical exists, use physical value
                        if (product.stock.physical !== undefined) {
                            product.stock.available = product.stock.physical;
                            changes.push(`Set available to ${product.stock.available} from physical`);
                        } else {
                            product.stock.available = 0;
                            changes.push(`Set available to 0 (default)`);
                        }
                    }
                    
                    // Make sure minStock exists and has a value
                    if (product.stock.minStock === undefined) {
                        // Convert from reserved to minStock if needed
                        if (product.stock.reserved !== undefined) {
                            product.stock.minStock = product.stock.reserved;
                            changes.push(`Set minStock to ${product.stock.minStock} from reserved`);
                        } else {
                            product.stock.minStock = 5;
                            changes.push(`Set minStock to 5 (default)`);
                        }
                    }
                    
                    // Remove physical field
                    if (product.stock.physical !== undefined) {
                        delete product.stock.physical;
                        changes.push(`Removed physical field`);
                    }
                    
                    // Remove reserved field
                    if (product.stock.reserved !== undefined) {
                        delete product.stock.reserved;
                        changes.push(`Removed reserved field`);
                    }
                } else {
                    // Initialize stock if it doesn't exist
                    product.stock = {
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