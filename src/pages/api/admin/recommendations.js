
import dbConnect from '@/lib/dbConnect';
import RecommendationContainer from '@/models/RecommendationContainer';
import Category from '@/models/Category';
import Product from '@/models/Product';

export default async function handler(req, res) {
    await dbConnect();

    if (req.method === 'GET') {
        // Get all recommendation containers with groups, categories, and products
        const containers = await RecommendationContainer.find({})
            .populate({
                path: 'groups.items',
                model: 'Product'
            })
            .populate({
                path: 'groups.category',
                model: 'Category'
            });
        return res.status(200).json({ containers });
    }

    if (req.method === 'POST') {
        // Create a new recommendation container
        const { title, groups } = req.body;
        if (!title || !Array.isArray(groups) || groups.length === 0) {
            return res.status(400).json({ error: 'Title and groups are required' });
        }
        const container = await RecommendationContainer.create({ title, groups });
        return res.status(201).json({ container });
    }

    if (req.method === 'PUT') {
        // Update a recommendation container
        const { id, title, groups } = req.body;
        if (!id) return res.status(400).json({ error: 'ID is required' });
        const updated = await RecommendationContainer.findByIdAndUpdate(
            id,
            { title, groups },
            { new: true }
        );
        return res.status(200).json({ container: updated });
    }

    if (req.method === 'DELETE') {
        // Delete a recommendation container
        const { id } = req.body;
        if (!id) return res.status(400).json({ error: 'ID is required' });
        await RecommendationContainer.findByIdAndDelete(id);
        return res.status(204).end();
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
