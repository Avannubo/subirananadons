import dbConnect from '@/lib/dbConnect';
import RecommendationContainer from '@/models/RecommendationContainer';

export default async function handler(req, res) {
    await dbConnect();

    if (req.method === 'GET') {
        // Get all recommendation containers
        const containers = await RecommendationContainer.find({}).populate('items');
        return res.status(200).json({ containers });
    }

    if (req.method === 'POST') {
        // Create a new recommendation container
        const { title, items } = req.body;
        if (!title || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Title and items are required' });
        }
        const container = await RecommendationContainer.create({ title, items });
        return res.status(201).json({ container });
    }

    if (req.method === 'PUT') {
        // Update a recommendation container
        const { id, title, items } = req.body;
        if (!id) return res.status(400).json({ error: 'ID is required' });
        const updated = await RecommendationContainer.findByIdAndUpdate(
            id,
            { title, items },
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
