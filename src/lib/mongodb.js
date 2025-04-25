import { MongoClient } from 'mongodb';

// Connection URL
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'your_database_name';

// Connection options
const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
};

// Global MongoDB client reference
let cachedClient = null;
let cachedDb = null;

/**
 * Connect to MongoDB and return the client and database
 */
export async function connectToDatabase() {
    // Check for cached connection
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    // Validate MongoDB URI
    if (!MONGODB_URI) {
        throw new Error('Please define the MONGODB_URI environment variable');
    }

    // Validate MongoDB DB name
    if (!MONGODB_DB) {
        throw new Error('Please define the MONGODB_DB environment variable');
    }

    // Create new client if not cached
    if (!cachedClient) {
        cachedClient = new MongoClient(MONGODB_URI, options);
        await cachedClient.connect();
    }

    // Get or create database
    if (!cachedDb) {
        cachedDb = cachedClient.db(MONGODB_DB);
    }

    return { client: cachedClient, db: cachedDb };
}

/**
 * Close MongoDB connection
 */
export async function closeConnection() {
    if (cachedClient) {
        await cachedClient.close();
        cachedClient = null;
        cachedDb = null;
    }
} 