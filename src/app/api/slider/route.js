import dbConnect from '@/lib/dbConnect';
import SliderItem from '@/models/SliderItem';

export async function GET(req) {
    await dbConnect();
    const sliders = await SliderItem.find({ active: true }).sort({ order: 1 });
    return Response.json(sliders);
}

export async function POST(req) {
    await dbConnect();
    const data = await req.json();
    const slider = await SliderItem.create(data);
    return Response.json(slider);
}

export async function PUT(req) {
    await dbConnect();
    const data = await req.json();
    const { _id, ...update } = data;
    const slider = await SliderItem.findByIdAndUpdate(_id, update, { new: true });
    return Response.json(slider);
}

export async function DELETE(req) {
    await dbConnect();
    const { _id } = await req.json();
    await SliderItem.findByIdAndDelete(_id);
    return Response.json({ success: true });
}
