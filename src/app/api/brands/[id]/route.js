import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Brand from '@/models/Brand';

// GET /api/brands/[id] - Get a single brand by ID
export async function GET(request, { params }) {
    try {
        const { id } = params;

        // Check if ID is valid
        if (!id) {
            return NextResponse.json(
                { error: 'Brand ID is required' },
                { status: 400 }
            );
        }

        await dbConnect();
        let brand = null;
        if (id && id.length === 24) {
            brand = await Brand.findById(id);
        }
        if (!brand) {
            brand = await Brand.findOne({ id: parseInt(id) });
        }
        if (!brand) {
            return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
        }
        return NextResponse.json(brand);
    } catch (error) {
        console.error('Error fetching brand:', error);
        return NextResponse.json(
            { error: 'Failed to fetch brand' },
            { status: 500 }
        );
    }
}

// PUT /api/brands/[id] - Update a brand
export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const data = await request.json();

        // Check if ID is valid
        if (!id) {
            return NextResponse.json(
                { error: 'Brand ID is required' },
                { status: 400 }
            );
        }

        await dbConnect();
        if (!data.name) {
            return NextResponse.json({ error: 'Brand name is required' }, { status: 400 });
        }
        let brand = null;
        if (id && id.length === 24) {
            brand = await Brand.findById(id);
        }
        if (!brand) {
            brand = await Brand.findOne({ id: parseInt(id) });
        }
        if (!brand) {
            return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
        }
        brand.name = data.name;
        brand.slug = data.slug || '';
        brand.logo = data.logo || '';
        brand.description = data.description || '';
        brand.website = data.website || '';
        brand.addresses = data.addresses || '';
        brand.products = data.products || 0;
        brand.enabled = data.enabled !== undefined ? data.enabled : true;
        brand.updatedAt = new Date();
        await brand.save();
        return NextResponse.json(brand);
    } catch (error) {
        console.error('Error updating brand:', error);
        return NextResponse.json(
            { error: 'Failed to update brand' },
            { status: 500 }
        );
    }
}

// DELETE /api/brands/[id] - Delete a brand
export async function DELETE(request, { params }) {
    try {
        const { id } = params;

        // Check if ID is valid
        if (!id) {
            return NextResponse.json(
                { error: 'Brand ID is required' },
                { status: 400 }
            );
        }

        await dbConnect();
        let brand = null;
        if (id && id.length === 24) {
            brand = await Brand.findById(id);
        }
        if (!brand) {
            brand = await Brand.findOne({ id: parseInt(id) });
        }
        if (!brand) {
            return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
        }
        await Brand.deleteOne({ _id: brand._id });
        return NextResponse.json({ message: 'Brand deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting brand:', error);
        return NextResponse.json(
            { error: 'Failed to delete brand' },
            { status: 500 }
        );
    }
} 