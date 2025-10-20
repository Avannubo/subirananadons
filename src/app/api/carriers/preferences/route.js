import { connectToDatabase } from '@/lib/mongodb';
export async function GET() {
    try {
        const { db } = await connectToDatabase();
        const preferences = await db.collection('shippingPreferences').findOne();
        return Response.json(preferences || {});
    } catch (error) {
        return Response.json({ message: 'Error fetching preferences' }, { status: 500 });
    }
}
export async function PUT(request) {
    try {
        const { db } = await connectToDatabase();
        const preferences = await request.json();
        const result = await db.collection('shippingPreferences').updateOne(
            {},
            { $set: preferences },
            { upsert: true }
        );
        return Response.json(result);
    } catch (error) {
        return Response.json({ message: 'Error updating preferences' }, { status: 400 });
    }
}