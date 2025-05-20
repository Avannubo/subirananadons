import { connectDB } from '../lib/mongodb';
import Product from '../models/Product';

async function migrateProducts() {
    try {
        // Connect to MongoDB
        await connectDB();
        console.log('Connected to MongoDB');

        // Get all products
        const products = await Product.find({});
        console.log(`Found ${products.length} products to migrate`);

        let migratedCount = 0;
        let errorCount = 0;

        // Process each product
        for (const product of products) {
            try {
                // Handle stock structure changes
                if (product.stock) {
                    // Make sure physical exists and has a value
                    if (!product.stock.physical) {
                        product.stock.physical = product.stock.available || 0;
                    }

                    // Make sure minStock exists and has a value
                    if (!product.stock.minStock) {
                        // Convert from reserved to minStock if needed
                        product.stock.minStock = product.stock.reserved || 5;
                    }

                    // Make sure available is set
                    product.stock.available = product.stock.physical;

                    // Remove any old fields that are no longer in the schema
                    if (product.stock.reserved !== undefined) {
                        delete product.stock.reserved;
                    }
                } else {
                    // Initialize stock if it doesn't exist
                    product.stock = {
                        available: 0,
                        minStock: 5
                    };
                }

                // Clean up any other fields not in the schema
                if (product.stockHistory !== undefined) {
                    delete product.stockHistory;
                }

                // Save the updated product
                await product.save();
                migratedCount++;
                console.log(`Migrated product: ${product.name}`);
            } catch (error) {
                console.error(`Error migrating product ${product._id}:`, error);
                errorCount++;
            }
        }

        console.log(`Migration complete. Successfully migrated ${migratedCount} products. Errors: ${errorCount}`);
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        // Disconnect from MongoDB
        process.exit();
    }
}

// Run the migration
migrateProducts(); 