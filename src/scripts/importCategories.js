// Import Categories Script
// This script extracts the category structure from the product page
// and imports it into the database using the Categories API

// Import required modules
const { MongoClient } = require('mongodb');

// Product menu tree structure from the shop page
const productMenuTree = [
    {
        label: "Alimentación",
        submenu: [
            { label: "Tronas de viaje" },
            { label: "Robots de cocina" },
            { label: "Platos y cubiertos" },
            { label: "Botellas y vasos" },
            { label: "Baberos" },
            { label: "Botes y fiambreras" },
            { label: "Termos" },
            { label: "Lactancia" }
        ]
    },
    {
        label: "Baño",
        submenu: [
            { label: "Accesorios baño" },
            { label: "Kits higiene y cosmética" },
            { label: "Cajas toallitas" },
            { label: "Pañales y contenedores pañales" },
            { label: "Orinales y reductores WC" }
        ]
    },
    {
        label: "Casa",
        submenu: [
            { label: "Intercomunicadores" },
            { label: "Tronas" },
            { label: "Barandillas de escalera" },
            { label: "Hamacas" }
        ]
    },
    {
        label: "Habitación",
        submenu: [
            { label: "Cuna, colecho y moisés" },
            { label: "Mobiliario" },
            { label: "Colchones y protectores" },
            { label: "Téxtil" },
            { label: "Cambiadores y fundas" },
            { label: "Luces y decoración" },
            { label: "Barreras cama" }
        ]
    },
    { label: "Gemelos" }, // No submenu means it's a direct category
    {
        label: "Madres",
        submenu: [
            { label: "Ropa embarazo y porteo" },
            { label: "Sujetadores embarazo i lactancia" },
            { label: "Basicos embarazo" },
            { label: "Basicos hospital" }]
    },
    {
        label: "Cochecitos",
        submenu: [
            { label: "Sillas de paseo" },
            { label: "Accesorios cochecito" }
        ]
    },
    {
        label: "Entretenimientos",
        submenu: [
            { label: "Doudous y peluches" },
            { label: "Botellas sensoriales" },
            { label: "Alfombras de actividades" },
            { label: "Bolsa almacenaje" },
            { label: "Mordedores" },
            { label: "Varios" }
        ]
    },
    {
        label: "Salud",
        submenu: [
            { label: "Aspirador nasal" },
            { label: "Termómetros" },
            { label: "Humidificadores" },
            { label: "Cojines" },
            { label: "Cojines cabeza plana" },
            { label: "Casco antiruido" }
        ]
    },
    {
        label: "Sillas De Coche",
        submenu: [
            { label: "Grupo 0+" },
            { label: "Grupo 0-1" },
            { label: "Grupo 0-1 - 2" },
            { label: "Grupo 0-1 - 2 - 3" },
            { label: "Grupo 2-3" },
            { label: "Fundas silla" },
            { label: "Accesorios coche" }
        ]
    },
    {
        label: "Otros Productos",
        submenu: [
            { label: "Mochilas" },
            { label: "Fulares y bandoleras" },
            { label: "Ropa porteo" },
            { label: "Cunas de viaje" },
            { label: "Ropa bebé" },
            { label: "Bolsas maternales" },
            { label: "Bolsas muda" },
            { label: "Porta Documentos" },
            { label: "Mochilas infantiles" },
            { label: "Arrullos" },
            { label: "Silla para bici" },
            { label: "Cambiadores de viaje" }
        ]
    }
];

// Helper function to create a slug from a category name
const createSlug = (name) => {
    return name
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
};

// Function to connect to the database directly
async function connectToDatabase() {
    const uri = "mongodb+srv://arjunsingh:2LKnqF4ZpQVxZvvh@cluster0.zzuehnx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    if (!uri) {
        throw new Error('Please define the MONGODB_URI environment variable');
    }

    const client = new MongoClient(uri);
    await client.connect();
    return client.db('test');
}

// Function to import categories recursively
async function importCategories() {
    const db = await connectToDatabase();
    const categoriesCollection = db.collection('categories');

    // Clear existing categories (optional - be careful with this in production)
    // Comment this out if you want to preserve existing categories
    // await categoriesCollection.deleteMany({});

    // Keep track of inserted categories to avoid duplicates
    const insertedCategories = new Map();

    // Process the category tree recursively
    async function processCategory(category, parentId = null, level = 1, order = 0) {
        // Create category object
        const categoryData = {
            name: category.label,
            slug: createSlug(category.label),
            parent: parentId,
            level,
            order,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Check if category already exists (by slug)
        const existingCategory = await categoriesCollection.findOne({ slug: categoryData.slug });

        // Insert or update the category
        let categoryId;
        if (existingCategory) {
            // Update existing category
            await categoriesCollection.updateOne(
                { _id: existingCategory._id },
                {
                    $set: {
                        ...categoryData,
                        updatedAt: new Date()
                    }
                }
            );
            categoryId = existingCategory._id;
            console.log(`Updated category: ${category.label}`);
        } else {
            // Insert new category
            const result = await categoriesCollection.insertOne(categoryData);
            categoryId = result.insertedId;
            console.log(`Inserted category: ${category.label}`);
        }

        // Store the category ID
        insertedCategories.set(categoryData.slug, categoryId);

        // Process subcategories if they exist
        if (category.submenu && category.submenu.length > 0) {
            for (let i = 0; i < category.submenu.length; i++) {
                await processCategory(category.submenu[i], categoryId, level + 1, i);
            }
        }

        return categoryId;
    }

    // Start processing each top-level category separately
    for (let i = 0; i < productMenuTree.length; i++) {
        await processCategory(productMenuTree[i], null, 1, i);
    }

    console.log('Category import completed successfully!');
    return insertedCategories.size;
}

// Function to update product categories to match the new category structure
async function updateProductCategories() {
    const db = await connectToDatabase();
    const productsCollection = db.collection('products');
    const categoriesCollection = db.collection('categories');

    // Get all products
    const products = await productsCollection.find({}).toArray();
    let updatedCount = 0;

    for (const product of products) {
        // Find the category by name
        const categoryName = product.category;
        const category = await categoriesCollection.findOne({ name: categoryName });

        if (category) {
            // Update the product with the category ID
            await productsCollection.updateOne(
                { _id: product._id },
                { $set: { categoryId: category._id } }
            );
            updatedCount++;
            console.log(`Updated product: ${product.name} with category ID: ${category._id}`);
        } else {
            console.log(`Warning: No matching category found for product: ${product.name} (Category: ${categoryName})`);
        }
    }

    console.log(`Updated ${updatedCount} products with category IDs`);
    return updatedCount;
}

// Main function to run the import process
async function main() {
    try {
        console.log('Starting category import process...');
        const categoriesCount = await importCategories();
        console.log(`Imported/updated ${categoriesCount} categories.`);

        // Optionally update product categories
        // const updatedProducts = await updateProductCategories();
        // console.log(`Updated ${updatedProducts} products with category IDs.`);

        console.log('Import process completed successfully.');
    } catch (error) {
        console.error('Import process failed:', error);
    } finally {
        process.exit(0);
    }
}

// Run the script
main(); 