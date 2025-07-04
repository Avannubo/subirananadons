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
        if (!body.imageUrl || !body.title || !body.description ) {
            return NextResponse.json(
                { error: 'Todos los campos son obligatorios.' },
                { status: 400 }
            );
        }
        const offer = await Offer.create(body);
        return NextResponse.json(offer, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(request) {
    await dbConnect();
    try {
        const body = await request.json();
        const { _id, ...rest } = body;
        if (!_id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }
        const offer = await Offer.findByIdAndUpdate(_id, rest, { new: true });
        if (!offer) {
            return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
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
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }
        const result = await Offer.findByIdAndDelete(_id);
        if (!result) {
            return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
        }
        return new Response(null, { status: 204 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}