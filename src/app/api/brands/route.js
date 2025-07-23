import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Brand from '@/models/Brand';

// GET /api/brands - Get all brands with optional filtering
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const status = searchParams.get('status');
        const preventSort = searchParams.get('preventSort') === 'true';
        const id = searchParams.get('id');

        // Pagination parameters
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 5;
        const skip = (page - 1) * limit;

        await dbConnect();

        // Build query based on search parameters
        const query = {};

        if (id) {
            query._id = id;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { website: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) {
            query.enabled = status === 'enabled';
        }

        // Get total count for pagination
        const totalItems = await Brand.countDocuments(query);

        // Build the query with optional sorting
        let brandsQuery = Brand.find(query);

        // Apply sorting only if preventSort is false
        if (!preventSort) {
            brandsQuery = brandsQuery.sort({ updatedAt: -1 });
        }

        // Apply pagination
        brandsQuery = brandsQuery.skip(skip).limit(limit);

        // Execute the query
        const brands = await brandsQuery.exec();

        // Calculate pagination info
        const totalPages = Math.ceil(totalItems / limit);

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
        return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
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

        await dbConnect();

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
            const existingBrand = await Brand.findOne({ slug });
            if (existingBrand) {
                // Append a timestamp to make the slug unique
                slug = `${slug}-${Date.now()}`;
            }
        }

        // Prepare brand document
        const brand = new Brand({
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
        });

        // Insert brand
        await brand.save();

        return NextResponse.json(brand, { status: 201 });
    } catch (error) {
        console.error('Error creating brand:', error);
        return NextResponse.json(
            { error: 'Failed to create brand' },
            { status: 500 }
        );
    }
} 