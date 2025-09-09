import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import BirthList from '@/models/BirthList';
import User from '@/models/User';
import EmailService from '@/services/EmailService';

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
        console.error('Error en obtenir les llistes de naixement:', error);
        return NextResponse.json(
            { success: false, message: 'Error en obtenir les llistes de naixement', error: error.message },
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
        console.log('Creating birth list with data:', data);

        // Determine the user for the list (admin can set userId or user, others use their own)
        let userIdToUse = session.user.id;
        if (session.user.role === 'admin') {
            // Accept either data.user or data.userId for flexibility
            if (data.user) {
                userIdToUse = data.user.id;
            }
        }
        // Ensure the user exists
        const user = await User.findById(userIdToUse);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Usuari no trobat' },
                { status: 404 }
            );
        }

        // Validate required fields
        if (!data.title || !data.babyName || !data.dueDate) {
            return NextResponse.json(
                { success: false, message: 'Falten camps obligatoris: títol, nom del nadó, data prevista' },
                { status: 400 }
            );
        }

        // Set userEmail and userName
        let userEmail = undefined;
        let userName = undefined;
        if (session.user.role === 'admin' && data.userEmail) {
            userEmail = data.userEmail;
        } else if (user.email) {
            userEmail = user.email;
        }
        if (session.user.role === 'admin' && data.userName) {
            userName = data.userName;
        } else if (user.name) {
            userName = user.name;
        }
        console.log('Creating birth list for user:', userIdToUse, 'with email:', userEmail, 'and name:', userName);
        const birthListData = {
            user: userIdToUse,
            // userEmail,
            // userName,
            email: userEmail, // legacy/compatibility
            Creator: userName, // legacy/compatibility
            title: data.title,
            description: data.description || '',
            babyName: data.babyName,
            dueDate: new Date(data.dueDate),
            isPublic: data.isPublic !== undefined ? data.isPublic : true,
            items: data.items || [],
            theme: data.theme || 'default',
            status: data.status || 'Activa'
        };
        // Create the birth list in the database
        const birthList = await BirthList.create(birthListData);

        // Send confirmation emails
        try {
            await EmailService.sendListCreationConfirmation(birthList, user);
        } catch (emailError) {
            console.error('Error en enviar el correu de confirmació de creació:', emailError);
            // We don't want to fail the list creation if email sending fails
        }

        // Return the created birth list
        return NextResponse.json(
            {
                success: true,
                message: 'Llista de naixement creada correctament',
                _id: birthList._id,
                ...birthList.toObject()
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error en crear la llista de naixement:', error);
        return NextResponse.json(
            { success: false, message: 'Error en crear la llista de naixement', error: error.message },
            { status: 500 }
        );
    }
} 