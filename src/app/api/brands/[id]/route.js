import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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

        // Connect to database
        const { db } = await connectToDatabase();

        // Find brand
        let brand;
        if (ObjectId.isValid(id)) {
            // Try to find by MongoDB ObjectId
            brand = await db.collection('brands').findOne({ _id: new ObjectId(id) });
        }

        // If not found by ObjectId, try to find by numeric ID
        if (!brand) {
            brand = await db.collection('brands').findOne({ id: parseInt(id) });
        }

        // If still not found, return 404
        if (!brand) {
            return NextResponse.json(
                { error: 'Brand not found' },
                { status: 404 }
            );
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

        // Connect to database
        const { db } = await connectToDatabase();

        // Validate required fields
        if (!data.name) {
            return NextResponse.json(
                { error: 'Brand name is required' },
                { status: 400 }
            );
        }

        // First, check if the brand exists
        let existingBrand;
        if (ObjectId.isValid(id)) {
            existingBrand = await db.collection('brands').findOne({ _id: new ObjectId(id) });
        }

        if (!existingBrand) {
            existingBrand = await db.collection('brands').findOne({ id: parseInt(id) });
        }

        if (!existingBrand) {
            return NextResponse.json(
                { error: 'Brand not found' },
                { status: 404 }
            );
        }

        // Prepare update data
        const updateData = {
            name: data.name,
            slug: data.slug || '',
            logo: data.logo || '',
            description: data.description || '',
            website: data.website || '',
            addresses: data.addresses || '',
            products: data.products || 0,
            enabled: data.enabled !== undefined ? data.enabled : true,
            updatedAt: new Date()
        };

        // Update based on the found document's ID
        let result;
        if (ObjectId.isValid(existingBrand._id)) {
            await db.collection('brands').updateOne(
                { _id: existingBrand._id },
                { $set: updateData }
            );
            result = await db.collection('brands').findOne({ _id: existingBrand._id });
        } else {
            await db.collection('brands').updateOne(
                { id: existingBrand.id },
                { $set: updateData }
            );
            result = await db.collection('brands').findOne({ id: existingBrand.id });
        }

        return NextResponse.json(result);
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

        // Connect to database
        const { db } = await connectToDatabase();

        // Delete brand
        let result;
        if (ObjectId.isValid(id)) {
            result = await db.collection('brands').deleteOne({ _id: new ObjectId(id) });
        }

        // If not deleted by ObjectId, try to delete by numeric ID
        if (!result?.deletedCount) {
            result = await db.collection('brands').deleteOne({ id: parseInt(id) });
        }

        // If still not deleted, return 404
        if (!result?.deletedCount) {
            return NextResponse.json(
                { error: 'Brand not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Brand deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting brand:', error);
        return NextResponse.json(
            { error: 'Failed to delete brand' },
            { status: 500 }
        );
    }
} 