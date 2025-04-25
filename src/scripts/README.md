# Scripts Directory

This directory contains utility scripts for managing the Subirananadons application.

## Import Categories Script

The `importCategories.js` script allows you to import the category structure from the product menu tree into the database. This is useful for initializing or updating your category structure in a consistent way.

### Prerequisites

- Node.js installed
- MongoDB connection configured in your `.env` file
- MongoDB URI should be defined in your environment variables (`MONGODB_URI`)

### Installation

Make sure you have the required dependencies:

```bash
npm install mongodb dotenv
```

### Usage

To run the script:

```bash
node src/scripts/importCategories.js
```

### What the script does

1. Connects to your MongoDB database using the connection string from your environment variables
2. Extracts category structure from the predefined product menu tree
3. Creates or updates categories in the database, maintaining the hierarchical structure
4. Optionally updates products with the corresponding category IDs (commented out by default)

### Configuration

The script contains a `productMenuTree` object that defines the category structure. You can modify this structure to match your desired category organization.

By default, the script will:
- NOT delete existing categories (there's a commented line that can be uncommented to enable this)
- Check for existing categories by slug and update them if found
- Create new categories if they don't exist
- Maintain the hierarchical structure with parent-child relationships
- Set all categories as active

### Product Association

The script includes a commented-out function `updateProductCategories()` that can be enabled to update products with their corresponding category IDs. This is useful when you've migrated from a string-based category system to an ID-based reference system.

To enable this, uncomment the following lines in the `main()` function:

```javascript
// const updatedProducts = await updateProductCategories();
// console.log(`Updated ${updatedProducts} products with category IDs.`);
```

## Update Product Categories Script

The `updateProductCategories.js` script helps to update product category references from string slugs to MongoDB ObjectIds. This script is useful after importing categories with the `importCategories.js` script or when migrating from a slug-based to ID-based category system.

### Prerequisites

Same as for the Import Categories script:
- Node.js installed
- MongoDB connection configured in your `.env` file
- MongoDB URI should be defined in your environment variables (`MONGODB_URI`)

### Usage

To run the script:

```bash
node src/scripts/updateProductCategories.js
```

### What the script does

1. Connects to your MongoDB database using the connection string from your environment variables
2. Retrieves all categories from the database and creates a mapping of category slugs to their IDs
3. Fetches all products from the database
4. For each product:
   - Checks if the product has category references stored as strings (slugs)
   - Converts string references to ObjectIds using the category mapping
   - Updates both the `categories` array and `mainCategory` field if needed
5. Reports the number of products updated

### How it handles categories

The script handles two types of category references in products:
- `categories`: An array that can contain multiple category references
- `mainCategory`: A single reference to the product's primary category

For each reference, the script:
- Keeps existing ObjectId references as is
- Converts string references to ObjectIds if a matching category is found
- Reports each updated product to the console

### Notes

- The script only updates products that need changes (have string-based category references)
- Both scripts (`importCategories.js` and `updateProductCategories.js`) work together to ensure a complete migration from string-based to ID-based category references
- Be careful when running these scripts in a production environment as they modify your database data

# SQL to MongoDB Product Import Script

This script imports products from a SQL database dump into MongoDB according to the Product model schema.

## How to Use

1. Make sure your MongoDB connection is properly configured in `.env` or update the connection string in the script.
2. Make sure the `products.sql` file is placed in the root directory of the project.
3. Run the import script with:

```bash
npm run import-products
```

## What the Script Does

1. Connects to your MongoDB database
2. Reads the SQL file from the root directory
3. Parses product data from `prstshp_product_lang` (names and descriptions) and `prstshp_product_shop` (prices, status)
4. Creates new product records following the Product model schema
5. Inserts the products into MongoDB
6. Reports on the number of products imported

## Data Mapping

The script maps SQL data to MongoDB as follows:

- `name`: Extracted from product description HTML
- `reference`: Generated from product ID
- `description`: HTML content from product_lang table
- `category`: Mapped from category ID
- `price_excl_tax`: Taken from product_shop table
- `price_incl_tax`: Calculated with 21% VAT (adjustable)
- `stock`: Default values assigned
- `status`: Mapped from product status in product_shop table

## Troubleshooting

If you encounter any issues:

1. Check MongoDB connection settings
2. Verify the SQL file exists and contains the expected tables
3. Check for SQL parsing errors in the console output
4. Verify the Product model schema hasn't changed 