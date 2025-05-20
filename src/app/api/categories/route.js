import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Category from '@/models/Category';
import dbConnect from '@/lib/dbConnect';

// Get all categories or filtered categories
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const parent = searchParams.get('parent');
        const includeChildren = searchParams.get('includeChildren') === 'true';

        await dbConnect();

        let query = {};

        // If parent parameter is specified, filter by parent
        if (parent === 'null' || parent === 'root') {
            // Get root categories (those without parent)
            query.parent = null;
        } else if (parent) {
            // Get categories with the specified parent
            query.parent = parent;
        }

        // Base query to get categories
        let categories = await Category.find(query).sort({ order: 1, name: 1 });

        // If includeChildren is true, populate child categories recursively
        if (includeChildren) {
            // For each top-level category, fetch its children recursively
            const result = [];

            for (const category of categories) {
                const populatedCategory = category.toObject();

                if (includeChildren) {
                    // Get all subcategories
                    const subcategories = await category.getAllSubcategories();
                    populatedCategory.children = subcategories.map(subcat => subcat.toObject());
                }

                result.push(populatedCategory);
            }

            return NextResponse.json(result);
        }

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

// Create a new category
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is admin
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
        }

        await dbConnect();

        const body = await request.json();

        // Validate required fields
        if (!body.name) {
            return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
        }

        // Determine level based on parent
        let level = 1;

        if (body.parent) {
            const parentCategory = await Category.findById(body.parent);

            if (!parentCategory) {
                return NextResponse.json({ error: 'Parent category not found' }, { status: 400 });
            }

            level = parentCategory.level + 1;
        }

        // Create category with level
        const category = await Category.create({
            ...body,
            level
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error('Error creating category:', error);

        if (error.code === 11000) {
            return NextResponse.json({ error: 'Category with this slug already exists' }, { status: 400 });
        }

        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}

// Update multiple categories (for reordering)
export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is admin
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
        }

        await dbConnect();

        const { categories } = await request.json();

        if (!Array.isArray(categories)) {
            return NextResponse.json({ error: 'Invalid categories data' }, { status: 400 });
        }

        // Update each category
        const updatePromises = categories.map(cat =>
            Category.findByIdAndUpdate(cat._id, { order: cat.order }, { new: true })
        );

        await Promise.all(updatePromises);

        return NextResponse.json({ message: 'Categories updated successfully' });
    } catch (error) {
        console.error('Error updating categories:', error);
        return NextResponse.json({ error: 'Failed to update categories' }, { status: 500 });
    }
} 