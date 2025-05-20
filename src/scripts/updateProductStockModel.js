// Migration script to update product stock model
// Remove reserved field and add minStock field to all products

import { connectToDatabase } from '@/lib/mongodb';

async function migrateProductStockModel() {
    try {
        console.log('Starting product stock model migration...');

        // Connect to database
        const { db } = await connectToDatabase();
        const productsCollection = db.collection('products');

        // Get all products
        const products = await productsCollection.find({}).toArray();
        console.log(`Found ${products.length} products to update`);

        // Update each product
        const updatePromises = products.map(async (product) => {
            const stockPhysical = product.stock?.physical || 0;

            // Build the update operation
            const updateOperation = {
                $set: {
                    'stock.available': stockPhysical,
                    'stock.minStock': 5
                },
                $unset: {
                    'stock.reserved': ""
                }
            };

            return productsCollection.updateOne(
                { _id: product._id },
                updateOperation
            );
        });

        // Execute all updates
        const results = await Promise.all(updatePromises);

        // Calculate summary
        const updatedCount = results.reduce((count, result) => count + result.modifiedCount, 0);

        console.log(`Migration completed. Updated ${updatedCount} of ${products.length} products.`);

        return {
            success: true,
            totalProducts: products.length,
            updatedProducts: updatedCount
        };
    } catch (error) {
        console.error('Error migrating product stock model:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Execute the migration if this file is run directly
if (require.main === module) {
    migrateProductStockModel()
        .then((result) => {
            console.log('Migration result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch((error) => {
            console.error('Unhandled error during migration:', error);
            process.exit(1);
        });
}

export default migrateProductStockModel; 