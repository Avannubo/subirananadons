import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Product from '@/models/Product';
import dbConnect from '@/lib/dbConnect';

// Get all products or filtered products
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url); const name = searchParams.get('name');
        const reference = searchParams.get('reference');
        const category = searchParams.get('category');
        const status = searchParams.get('status');
        const brand = searchParams.get('brand');
        const lowStock = searchParams.get('lowStock');
        const search = searchParams.get('search');
        const preventSort = searchParams.get('preventSort') === 'true';
        const minPrice = parseFloat(searchParams.get('minPrice'));
        const maxPrice = parseFloat(searchParams.get('maxPrice'));

        // Pagination parameters
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 5;
        const skip = (page - 1) * limit;

        await dbConnect();

        // Build query based on search parameters
        const query = {};

        // Handle combined search term
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { reference: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } }
            ];
        } else {
            // Individual field filters
            if (name) query.name = { $regex: name, $options: 'i' };
            if (reference) query.reference = { $regex: reference, $options: 'i' };

            // Handle multiple categories separated by commas
            if (category) {
                const categoryList = category.split(',');
                if (categoryList.length > 1) {
                    // If multiple categories, use $in operator
                    query.category = { $in: categoryList.map(cat => new RegExp(cat, 'i')) };
                } else {
                    // Single category uses regex for partial matching
                    query.category = { $regex: category, $options: 'i' };
                }
            }

            if (brand) query.brand = { $regex: brand, $options: 'i' };
        } if (status) query.status = status;

        // Low stock filter
        if (lowStock === 'true') {
            // Products where available is less than minStock
            query.$expr = {
                $lt: [
                    '$stock.available',
                    { $ifNull: ['$stock.minStock', 5] }
                ]
            };
        }

        // Add price range filter
        if (!isNaN(minPrice) || !isNaN(maxPrice)) {
            query.price_incl_tax = {};
            if (!isNaN(minPrice)) {
                query.price_incl_tax.$gte = minPrice;
            }
            if (!isNaN(maxPrice)) {
                query.price_incl_tax.$lte = maxPrice;
            }
        }// Get total count for pagination
        const totalItems = await Product.countDocuments(query);

        // Build the query with optional sorting
        let productsQuery = Product.find(query);

        // Handle sort parameters
        const sortField = searchParams.get('sort');
        const sortOrder = searchParams.get('order');

        if (sortField && sortOrder) {
            // Create sort object based on the sort field and order
            const sortObj = {};
            sortObj[sortField] = sortOrder === 'asc' ? 1 : -1;
            productsQuery = productsQuery.sort(sortObj);
        } else if (!preventSort) {
            // Default sort by updatedAt if no specific sort is requested
            productsQuery = productsQuery.sort({ updatedAt: -1 });
        }

        // Apply pagination
        productsQuery = productsQuery.skip(skip).limit(limit);

        // Execute the query
        const products = await productsQuery;

        // Calculate pagination info
        const totalPages = Math.ceil(totalItems / limit);

        return NextResponse.json({
            products,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                limit
            }
        });
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
            categoryId: body.categoryId || '',
            brand: body.brand || '',
            brandId: body.brandId || '',
            price_excl_tax: parseFloat(body.price_excl_tax),
            price_incl_tax: parseFloat(body.price_incl_tax),
            image: body.image || '/assets/images/Screenshot_4.png',
            imageHover: body.imageHover || '',
            additionalImages: body.additionalImages || [],
            stock: {
                available: parseInt(body.stock?.available || 0),
                minStock: parseInt(body.stock?.minStock || 5)
            },
            status: body.status || 'active',
            featured: body.featured || false,
            stockHistory: [{
                date: new Date(),
                type: 'initial',
                available: parseInt(body.stock?.available || 0),
                minStock: parseInt(body.stock?.minStock || 5),
                userId: session.user.id,
                userName: session.user.name || 'Admin user'
            }]
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