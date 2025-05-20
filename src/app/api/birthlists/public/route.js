import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BirthList from '@/models/BirthList';

export async function GET(request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const preventSort = searchParams.get('preventSort') === 'true';

        // Only fetch birth lists that are public and active
        const query = {
            isPublic: true,
            status: 'Activa'
        };

        // Build the query with optional sorting
        let birthListsQuery = BirthList.find(query)
            .populate('user', 'name');

        // Apply sorting only if preventSort is false
        if (!preventSort) {
            birthListsQuery = birthListsQuery.sort({ createdAt: -1 });
        }

        // Execute the query
        const birthLists = await birthListsQuery.lean();

        return NextResponse.json({
            success: true,
            data: birthLists
        });
    } catch (error) {
        console.error('Error fetching public birth lists:', error);
        return NextResponse.json(
            { success: false, message: 'Error fetching public birth lists', error: error.message },
            { status: 500 }
        );
    }
} 