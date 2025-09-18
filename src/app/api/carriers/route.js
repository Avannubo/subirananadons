import { connectToDatabase } from '@/lib/mongodb';
export async function GET() {
    try {
        const { db } = await connectToDatabase();
        const carriers = await db.collection('carriers').find().sort({ posicion: 1 }).toArray();
        const preferences = await db.collection('shippingPreferences').findOne();
        return Response.json({ carriers, preferences });
    } catch (error) {
        return Response.json({ message: 'Error fetching data: ' + error.message }, { status: 500 });
    }
}
export async function POST(request) {
    try {
        const { db } = await connectToDatabase();
        const newCarrier = await request.json();
        // Validate required fields
        if (!newCarrier.nombre) {
            return Response.json({ message: 'Nombre is required' }, { status: 400 });
        }
        // Set defaults
        const carrierToInsert = {
            ...newCarrier,
            estado: newCarrier.estado !== undefined ? newCarrier.estado : true,
            "env/odratis": newCarrier.envioGratis !== undefined ? newCarrier.envioGratis : false,
            posicion: newCarrier.posicion || (await db.collection('carriers').countDocuments()) + 1,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const result = await db.collection('carriers').insertOne(carrierToInsert);
        return Response.json({ ...carrierToInsert, _id: result.insertedId }, { status: 201 });
    } catch (error) {
        return Response.json({ message: 'Error creating carrier: ' + error.message }, { status: 500 });
    }
}