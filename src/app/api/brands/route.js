import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/brands - Get all brands with optional filtering
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 5;
        const skip = (page - 1) * limit;

        // Get filter parameters
        const nameFilter = searchParams.get('name');
        const enabledFilter = searchParams.get('enabled');

        // Build filter object
        const filter = {};

        if (nameFilter) {
            filter.name = { $regex: nameFilter, $options: 'i' }; // Case-insensitive name search
        }

        if (enabledFilter !== null) {
            filter.enabled = enabledFilter === 'true';
        }

        // Connect to database
        const { db } = await connectToDatabase();

        // Count total items for pagination
        const totalItems = await db.collection('brands').countDocuments(filter);
        const totalPages = Math.ceil(totalItems / limit);

        // Get paginated brands
        const brands = await db
            .collection('brands')
            .find(filter)
            .sort({ updatedAt: -1, createdAt: -1 }) // Sort by updated time first, then created time, descending order
            .skip(skip)
            .limit(limit)
            .toArray();

        // Return paginated response
        return NextResponse.json({
            brands,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                limit
            }
        });
    } catch (error) {
        console.error('Error fetching brands:', error);
        return NextResponse.json(
            { error: 'Failed to fetch brands' },
            { status: 500 }
        );
    }
}

// POST /api/brands - Create a new brand
export async function POST(request) {
    try {
        const data = await request.json();

        // Validate required fields
        if (!data.name) {
            return NextResponse.json(
                { error: 'Brand name is required' },
                { status: 400 }
            );
        }

        // Connect to database
        const { db } = await connectToDatabase();

        // Generate slug if not provided
        let slug = data.slug || '';
        if (!slug && data.name) {
            slug = data.name
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
        }

        // Check if the slug is unique
        if (slug) {
            const existingBrand = await db.collection('brands').findOne({ slug });
            if (existingBrand) {
                // Append a timestamp to make the slug unique
                slug = `${slug}-${Date.now()}`;
            }
        }

        // Prepare brand document
        const brand = {
            name: data.name,
            slug: slug,
            logo: data.logo || '',
            description: data.description || '',
            website: data.website || '',
            addresses: data.addresses || '',
            products: data.products || 0,
            enabled: data.enabled !== undefined ? data.enabled : true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Insert brand
        const result = await db.collection('brands').insertOne(brand);

        // Get the created brand with the _id
        const createdBrand = await db
            .collection('brands')
            .findOne({ _id: result.insertedId });

        if (!createdBrand) {
            return NextResponse.json(
                { error: 'Failed to create brand - could not retrieve the created document' },
                { status: 500 }
            );
        }

        return NextResponse.json(createdBrand, { status: 201 });
    } catch (error) {
        console.error('Error creating brand:', error);
        return NextResponse.json(
            { error: 'Failed to create brand' },
            { status: 500 }
        );
    }
} 