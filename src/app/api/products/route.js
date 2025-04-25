import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Product from '@/models/Product';
import dbConnect from '@/lib/dbConnect';

// Get all products or filtered products
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');
        const reference = searchParams.get('reference');
        const category = searchParams.get('category');
        const status = searchParams.get('status');
        const brand = searchParams.get('brand');

        await dbConnect();

        // Build query based on search parameters
        const query = {};
        if (name) query.name = { $regex: name, $options: 'i' };
        if (reference) query.reference = { $regex: reference, $options: 'i' };
        if (category) query.category = { $regex: category, $options: 'i' };
        if (status) query.status = status;
        if (brand) query.brand = { $regex: brand, $options: 'i' };

        const products = await Product.find(query).sort({ createdAt: -1 });

        return NextResponse.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

// Create a new product
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
        if (!body.name || !body.category || body.price_excl_tax === undefined || body.price_incl_tax === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Create the product
        const product = await Product.create({
            name: body.name,
            reference: body.reference || '',
            description: body.description || '',
            category: body.category,
            brand: body.brand || '',
            price_excl_tax: parseFloat(body.price_excl_tax),
            price_incl_tax: parseFloat(body.price_incl_tax),
            image: body.image || '/assets/images/default-product.png',
            stock: {
                physical: parseInt(body.stock?.physical || 0),
                minStock: parseInt(body.stock?.minStock || 5)
            },
            status: body.status || 'active',
            featured: body.featured || false
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);

        // Handle duplicate reference error
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Product reference already exists' }, { status: 400 });
        }

        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
} 