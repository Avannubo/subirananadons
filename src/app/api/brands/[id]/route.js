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

        // Prepare update data
        const updateData = {
            name: data.name,
            logo: data.logo || '',
            description: data.description || '',
            website: data.website || '',
            addresses: data.addresses || '',
            products: data.products || 0,
            enabled: data.enabled !== undefined ? data.enabled : true,
            updatedAt: new Date()
        };

        // Find and update brand
        let result;
        if (ObjectId.isValid(id)) {
            result = await db.collection('brands').findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: updateData },
                { returnDocument: 'after' }
            );
        }

        // If not found by ObjectId, try to update by numeric ID
        if (!result?.value) {
            result = await db.collection('brands').findOneAndUpdate(
                { id: parseInt(id) },
                { $set: updateData },
                { returnDocument: 'after' }
            );
        }

        // If still not found, return 404
        if (!result?.value) {
            return NextResponse.json(
                { error: 'Brand not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(result.value);
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