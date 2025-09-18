// GET /api/portimg/active
// Returns the active banner image (portada) from the DB
import dbConnect from '@/lib/dbConnect';
import PortImg from '@/models/PortImg';
export async function GET(req) {
    await dbConnect();
    try {
        const activeImg = await PortImg.findOne({ active: true });
        if (!activeImg) {
            return Response.json({ imageUrl: null }, { status: 200 });
        }
        return Response.json({ imageUrl: activeImg.imageUrl }, { status: 200 });
    } catch (error) {
        return Response.json({ error: 'Error al obtener la imagen del banner activo.' }, { status: 500 });
    }
}
