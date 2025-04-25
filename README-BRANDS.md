# Brands Management System

This document provides instructions for importing brand data into MongoDB and using the Brands API.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB server (local or remote)
- CSV file with brand data (`brands_2025-04-25_091938.csv`)

## Environment Setup

Create a `.env` file in the root of your project with the following variables:

```
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=your_database_name
```

Replace the values with your actual MongoDB connection string and database name.

## Importing Brands

There are two scripts available for importing brands from the CSV file:

### Option 1: ES Modules Version

```bash
npm install csv-parse mongodb dotenv
node src/scripts/import-brands.js
```

### Option 2: CommonJS Version

```bash
npm install csv-parse mongodb dotenv
node src/scripts/import-brands.cjs
```

Both scripts will:

1. Read the CSV file `brands_2025-04-25_091938.csv`
2. Parse brands data
3. Insert brands into the MongoDB collection
4. Log the progress and results

## Brand Data Structure

Each brand document in MongoDB will have the following structure:

```json
{
  "_id": "ObjectId",
  "id": 123,                  // Original ID from CSV
  "name": "Brand Name",       // Brand name
  "logo": "",                 // Logo URL (empty initially)
  "description": "",          // Description (empty initially)
  "website": "",              // Website URL (empty initially) 
  "addresses": "",            // Addresses (from CSV or empty)
  "products": 5,              // Number of products (from CSV)
  "enabled": true,            // Enabled status (from CSV)
  "createdAt": "Date",        // Creation timestamp
  "updatedAt": "Date"         // Last update timestamp
}
```

## API Endpoints

The following API endpoints are available for managing brands:

### List Brands

```
GET /api/brands
```

Query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `name`: Filter by name (optional)
- `enabled`: Filter by enabled status (optional, true/false)

Response:
```json
{
  "brands": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "limit": 10
  }
}
```

### Get Brand

```
GET /api/brands/:id
```

Response:
```json
{
  "_id": "...",
  "name": "Brand Name",
  "logo": "...",
  ...
}
```

### Create Brand

```
POST /api/brands
```

Request body:
```json
{
  "name": "New Brand",
  "logo": "https://example.com/logo.png",
  "description": "Brand description",
  "website": "https://example.com",
  "addresses": "123 Main St",
  "enabled": true
}
```

Only `name` is required.

### Update Brand

```
PUT /api/brands/:id
```

Request body:
```json
{
  "name": "Updated Brand Name",
  "logo": "https://example.com/newlogo.png",
  ...
}
```

### Delete Brand

```
DELETE /api/brands/:id
```

Response:
```json
{
  "message": "Brand deleted successfully"
}
```

## Troubleshooting

- **Connection Issues**: Ensure your MongoDB server is running and the connection string is correct
- **CSV Format**: The import script expects the CSV file to use semicolon (`;`) as delimiter
- **Missing Data**: If the brand data is incomplete, the script will still import it with empty fields 