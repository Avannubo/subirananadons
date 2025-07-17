import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Product from '@/models/Product';
import '@/models/Brand';
import '@/models/Category';
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
        let limit = parseInt(searchParams.get('limit')) || 5;
        let skip = (page - 1) * limit;

        await dbConnect();

        // Build query based on search parameters
        const query = {};

        // Handle combined search term
        if (search) {
            query.$or = [
                { 'name.es': { $regex: search, $options: 'i' } },
                { 'name.ca': { $regex: search, $options: 'i' } },
                { reference: { $regex: search, $options: 'i' } }
                // Optionally add category/brand name search if needed, but not brand ObjectId
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

            if (brand) {
                // If brand is a valid ObjectId, match exactly, else fallback to regex (for legacy)
                const isObjectId = /^[a-f\d]{24}$/i.test(brand);
                if (isObjectId) {
                    query.brand = brand;
                } else {
                    query.brand = { $regex: brand, $options: 'i' };
                }
            }
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
        const sortOrderParam = searchParams.get('order');

        if (sortField) {
            // Support explicit sort field and order
            let order = -1; // default to descending
            if (sortOrderParam === 'asc') order = 1;
            if (sortOrderParam === 'desc') order = -1;
            // If sortField is 'newest' or 'createdAt', always sort by createdAt desc
            if (sortField === 'newest' || sortField === 'createdAt') {
                productsQuery = productsQuery.sort({ createdAt: -1 });
            } else if (sortField === 'oldest') {
                productsQuery = productsQuery.sort({ createdAt: 1 });
            } else if (sortField === 'lastmodified' || sortField === 'updatedAt') {
                productsQuery = productsQuery.sort({ updatedAt: -1 });
            } else if (sortField === 'az') {
                productsQuery = productsQuery.sort({ name: 1 });
            } else if (sortField === 'za') {
                productsQuery = productsQuery.sort({ name: -1 });
            } else {
                // Generic field
                const sortObj = {};
                sortObj[sortField] = order;
                productsQuery = productsQuery.sort(sortObj);
            }
        } else if (!preventSort) {
            // Default: sort by createdAt descending (newest first)
            productsQuery = productsQuery.sort({ createdAt: -1 });
        }

        // If searching, remove limit to return all matches
        if (search && search.trim() !== '') {
            productsQuery = productsQuery;
            skip = 0;
            limit = 0;
        } else {
            productsQuery = productsQuery.skip(skip).limit(limit);
        }

        // Populate brand and category fields
        const products = await productsQuery.populate('brand').populate('category');

        // Map products to include brand and category names
        const productsWithNames = products.map(product => {
            // Convert to plain object if needed
            const prod = product.toObject ? product.toObject() : product;
            return {
                ...prod,
                brand: prod.brand && typeof prod.brand === 'object' && prod.brand !== null ? (prod.brand.name || prod.brand) : prod.brand,
                category: prod.category && typeof prod.category === 'object' && prod.category !== null ? (prod.category.name || prod.category) : prod.category
            };
        });

        // Calculate pagination info
        let totalPages = 1;
        if (!search || search.trim() === '') {
            totalPages = Math.ceil(totalItems / (limit || 1));
        }

        return NextResponse.json({
            products: productsWithNames,
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

        // Fix: Ensure category and brand are ObjectId or string, not object
        let categoryValue = body.category;
        if (categoryValue && typeof categoryValue === 'object' && categoryValue._id) {
            categoryValue = categoryValue._id;
        }
        if (categoryValue && typeof categoryValue === 'object' && categoryValue.es) {
            // Sometimes category is { es: '...', ca: '' }
            categoryValue = categoryValue.es || categoryValue.ca || '';
        }
        if (categoryValue && typeof categoryValue === 'object') {
            // Fallback: try toString
            if (categoryValue.toString) categoryValue = categoryValue.toString();
        }
        if (!categoryValue || typeof categoryValue !== 'string') categoryValue = '';

        let brandValue = body.brand;
        if (brandValue && typeof brandValue === 'object' && brandValue._id) {
            brandValue = brandValue._id;
        }
        if (brandValue && typeof brandValue === 'object' && brandValue.name) {
            brandValue = brandValue.name;
        }
        if (brandValue && typeof brandValue === 'object') {
            if (brandValue.toString) brandValue = brandValue.toString();
        }
        if (!brandValue || typeof brandValue !== 'string') brandValue = '';

        const product = await Product.create({
            name: body.name,
            reference: body.reference || '',
            description: body.description || '',
            category: categoryValue,
            categoryId: body.categoryId || '',
            brand: brandValue,
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