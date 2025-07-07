import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export default async function handler(req, res) {
    await dbConnect();

    if (req.method === 'GET') {
        const products = await Product.find({});
        return res.status(200).json({ products });
    }

    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
