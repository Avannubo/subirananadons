import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BirthList from '@/models/BirthList';

export async function POST(req) {
    try {
        await dbConnect();
        const { gifts } = await req.json(); // gifts: [{ listId, itemId }]
        if (!Array.isArray(gifts) || gifts.length === 0) {
            return NextResponse.json({ success: false, message: 'No gifts provided' }, { status: 400 });
        }
        // For each gift, check if the item is still available (state !== 2)
        const unavailable = [];
        for (const gift of gifts) {
            const { listId, itemId } = gift;
            if (!listId || !itemId) continue;
            const list = await BirthList.findById(listId);
            if (!list) continue;
            const item = list.items.id(itemId);
            if (!item || item.state === 2) {
                unavailable.push({ listId, itemId });
            }
        }
        return NextResponse.json({ success: true, unavailable });
    } catch (error) {
        console.error('Error checking gift availability:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
