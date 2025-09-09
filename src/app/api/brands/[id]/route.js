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
        console.error('Error en obtenir la marca:', error);
        return NextResponse.json(
            { error: 'Error en obtenir la marca' },
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
            return NextResponse.json({ error: 'El nom de la marca és obligatori' }, { status: 400 });
        }

        // Validate discount data if present and active
        if (data.discount && data.discount.active) {
            if (!data.discount.type || !['percentage', 'fixed'].includes(data.discount.type)) {
                return NextResponse.json({ error: 'Tipus de descompte no vàlid' }, { status: 400 });
            }

            if (!data.discount.value || Number(data.discount.value) <= 0) {
                return NextResponse.json({ error: 'El valor del descompte ha de ser superior a 0' }, { status: 400 });
            }

            if (data.discount.type === 'percentage' && Number(data.discount.value) > 100) {
                return NextResponse.json({ error: 'El descompte percentual no pot superar el 100%' }, { status: 400 });
            }

            if (data.discount.startDate && data.discount.endDate) {
                const startDate = new Date(data.discount.startDate);
                const endDate = new Date(data.discount.endDate);

                if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                    return NextResponse.json({ error: 'Format de data no vàlid' }, { status: 400 });
                }

                if (startDate >= endDate) {
                    return NextResponse.json({ error: 'La data de finalització ha de ser posterior a la data d\'inici' }, { status: 400 });
                }
            }

            if (data.discount.minPurchaseAmount && Number(data.discount.minPurchaseAmount) < 0) {
                return NextResponse.json({ error: 'L\'import mínim de compra no pot ser negatiu' }, { status: 400 });
            }

            if (data.discount.minQuantity && Number(data.discount.minQuantity) < 0) {
                return NextResponse.json({ error: 'La quantitat mínima no pot ser negativa' }, { status: 400 });
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
        console.error('Error en actualitzar la marca:', error);
        return NextResponse.json(
            { error: 'Error en actualitzar la marca' },
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
        return NextResponse.json({ message: 'Marca eliminada correctament' }, { status: 200 });
    } catch (error) {
        console.error('Error en eliminar la marca:', error);
        return NextResponse.json(
            { error: 'Error en eliminar la marca' },
            { status: 500 }
        );
    }
} 