import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';

export default async function handler(req, res) {
    await dbConnect();

    if (req.method === 'GET') {
        const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
        return res.status(200).json({ categories });
    }

    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
