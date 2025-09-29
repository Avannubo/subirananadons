import EmailService from '@/services/EmailService';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        const { selectedList } = req.body;
        if (!selectedList) {
            return res.status(400).json({ error: 'Missing selectedList data' });
        }
        await EmailService.sendGiftPurchaseNotification(selectedList);
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('API error sending gift notification:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
