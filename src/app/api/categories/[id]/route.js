import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Category from '@/models/Category';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

// Get a specific category
export async function GET(request, { params }) {
    try {
        const { id } = params;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'ID de categoria no vàlid' }, { status: 400 });
        }

        await dbConnect();

        const category = await Category.findById(id);

        if (!category) {
            return NextResponse.json({ error: 'Categoria no trobada' }, { status: 404 });
        }

        // Check if we need to include children
        const { searchParams } = new URL(request.url);
        const includeChildren = searchParams.get('includeChildren') === 'true';

        if (includeChildren) {
            const result = category.toObject();
            const subcategories = await category.getAllSubcategories();
            result.children = subcategories.map(subcat => subcat.toObject());
            return NextResponse.json(result);
        }

        return NextResponse.json(category);
    } catch (error) {
        console.error('Error fetching category:', error);
        return NextResponse.json({ error: 'No s\'ha pogut obtenir la categoria' }, { status: 500 });
    }
}

// Update a category
export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is admin
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'No autoritzat - Cal accés d\'administrador' }, { status: 401 });
        }

        const { id } = params;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'ID de categoria no vàlid' }, { status: 400 });
        }

        await dbConnect();

        const body = await request.json();

        // Check if the category exists
        const category = await Category.findById(id);

        if (!category) {
            return NextResponse.json({ error: 'Categoria no trobada' }, { status: 404 });
        }

        // Check for parent changes
        if (body.parent !== undefined) {
            // If changing from null to a parent or changing parents
            if (body.parent !== null && body.parent !== String(category.parent)) {
                // Validate that the new parent exists
                if (body.parent) {
                    const parentCategory = await Category.findById(body.parent);

                    if (!parentCategory) {
                        return NextResponse.json({ error: 'Categoria pare no trobada' }, { status: 400 });
                    }

                    // Update level based on new parent
                    body.level = parentCategory.level + 1;
                }
            }

            // If removing parent (making it a root category)
            if (body.parent === null || body.parent === 'null') {
                body.parent = null;
                body.level = 1;
            }
        }

        // Update the category
        const updatedCategory = await Category.findByIdAndUpdate(id, body, { new: true });

        return NextResponse.json(updatedCategory);
    } catch (error) {
        console.error('Error updating category:', error);

        if (error.code === 11000) {
            return NextResponse.json({ error: 'Ja existeix una categoria amb aquest slug' }, { status: 400 });
        }

        return NextResponse.json({ error: 'No s\'ha pogut actualitzar la categoria' }, { status: 500 });
    }
}

// Delete a category
export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is admin
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'No autoritzat - Cal accés d\'administrador' }, { status: 401 });
        }

        const { id } = params;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'ID de categoria no vàlid' }, { status: 400 });
        }

        await dbConnect();

        // Check if the category exists
        const category = await Category.findById(id);

        if (!category) {
            return NextResponse.json({ error: 'Categoria no trobada' }, { status: 404 });
        }

        // Check if category has children
        const childrenCount = await Category.countDocuments({ parent: id });

        if (childrenCount > 0) {
            return NextResponse.json({
                error: 'No es pot eliminar una categoria amb subcategories. Elimina primer totes les subcategories o reassigna-les.'
            }, { status: 400 });
        }

        // Check if there are products using this category
        // Add code here to check for products using this category if needed

        // Delete the category
        await Category.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Categoria eliminada correctament' });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json({ error: 'No s\'ha pogut eliminar la categoria' }, { status: 500 });
    }
} 