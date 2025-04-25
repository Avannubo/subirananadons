// Script to import products from CSV file to MongoDB and upload images to Cloudinary
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { parse } from 'csv-parse/sync';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

// Connection URL
const mongoUri = 'mongodb+srv://arjunsingh:2LKnqF4ZpQVxZvvh@cluster0.zzuehnx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'dmv3sqzfp',
    api_key: '544412284116647',
    api_secret: 'HCTqDgizlCuVT2hFf2tTCiFYWbA'
});

// Check for command line arguments
const args = process.argv.slice(2);
const cleanImport = args.includes('--clean');
const overwriteExisting = args.includes('--overwrite');
const csvFilePath = args.find(arg => arg.endsWith('.csv')) || 'product_2025-04-24_145338.csv';

// Categories structure
const categoryIdMap = [
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
    { label: "Gemelos" },
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

// Common brand names to look for in product descriptions/names
const commonBrands = [
    'Baby Björn', 'BabyBjörn', 'Chicco', 'Medela', 'Philips Avent', 'Tommee Tippee',
    'Cybex', 'Fisher-Price', 'Graco', 'Inglesina', 'Jané', 'Joolz', 'Joie', 'Maxi-Cosi',
    'Nuna', 'Quinny', 'Recaro', 'Safety 1st', 'Stokke', 'Uppababy'
];

// Function to manually parse semicolon-delimited CSV with quoted fields
function parseCustomCsv(content) {
    const lines = content.split(/\r?\n/);
    const results = [];

    if (lines.length === 0) return results;

    // Parse header - handle special quoted columns
    const headerLine = lines[0];
    const headerParts = [];
    let inQuote = false;
    let currentPart = '';

    // Manually parse the header to handle quotes correctly
    for (let i = 0; i < headerLine.length; i++) {
        const char = headerLine[i];

        if (char === '"') {
            inQuote = !inQuote;
            currentPart += char;
        } else if (char === ';' && !inQuote) {
            headerParts.push(currentPart.trim());
            currentPart = '';
        } else {
            currentPart += char;
        }
    }

    // Add the last part
    if (currentPart) {
        headerParts.push(currentPart.trim());
    }

    // Clean up headers - remove quotes and normalize
    const headers = headerParts.map(header => {
        // Remove quotes
        header = header.replace(/^"(.+)"$/, '$1');

        // Map to standard field names
        switch (header) {
            case 'Product ID': return 'id';
            case 'Imagen': return 'image_url';
            case 'Nombre': return 'name';
            case 'Referencia': return 'reference';
            case 'Categoría': return 'category';
            case 'Precio (imp. excl.)': return 'price_excl_tax';
            case 'Precio (imp. incl.)': return 'price_incl_tax';
            case 'Cantidad': return 'stock';
            case 'Estado': return 'status';
            case 'Posición': return 'position';
            default: return header;
        }
    });

    console.log('Detected headers:', headers);

    // Parse data lines
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines

        try {
            // Parse complex line with potential quotes
            const values = [];
            let currentValue = '';
            inQuote = false;

            for (let j = 0; j < line.length; j++) {
                const char = line[j];

                if (char === '"') {
                    inQuote = !inQuote;
                    currentValue += char;
                } else if (char === ';' && !inQuote) {
                    values.push(currentValue.trim());
                    currentValue = '';
                } else {
                    currentValue += char;
                }
            }

            // Add the last value
            if (currentValue) {
                values.push(currentValue.trim());
            }

            // Create record object
            const record = {};
            headers.forEach((header, index) => {
                if (index < values.length) {
                    // Clean up value - remove surrounding quotes
                    let value = values[index];
                    value = value.replace(/^"(.+)"$/, '$1');
                    record[header] = value;
                }
            });

            results.push(record);
        } catch (error) {
            console.error(`Error parsing line ${i + 1}: ${line}`, error);
        }
    }

    return results;
}

// Function to extract brand from product name or description
function extractBrand(name, description) {
    if (!name && !description) return '';

    const textToSearch = (name + ' ' + (description || '')).replace(/<[^>]*>/g, ' ');

    for (const brand of commonBrands) {
        if (textToSearch.toLowerCase().includes(brand.toLowerCase())) {
            return brand;
        }
    }

    return '';
}

// Function to find a category name based on product details
function findBestCategory(product) {
    // Try to match based on name and description
    const textToSearch = `${product.name} ${product.description || ''}`.toLowerCase();

    // If category is already specified and valid, use it
    if (product.category) {
        const lowerCategory = product.category.toLowerCase();

        // Check if it's a main category
        for (const mainCat of categoryIdMap) {
            if (mainCat.label.toLowerCase() === lowerCategory) {
                return mainCat.label;
            }

            // Check if it's a subcategory
            if (mainCat.submenu) {
                for (const subCat of mainCat.submenu) {
                    if (subCat.label.toLowerCase() === lowerCategory) {
                        return `${mainCat.label} > ${subCat.label}`;
                    }
                }
            }
        }
    }

    // First, try to find an exact category match
    for (const mainCat of categoryIdMap) {
        // Check main category
        if (textToSearch.includes(mainCat.label.toLowerCase())) {
            // Check subcategories if they exist
            if (mainCat.submenu && mainCat.submenu.length > 0) {
                for (const subCat of mainCat.submenu) {
                    if (textToSearch.includes(subCat.label.toLowerCase())) {
                        return `${mainCat.label} > ${subCat.label}`;
                    }
                }
            }
            return mainCat.label;
        }

        // If no direct main category match, check subcategories
        if (mainCat.submenu && mainCat.submenu.length > 0) {
            for (const subCat of mainCat.submenu) {
                if (textToSearch.includes(subCat.label.toLowerCase())) {
                    return `${mainCat.label} > ${subCat.label}`;
                }
            }
        }
    }

    // If no matches found, use product ID to assign a category
    const id = parseInt(product.id || '0', 10);

    // Get main category index using modulo with the number of top-level categories
    const mainCategoryIndex = id % categoryIdMap.length;
    const mainCategory = categoryIdMap[mainCategoryIndex];

    if (!mainCategory) return "Otros Productos";

    // If the category has a submenu, select a subcategory
    if (mainCategory.submenu && mainCategory.submenu.length > 0) {
        // Select subcategory based on ID
        const subCategoryIndex = Math.floor(id / categoryIdMap.length) % mainCategory.submenu.length;
        const subCategory = mainCategory.submenu[subCategoryIndex];

        if (subCategory && subCategory.label) {
            return `${mainCategory.label} > ${subCategory.label}`;
        }
    }

    return mainCategory.label || "Otros Productos";
}

/**
 * Upload an image from a URL to Cloudinary
 * @param {string} imageUrl - The URL of the image to upload
 * @param {string} reference - Product reference used for naming the image
 * @returns {Promise<string>} - The Cloudinary URL of the uploaded image
 */
async function uploadImageToCloudinary(imageUrl, reference) {
    if (!imageUrl || !imageUrl.startsWith('http')) {
        console.log(`Invalid image URL for ${reference}: ${imageUrl}`);
        return null;
    }

    try {
        console.log(`Uploading image for ${reference} from ${imageUrl}`);

        // Upload the image to Cloudinary
        const result = await cloudinary.uploader.upload(imageUrl, {
            folder: 'products',
            public_id: `product_${reference}`,
            overwrite: true,
            resource_type: 'auto'
        });

        console.log(`Successfully uploaded image for ${reference} to Cloudinary: ${result.secure_url}`);
        return result.secure_url;
    } catch (error) {
        console.error(`Error uploading image for ${reference}:`, error.message);
        return null;
    }
}

/**
 * Validate CSV data before import
 * @param {Array} data - The parsed CSV data
 * @returns {Object} - Validation result with isValid and errors
 */
function validateCSV(data) {
    if (!Array.isArray(data) || data.length === 0) {
        return {
            isValid: false,
            errors: ['CSV file is empty or invalid']
        };
    }

    const requiredFields = ['name', 'price_excl_tax'];
    const errors = [];
    const missingFields = new Set();

    // Check if all required fields are present in the headers
    const headers = Object.keys(data[0]);
    for (const field of requiredFields) {
        if (!headers.includes(field)) {
            missingFields.add(field);
        }
    }

    if (missingFields.size > 0) {
        errors.push(`CSV is missing required column(s): ${Array.from(missingFields).join(', ')}`);
    }

    // Check each row for required values
    data.forEach((row, index) => {
        const rowNum = index + 1;

        // Generate reference if missing
        if (!row.reference || row.reference.trim() === '') {
            if (row.id) {
                row.reference = `AUTO-${row.id}`;
            } else if (row.name) {
                // Create a slug from the name
                const slug = row.name
                    .toLowerCase()
                    .replace(/[^\w ]+/g, '')
                    .replace(/ +/g, '-')
                    .substring(0, 15);
                row.reference = `AUTO-${slug}-${index}`;
            } else {
                row.reference = `AUTO-PRODUCT-${index}`;
            }
            console.log(`Row ${rowNum}: Generated reference "${row.reference}" for product "${row.name || 'Unnamed'}"`);
        }

        if (!row.name || row.name.trim() === '') {
            errors.push(`Row ${rowNum}: Missing name`);
        }

        if (!row.price_excl_tax) {
            errors.push(`Row ${rowNum}: Missing price_excl_tax`);
        } else if (isNaN(parseFloat(row.price_excl_tax))) {
            errors.push(`Row ${rowNum}: Invalid price_excl_tax (must be a number)`);
        }

        // Optional but must be valid if present
        if (row.price_incl_tax && isNaN(parseFloat(row.price_incl_tax))) {
            errors.push(`Row ${rowNum}: Invalid price_incl_tax (must be a number)`);
        }

        if (row.stock && isNaN(parseInt(row.stock))) {
            errors.push(`Row ${rowNum}: Invalid stock (must be a number)`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors
    };
}

async function importProducts() {
    try {
        // Connect to MongoDB
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Read the CSV file
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const csvFilePath = path.resolve(process.cwd(), 'product_2025-04-24_145338.csv');
        console.log(`Looking for CSV file at: ${csvFilePath}`);

        if (!fs.existsSync(csvFilePath)) {
            console.error(`CSV file not found at: ${csvFilePath}`);
            console.log('Please place the CSV file in the root directory of the project.');
            return;
        }

        const fileContent = fs.readFileSync(csvFilePath, 'utf8');
        console.log(`File read successfully. Size: ${fileContent.length} bytes`);

        // First try our custom parser
        let products = [];
        try {
            console.log('Attempting to parse with custom CSV parser...');
            products = parseCustomCsv(fileContent);
            console.log(`Custom parser found ${products.length} records`);

            // Log a sample record to help debug
            if (products.length > 0) {
                console.log('Sample record structure:', JSON.stringify(products[0], null, 2));
                if (products.length > 1) {
                    console.log('Sample record structure:', JSON.stringify(products[1], null, 2));
                }
            }
        } catch (error) {
            console.error('Custom parser failed:', error);

            // Fallback to standard parser with configured options
            console.log('Falling back to standard CSV parser...');
            try {
                products = parse(fileContent, {
                    delimiter: [';', ','], // Try both semicolon and comma
                    columns: true,
                    skip_empty_lines: true,
                    relax_quotes: true,
                    relax_column_count: true,
                    skip_records_with_error: true
                });
                console.log(`Standard parser found ${products.length} records`);
            } catch (error) {
                console.error('Standard parser also failed:', error);
                throw new Error('Unable to parse the CSV file with any available method');
            }
        }

        if (products.length === 0) {
            console.error('No valid products found in the CSV file');
            return;
        }

        // Validate CSV data
        const validation = validateCSV(products);
        if (!validation.isValid) {
            console.error('CSV validation issues found:');
            validation.errors.forEach(error => console.error(`- ${error}`));

            // Continue with import despite validation errors (except for critical ones)
            if (validation.errors.some(e => e.includes('Missing name') || e.includes('Missing price_excl_tax'))) {
                console.error('Critical validation errors found. Aborting import.');
                return;
            }

            console.log('Proceeding with import despite non-critical validation issues');
        } else {
            console.log('CSV validation passed successfully');
        }

        // Process and import products
        const processedProducts = products.map(product => {
            // Map fields from the detected structure
            return {
                name: product.name,
                reference: product.reference || '',
                description: '', // Not provided in this CSV format
                image_url: product.image_url || '',
                original_price: parseFloat(product.price_incl_tax) || 0,
                price: parseFloat(product.price_incl_tax) || 0,
                price_excl_tax: parseFloat(product.price_excl_tax) || 0,
                stock: parseInt(product.stock) || 0,
                status: product.status === '1' ? 'active' : 'inactive',
                category: product.category || '',
                brand: extractBrand(product.name, ''),
                featured: false, // Default value
                externalId: product.id || ''
            };
        });

        // Filter out invalid products
        const validProducts = processedProducts.filter(product =>
            product.name && product.price > 0
        );

        console.log(`Found ${validProducts.length} valid products out of ${products.length} total`);

        if (validProducts.length === 0) {
            console.error('No valid products found after processing');
            return;
        }

        // Import products to MongoDB
        await performImport(validProducts);

    } catch (error) {
        console.error('Error importing products:', error);
    } finally {
        // Close the MongoDB connection
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}

async function performImport(products) {
    console.log(`Starting import of ${products.length} products...`);

    // Delete existing products if required
    if (cleanImport) {
        console.log('Deleting existing products...');
        await Product.deleteMany({});
        console.log('Existing products deleted');
    }

    let successCount = 0;
    let errorCount = 0;
    let skipCount = 0;

    // Process in batches to avoid memory issues
    const batchSize = 10;
    const batches = Math.ceil(products.length / batchSize);

    for (let i = 0; i < batches; i++) {
        const start = i * batchSize;
        const end = Math.min(start + batchSize, products.length);
        const batch = products.slice(start, end);

        console.log(`Processing batch ${i + 1}/${batches} (${start + 1}-${end} of ${products.length})`);

        const promises = batch.map(async (product) => {
            try {
                // Check if product with this reference already exists (unless doing clean import)
                let existingProduct = null;
                if (!cleanImport) {
                    existingProduct = await Product.findOne({ reference: product.reference });
                }

                if (existingProduct && !overwriteExisting) {
                    skipCount++;
                    return { status: 'skipped', product: product.name };
                }

                // Find best category if not provided or invalid
                if (!product.category || product.category.trim() === '') {
                    product.category = findBestCategory(product);
                }

                // Upload image to Cloudinary if URL is provided
                let cloudinaryUrl = 'https://res.cloudinary.com/dmv3sqzfp/image/upload/v1745410983/user_profiles/user_680775bd4028c5f34b3781d2_1745410981457.jpg'; // Default image

                if (product.image_url) {
                    try {
                        const uploadedUrl = await uploadImageToCloudinary(product.image_url, product.reference);
                        if (uploadedUrl) {
                            cloudinaryUrl = uploadedUrl;
                        }
                    } catch (imageError) {
                        console.error(`Error uploading image for ${product.name}:`, imageError.message);
                    }
                }

                // Create the product document
                const productDoc = {
                    name: product.name,
                    reference: product.reference,
                    description: product.description || '',
                    category: product.category,
                    brand: product.brand,
                    original_price: product.original_price,
                    price: product.price,
                    price_excl_tax: product.price_excl_tax || product.price * 0.79, // Estimate if not provided
                    price_incl_tax: product.price_incl_tax || product.price,
                    image: cloudinaryUrl,
                    stock: {
                        physical: product.stock,
                        reserved: 0,
                        available: product.stock
                    },
                    status: product.status,
                    featured: product.featured || false,
                    externalId: product.externalId || product.reference
                };

                // Save to MongoDB
                if (existingProduct) {
                    // Update existing product
                    await Product.updateOne({ _id: existingProduct._id }, productDoc);
                } else {
                    // Create new product
                    await Product.create(productDoc);
                }

                successCount++;
                return { status: 'success', product: product.name };
            } catch (error) {
                errorCount++;
                console.error(`Error importing product ${product.name}:`, error.message);
                return { status: 'error', product: product.name, error: error.message };
            }
        });

        // Wait for the batch to complete
        await Promise.all(promises);

        // Log progress
        console.log(`Processed ${end} of ${products.length} products. Success: ${successCount}, Errors: ${errorCount}, Skipped: ${skipCount}`);
    }

    console.log('Import complete!');
    console.log(`Successfully imported ${successCount} products`);
    console.log(`Skipped ${skipCount} products (already exist)`);
    console.log(`Failed to import ${errorCount} products`);
}

// Run the import
importProducts().catch(console.error);