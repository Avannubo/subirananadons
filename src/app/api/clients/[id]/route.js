import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

// Helper function to convert user document to client format
function userToClient(user) {
    if (!user) return null;

    return {
        id: user._id.toString(),
        name: user.name.split(' ')[0] || '',
        lastName: user.name.split(' ').slice(1).join(' ') || '',
        email: user.email,
        registrationDate: user.createdAt.toISOString().split('T')[0],
        active: user.emailVerified !== null,
        newsletter: user.newsletter || false,
        partnerOffers: user.partnerOffers || false,
        sales: 0 // This would come from orders in a real app
    };
}

// Get a single client by ID
export async function GET(request, { params }) {
    try {
        // Check authorization
        const session = await getServerSession(authOptions);
        if (!session?.user?.role === 'admin') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized: Admin access required' },
                { status: 403 }
            );
        }

        // Connect to database
        await dbConnect();

        // Get client ID from params
        const { id } = params;

        // Find the user
        const user = await User.findById(id).select('-password -resetPasswordToken -resetPasswordExpires -__v');

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Client not found' },
                { status: 404 }
            );
        }

        // Check if the user is a client (role = 'user')
        if (user.role !== 'user') {
            return NextResponse.json(
                { success: false, message: 'Record found is not a client' },
                { status: 400 }
            );
        }

        // Return the client data
        return NextResponse.json({
            success: true,
            client: userToClient(user)
        });
    } catch (error) {
        console.error('Error fetching client:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// Update a client by ID
export async function PUT(request, { params }) {
    try {
        // Check authorization
        const session = await getServerSession(authOptions);
        if (!session?.user?.role === 'admin') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized: Admin access required' },
                { status: 403 }
            );
        }        // Connect to database
        await dbConnect();

        // Get and validate params
        const resolvedParams = await Promise.resolve(params);
        const id = resolvedParams.id;
        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Missing client ID' },
                { status: 400 }
            );
        }

        // Get request body
        const data = await request.json();
        const { name, lastName, email, active, newsletter, partnerOffers } = data;
        console.log('Updating client with data:', data);

        // Find the user
        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Client not found' },
                { status: 404 }
            );
        }

        // Check if the user is a client (role = 'user')
        if (user.role !== 'user') {
            return NextResponse.json(
                { success: false, message: 'Record found is not a client' },
                { status: 400 }
            );
        }

        // Check if email is changed and already exists for another user
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser && existingUser._id.toString() !== id) {
                return NextResponse.json(
                    { success: false, message: 'Email already in use' },
                    { status: 400 }
                );
            }
        }

        // Update user data
        if (name || lastName) {
            user.name = `${name || user.name.split(' ')[0]} ${lastName || user.name.split(' ').slice(1).join(' ')}`;
        }

        if (email) {
            user.email = email;
        }

        // Update status fields
        if (active !== undefined) {
            user.emailVerified = active ? new Date() : null;
        }

        if (newsletter !== undefined) {
            user.newsletter = newsletter;
        }

        if (partnerOffers !== undefined) {
            user.partnerOffers = partnerOffers;
        }

        // Save the updated user
        await user.save();

        // Return success response with updated client data
        return NextResponse.json({
            success: true,
            message: 'Client updated successfully',
            client: userToClient(user)
        });
    } catch (error) {
        console.error('Error updating client:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// Delete a client by ID
export async function DELETE(request, { params }) {
    try {
        // Check authorization
        const session = await getServerSession(authOptions);
        if (!session?.user?.role === 'admin') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized: Admin access required' },
                { status: 403 }
            );
        }        // Connect to database
        await dbConnect();

        // Get and validate params
        const resolvedParams = await Promise.resolve(params);
        const id = resolvedParams.id;
        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Missing client ID' },
                { status: 400 }
            );
        }

        // Find the user
        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Client not found' },
                { status: 404 }
            );
        }

        // Check if the user is a client (role = 'user')
        if (user.role !== 'user') {
            return NextResponse.json(
                { success: false, message: 'Record found is not a client' },
                { status: 400 }
            );
        }

        // Delete the user
        await User.findByIdAndDelete(id);

        // Return success response
        return NextResponse.json({
            success: true,
            message: 'Client deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting client:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
} 