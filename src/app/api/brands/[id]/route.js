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

        // Validate discount data if present and active
        if (data.discount && data.discount.active) {
            if (!data.discount.type || !['percentage', 'fixed'].includes(data.discount.type)) {
                return NextResponse.json({ error: 'Invalid discount type' }, { status: 400 });
            }

            if (!data.discount.value || Number(data.discount.value) <= 0) {
                return NextResponse.json({ error: 'Discount value must be greater than 0' }, { status: 400 });
            }

            if (data.discount.type === 'percentage' && Number(data.discount.value) > 100) {
                return NextResponse.json({ error: 'Percentage discount cannot exceed 100%' }, { status: 400 });
            }

            if (data.discount.startDate && data.discount.endDate) {
                const startDate = new Date(data.discount.startDate);
                const endDate = new Date(data.discount.endDate);

                if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
                }

                if (startDate >= endDate) {
                    return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
                }
            }

            if (data.discount.minPurchaseAmount && Number(data.discount.minPurchaseAmount) < 0) {
                return NextResponse.json({ error: 'Minimum purchase amount cannot be negative' }, { status: 400 });
            }

            if (data.discount.minQuantity && Number(data.discount.minQuantity) < 0) {
                return NextResponse.json({ error: 'Minimum quantity cannot be negative' }, { status: 400 });
            }
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

        // Handle discount data
        if (data.discount) {
            brand.discount = {
                active: Boolean(data.discount.active),
                type: data.discount.type || 'percentage',
                value: Number(data.discount.value) || 0,
                startDate: data.discount.startDate ? new Date(data.discount.startDate) : null,
                endDate: data.discount.endDate ? new Date(data.discount.endDate) : null,
                minPurchaseAmount: data.discount.minPurchaseAmount ? Number(data.discount.minPurchaseAmount) : null,
                minQuantity: data.discount.minQuantity ? Number(data.discount.minQuantity) : null
            };
        } else {
            brand.discount = {
                active: false,
                type: 'percentage',
                value: 0,
                startDate: null,
                endDate: null,
                minPurchaseAmount: null,
                minQuantity: null
            };
        }

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