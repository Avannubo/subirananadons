# CSV to MongoDB Product Import Script with Cloudinary Image Upload

This script imports products from a CSV file into MongoDB according to the Product model schema, and uploads product images to Cloudinary.

## Features

- Imports product data from CSV files
- Automatically detects column names with flexible matching
- Uploads images to Cloudinary from URLs in the CSV
- Intelligently assigns products to categories based on product content
- Detects brand names from product descriptions
- Processes products in small batches to optimize image uploads

## Prerequisites

1. MongoDB connection configured
2. Cloudinary account set up with API credentials
3. CSV file with products in the project root directory
4. Required packages installed: `cloudinary`, `csv-parse`

## CSV Format

The script is flexible with CSV column names and supports various formats. It will try to match:

- **Product ID**: `id`, `ID`, or will auto-generate sequential IDs
- **Product Name**: `name`, `Name`, `PRODUCT_NAME`, `product_name`
- **Description**: `description`, `Description`, `DESCRIPTION`
- **Image URL**: `image_url`, `image`, `IMAGE_URL`, `IMAGE`, `url`, `URL`
- **Price**: `price`, `Price`, `PRICE`

## How to Use

1. Make sure your MongoDB and Cloudinary credentials are correctly configured
2. Place your CSV file in the project root directory
3. Run the import script:

```bash
npm run import-from-csv
```

4. By default, it looks for a file named `product_2025-04-24_145338.csv`, but you can specify a different file:

```bash
npm run import-from-csv path/to/your/file.csv
```

5. To skip the confirmation prompt and run a clean import:

```bash
npm run import-from-csv-clean
```

## What the Script Does

1. Connects to MongoDB and configures Cloudinary
2. Reads and parses the CSV file
3. Extracts product data with flexible column name matching
4. Intelligently assigns categories based on product content
5. Detects brand names from product descriptions
6. Uploads images to Cloudinary in batches
7. Creates product records with Cloudinary image URLs
8. Inserts the products into MongoDB

## Category Assignment

The script has a smart category assignment system:

1. First, it attempts to match text in the product name/description to your categories
2. If no direct match is found, it uses a distribution algorithm based on the product ID
3. This ensures all products are categorized in a meaningful way

## Customization

You can customize the script by:

1. Updating the `commonBrands` array with brands relevant to your products
2. Modifying the category matching logic in the `findBestCategory` function
3. Adjusting the Cloudinary transformation options for different image sizes/quality
4. Modifying the batch size for image processing (smaller batches are safer but slower)

## Command Line Arguments

- `--clean`: Skip the confirmation prompt and perform a clean import
- `path/to/file.csv`: Specify the CSV file to import (default: `product_2025-04-24_145338.csv`)

## Troubleshooting

If you encounter any issues:

1. Check that your CSV file is properly formatted with headers
2. Verify the image URLs in your CSV are valid and accessible
3. Check your MongoDB and Cloudinary credentials
4. Look for errors in the console output related to specific records or image uploads
5. Try running with a smaller batch of products first to test the import process 