// Import Brands Script
// This script imports brand names from a CSV file to MongoDB
// Run with: node src/scripts/import-brands.js

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { MongoClient, ObjectId } from 'mongodb';

// Configuration
const CSV_FILE_PATH = path.join(process.cwd(), 'brands_2025-04-25_091938.csv');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://arjunsingh:2LKnqF4ZpQVxZvvh@cluster0.zzuehnx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'test'; // Replace with your database name
const COLLECTION_NAME = 'brands';

async function importBrands() {
    console.log('Starting brand import...');

    // Read the CSV file
    try {
        const csvContent = fs.readFileSync(CSV_FILE_PATH, 'utf8');

        // Parse CSV (using semicolon as delimiter since the file uses semicolons)
        const records = parse(csvContent, {
            columns: true,
            delimiter: ';',
            skip_empty_lines: true,
            trim: true
        });

        console.log(`Found ${records.length} brands in CSV file`);

        // Connect to MongoDB
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(DB_NAME);
        const brandsCollection = db.collection(COLLECTION_NAME);

        // Clear existing brands if needed (uncomment if you want to replace all brands)
        // await brandsCollection.deleteMany({});
        // console.log('Cleared existing brands');

        // Prepare brand records
        const brands = records.map(record => {
            return {
                _id: new ObjectId(), // Generate new MongoDB ObjectId
                id: parseInt(record.ID) || null, // Use original ID as a reference
                name: record.Nombre || '',
                logo: '', // Empty logo URL
                description: '',
                website: '',
                addresses: record.Direcciones !== '--' ? record.Direcciones : '',
                products: parseInt(record.Productos) || 0, // Store product count, not IDs
                enabled: record.Activado === '1',
                createdAt: new Date(),
                updatedAt: new Date()
            };
        });

        // Insert brands in batches
        const BATCH_SIZE = 50;
        for (let i = 0; i < brands.length; i += BATCH_SIZE) {
            const batch = brands.slice(i, i + BATCH_SIZE);
            await brandsCollection.insertMany(batch);
            console.log(`Imported brands ${i + 1} to ${Math.min(i + BATCH_SIZE, brands.length)}`);
        }

        console.log(`Successfully imported ${brands.length} brands`);

        // Close connection
        await client.close();
        console.log('Disconnected from MongoDB');

    } catch (error) {
        console.error('Error importing brands:', error);
        process.exit(1);
    }
}

// Run the import function
importBrands()
    .then(() => {
        console.log('Brand import completed successfully');
        process.exit(0);
    })
    .catch(error => {
        console.error('Failed to import brands:', error);
        process.exit(1);
    }); 