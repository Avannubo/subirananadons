import Order from '@/models/Order';

export async function getGiftOrdersForList(listId) {
    // Find all orders that have at least one item with type 'gift' and giftInfo.listId matching the given listId
    return await Order.find({
        'items': {
            $elemMatch: {
                type: 'gift',
                'giftInfo.listId': listId
            }
        }
    });
}
