import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
export async function PUT(request, { params }) {
    try {
        const { db } = await connectToDatabase();
        const id = params.id; // Access id directly from params
        const updatedCarrier = await request.json();
        // Validate required fields
        if (!updatedCarrier.nombre) {
            return Response.json({ message: 'Nombre is required' }, { status: 400 });
        }
        const result = await db.collection('carriers').updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedCarrier }
        );
        return Response.json(result);
    } catch (error) {
        return Response.json({ message: 'Error updating carrier: ' + error.message }, { status: 500 });
    }
}
export async function DELETE(request, { params }) {
    try {
        const { db } = await connectToDatabase();
        const id = params.id;
        await db.collection('carriers').deleteOne({ _id: new ObjectId(id) });
        return Response.json({ message: 'Carrier deleted' });
    } catch (error) {
        return Response.json({ message: 'Error deleting carrier: ' + error.message }, { status: 500 });
    }
}