import dbConnect from '@/lib/dbConnect';
import Offer from '@/models/Offer';
import { NextResponse } from 'next/server';
export async function GET() {
    await dbConnect();
    try {
        const offers = await Offer.find({}).sort({ order: 1, createdAt: 1 });
        return NextResponse.json(offers);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
export async function POST(request) {
    await dbConnect();
    try {
        const body = await request.json();
        // Validate required fields
        if (!body.imageUrl || !body.title || !body.description) {
            return NextResponse.json(
                { error: 'Todos los campos son obligatorios.' },
                { status: 400 }
            );
        }
        // Support both old and new translation structure
        const offerData = {
            imageUrl: body.imageUrl,
            title: {
                es: body.title?.es || body.title || '',
                ca: body.title?.ca || body.titleTranslations?.ca || ''
            },
            description: {
                es: body.description?.es || body.description || '',
                ca: body.description?.ca || body.descriptionTranslations?.ca || ''
            },
            brand: body.brand,
            brandLogo: body.brandLogo,
            discount: body.discount,
            link: body.link,
            order: body.order
        };
        const offer = await Offer.create(offerData);
        return NextResponse.json(offer, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
export async function PUT(request) {
    await dbConnect();
    try {
        const body = await request.json();
        const { _id } = body;
        if (!_id) {
            return NextResponse.json({ error: 'Se requiere ID' }, { status: 400 });
        }
        // Support both old and new translation structure
        const updateData = {
            imageUrl: body.imageUrl,
            title: {
                es: body.title?.es || body.title || '',
                ca: body.title?.ca || body.titleTranslations?.ca || ''
            },
            description: {
                es: body.description?.es || body.description || '',
                ca: body.description?.ca || body.descriptionTranslations?.ca || ''
            },
            brand: body.brand,
            brandLogo: body.brandLogo,
            discount: body.discount,
            link: body.link,
            order: body.order
        };
        const offer = await Offer.findByIdAndUpdate(_id, updateData, { new: true });
        if (!offer) {
            return NextResponse.json({ error: 'Oferta no encontrada' }, { status: 404 });
        }
        return NextResponse.json(offer);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
export async function DELETE(request) {
    await dbConnect();
    try {
        const body = await request.json();
        const { _id } = body;
        if (!_id) {
            return NextResponse.json({ error: 'Se requiere ID' }, { status: 400 });
        }
        const result = await Offer.findByIdAndDelete(_id);
        if (!result) {
            return NextResponse.json({ error: 'Oferta no encontrada' }, { status: 404 });
        }
        return new Response(null, { status: 204 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}