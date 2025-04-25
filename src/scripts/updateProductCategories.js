const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

/**
 * Connect to MongoDB database
 * @returns {Promise<{client: MongoClient, db: Db}>} Database connection
 */
async function connectToDatabase() {
    try {
        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db();
        return { client, db };
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

/**
 * Get all categories from the database with their slugs and IDs
 * @param {Db} db - MongoDB database instance
 * @returns {Promise<Map<string, string>>} Map of category slugs to IDs
 */
async function getCategoryMap(db) {
    const categories = await db.collection('categories').find({}).toArray();
    const categoryMap = new Map();

    categories.forEach(category => {
        categoryMap.set(category.slug, category._id.toString());
    });

    return categoryMap;
}

/**
 * Update product category references from strings to ObjectIds
 * @param {Db} db - MongoDB database instance
 * @param {Map<string, string>} categoryMap - Map of category slugs to IDs
 * @returns {Promise<number>} Number of updated products
 */
async function updateProductCategories(db, categoryMap) {
    const products = await db.collection('products').find({}).toArray();
    let updatedCount = 0;

    for (const product of products) {
        let updated = false;
        const updatedCategories = [];

        // Handle case where categories might be strings (slugs) or already ObjectIds
        if (product.categories && Array.isArray(product.categories)) {
            product.categories.forEach(category => {
                if (typeof category === 'string') {
                    // Try to find the category by slug
                    const categoryId = categoryMap.get(category);
                    if (categoryId) {
                        updatedCategories.push(new ObjectId(categoryId));
                        updated = true;
                    }
                } else if (typeof category === 'object') {
                    // If it's already an ObjectId, keep it
                    updatedCategories.push(category);
                }
            });
        }

        // If the product has a main category as string, convert it to ObjectId
        let mainCategory = product.mainCategory;
        if (mainCategory && typeof mainCategory === 'string') {
            const mainCategoryId = categoryMap.get(mainCategory);
            if (mainCategoryId) {
                mainCategory = new ObjectId(mainCategoryId);
                updated = true;
            }
        }

        if (updated) {
            await db.collection('products').updateOne(
                { _id: product._id },
                {
                    $set: {
                        categories: updatedCategories,
                        ...(mainCategory && { mainCategory })
                    }
                }
            );
            updatedCount++;
            console.log(`Updated product: ${product.name || product.title || product._id}`);
        }
    }

    return updatedCount;
}

/**
 * Main function to update product categories
 */
async function main() {
    let client;
    try {
        const { client: dbClient, db } = await connectToDatabase();
        client = dbClient;

        // Get category mapping (slug to ID)
        const categoryMap = await getCategoryMap(db);
        console.log(`Found ${categoryMap.size} categories in the database`);

        // Update product categories
        const updatedProducts = await updateProductCategories(db, categoryMap);
        console.log(`Updated ${updatedProducts} products with category IDs`);

    } catch (error) {
        console.error('Error updating product categories:', error);
    } finally {
        if (client) {
            await client.close();
            console.log('MongoDB connection closed');
        }
    }
}

main().catch(console.error); 