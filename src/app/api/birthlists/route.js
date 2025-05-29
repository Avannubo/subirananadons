import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import BirthList from '@/models/BirthList';
import User from '@/models/User';
import Product from '@/models/Product';  // Add Product model import

export async function GET(request) {
    try {
        // Check if user is authenticated
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized: Authentication required' },
                { status: 401 }
            );
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const preventSort = searchParams.get('preventSort') === 'true';

        // If admin, return all birth lists
        // Otherwise, return only the user's birth lists
        let query = {};
        if (session.user.role !== 'admin') {
            query.user = session.user.id;
        }        // Build the query with optional sorting
        let birthListsQuery = BirthList.find(query)
            .populate('user', 'name email')
            .populate('items.product', 'name reference'); // Populate product data for each item

        // Apply sorting only if preventSort is false
        if (!preventSort) {
            birthListsQuery = birthListsQuery.sort({ createdAt: -1 });
        }

        // Execute the query
        const birthLists = await birthListsQuery.lean();

        return NextResponse.json({ success: true, data: birthLists });
    } catch (error) {
        console.error('Error fetching birth lists:', error);
        return NextResponse.json(
            { success: false, message: 'Error fetching birth lists', error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        // Check if user is authenticated
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized: Authentication required' },
                { status: 401 }
            );
        }

        await dbConnect();

        // Parse request body
        const data = await request.json();

        // Ensure the user exists
        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        // Validate required fields
        if (!data.title || !data.babyName || !data.dueDate) {
            return NextResponse.json(
                { success: false, message: 'Required fields missing: title, babyName, dueDate' },
                { status: 400 }
            );
        }

        // Create new birth list with user ID from session
        const birthListData = {
            user: session.user.id,
            title: data.title,
            description: data.description || '',
            babyName: data.babyName,
            dueDate: new Date(data.dueDate),
            isPublic: data.isPublic !== undefined ? data.isPublic : true,
            items: data.items || [],
            theme: data.theme || 'default',
            status: data.status || 'Activa'
        };

        // Create the birth list
        const birthList = await BirthList.create(birthListData);

        // Return the created birth list
        return NextResponse.json(
            {
                success: true,
                message: 'Birth list created successfully',
                _id: birthList._id,
                ...birthList.toObject()
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating birth list:', error);
        return NextResponse.json(
            { success: false, message: 'Error creating birth list', error: error.message },
            { status: 500 }
        );
    }
}