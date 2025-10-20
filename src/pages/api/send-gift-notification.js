import EmailService from '@/services/EmailService';
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        const { selectedList, action, item, cancelledItem } = req.body;
        if (!selectedList) {
            return res.status(400).json({ error: 'Missing selectedList data' });
        }
        if (action === 'cancel') {
            if (cancelledItem) {
                await EmailService.sendGiftCancelNotification(selectedList, cancelledItem);
                return res.status(200).json({ success: true, type: 'cancel' });
            } else {
                return res.status(400).json({ error: 'Item is not cancelled (state !== 0)' });
            }
        } else if (action === 'reserve' || action === 'buy') {
            if (!item) {
                return res.status(400).json({ error: 'Missing item data for notification' });
            }
            await EmailService.sendGiftPurchaseNotification(selectedList, item, action);
            return res.status(200).json({ success: true, type: action });
        } else {
            return res.status(400).json({ error: 'Unknown action' });
        }
    } catch (error) {
        console.error('API error sending gift notification:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
