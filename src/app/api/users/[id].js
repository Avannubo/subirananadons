// pages/api/users/[id].js
import { NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';
import { populateUser } from '@/utils/populateUser';

export async function GET(request, { params }) {
    await dbConnect();

    try {
        const user = await populateUser(
            User.findById(params.id)
                .select('-password -__v')
        );

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, user });
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }
}

export async function PUT(request, { params }) {
    await dbConnect();

    try {
        const body = await request.json();

        // Prevent updating sensitive fields
        const { password, isAdmin, payments, addresses, orders, birthLists, ...updateData } = body;

        const user = await populateUser(
            User.findByIdAndUpdate(
                params.id,
                updateData,
                { new: true }
            ).select('-password -__v')
        );

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, user });
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }
}

export async function DELETE(request, { params }) {
    await dbConnect();

    try {
        // First find user to get related documents
        const user = await User.findById(params.id);

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Delete related documents (optional - depends on your requirements)
        await Promise.all([
            mongoose.model('PaymentMethod').deleteMany({ user: user._id }),
            mongoose.model('Address').deleteMany({ user: user._id }),
            mongoose.model('Order').deleteMany({ user: user._id }),
            mongoose.model('BirthList').deleteMany({ user: user._id })
        ]);

        // Then delete the user
        await User.findByIdAndDelete(params.id);

        return NextResponse.json({
            success: true,
            message: 'User and all related data deleted successfully'
        });
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }
}