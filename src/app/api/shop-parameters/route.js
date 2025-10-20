export async function DELETE(req) {
    await dbConnect();
    const { key } = await req.json();
    if (!key) return NextResponse.json({ error: 'Clave requerida' }, { status: 400 });
    await ShopParameter.deleteOne({ key });
    return NextResponse.json({ success: true });
}
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ShopParameter from "@/models/ShopParameter";
export async function GET(req) {
    await dbConnect();
    const params = await ShopParameter.find({});
    return NextResponse.json(params);
}
export async function POST(req) {
    await dbConnect();
    const { key, value, description } = await req.json();
    let param = await ShopParameter.findOne({ key });
    if (param) {
        param.value = value;
        if (description) param.description = description;
        await param.save();
    } else {
        param = await ShopParameter.create({ key, value, description });
    }
    return NextResponse.json(param);
}
