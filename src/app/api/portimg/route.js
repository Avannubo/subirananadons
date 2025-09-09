import dbConnect from '@/lib/dbConnect';
import PortImg from '@/models/PortImg';
import { NextResponse } from 'next/server';

export async function GET() {
    await dbConnect();
    try {
        const imgs = await PortImg.find({}).sort({ uploadedAt: -1 });
        return NextResponse.json(imgs);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    await dbConnect();
    try {
        const body = await request.json();
        if (!body.imageUrl) {
            return NextResponse.json({ error: 'La URL de la imagen es requerida.' }, { status: 400 });
        }
        const img = await PortImg.create({ imageUrl: body.imageUrl });
        return NextResponse.json(img, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(request) {
    await dbConnect();
    try {
        const body = await request.json();
        const { _id, active } = body;
        if (!_id) {
            return NextResponse.json({ error: 'El ID de la imagen es requerido.' }, { status: 400 });
        }
        // Set all images to active: false
        await PortImg.updateMany({}, { $set: { active: false } });
        // Set the selected image to active: true
        const updated = await PortImg.findByIdAndUpdate(_id, { active: !!active }, { new: true });
        if (!updated) {
            return NextResponse.json({ error: 'Imagen no encontrada.' }, { status: 404 });
        }
        return NextResponse.json(updated);
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
            return NextResponse.json({ error: 'Image ID is required.' }, { status: 400 });
        }

        // First check if the image exists
        const existingImg = await PortImg.findById(_id);
        if (!existingImg) {
            return NextResponse.json({ error: 'Imagen no encontrada.' }, { status: 404 });
        }

        // Delete the image
        const deleted = await PortImg.findByIdAndDelete(_id);

        // If the deleted image was active, set the most recent image as active
        if (existingImg.active) {
            const mostRecent = await PortImg.findOne().sort({ uploadedAt: -1 });
            if (mostRecent) {
                await PortImg.findByIdAndUpdate(mostRecent._id, { active: true });
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Imagen eliminada correctamente',
            deletedImage: deleted
        });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
