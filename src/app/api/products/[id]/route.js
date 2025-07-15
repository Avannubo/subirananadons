import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Product from '@/models/Product';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

// Get a specific product by ID
export async function GET(request, { params }) {
    try {
        const { id } = params;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
        }

        await dbConnect();

        const product = await Product.findById(id)
            .populate('category')
            .populate('brand');

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}

// Update a product by ID
export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is admin
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
        }

        const { id } = params;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
        }

        await dbConnect();

        const body = await request.json();

        // Find the product first
        const product = await Product.findById(id);

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }


        // Update product fields
        if (body.name) product.name = body.name;
        if (body.reference !== undefined) product.reference = body.reference;
        if (body.description !== undefined) product.description = body.description;


        // Always set category and brand, accepting ObjectId, $oid, or string
        const getValidObjectId = (val) => {
            if (!val) return null;
            // If MongoDB export object { $oid: ... }
            if (typeof val === 'object' && val.$oid) {
                return mongoose.Types.ObjectId.isValid(val.$oid) ? val.$oid : null;
            }
            // If object with es/ca/name (should not be used for ObjectId fields)
            if (typeof val === 'object' && (val.es || val.ca || val.name)) {
                // Try to use es or ca if they look like ObjectId
                if (val.es && mongoose.Types.ObjectId.isValid(val.es)) return val.es;
                if (val.ca && mongoose.Types.ObjectId.isValid(val.ca)) return val.ca;
                // Otherwise, fallback to null
                return null;
            }
            // If string
            if (typeof val === 'string' && mongoose.Types.ObjectId.isValid(val)) {
                return val;
            }
            // If object with toString
            if (typeof val === 'object' && val.toString) {
                const str = val.toString();
                return mongoose.Types.ObjectId.isValid(str) ? str : null;
            }
            return null;
        };

        const newCategory = getValidObjectId(body.category);
        if (newCategory) product.category = newCategory;
        // If not valid, do not overwrite (prevents nulling on edit)

        const newBrand = getValidObjectId(body.brand);
        if (newBrand) product.brand = newBrand;
        // If not valid, do not overwrite

        if (body.price_excl_tax !== undefined) product.price_excl_tax = parseFloat(body.price_excl_tax);
        if (body.price_incl_tax !== undefined) product.price_incl_tax = parseFloat(body.price_incl_tax);
        if (body.image) product.image = body.image;
        if (body.imageHover !== undefined) product.imageHover = body.imageHover;
        if (body.additionalImages !== undefined) product.additionalImages = body.additionalImages;

        // Update stock if provided
        if (body.stock) {
            if (body.stock.available !== undefined) product.stock.available = parseInt(body.stock.available);
            if (body.stock.minStock !== undefined) product.stock.minStock = parseInt(body.stock.minStock);
        }

        if (body.status) product.status = body.status;
        if (body.featured !== undefined) product.featured = body.featured;

        // Save the updated product
        const updatedProduct = await product.save();

        // Populate category and brand before returning
        // Fix: Use correct model names for population (should match Mongoose model registration)
        const populatedProduct = await Product.findById(updatedProduct._id)
            .populate('category')
            .populate('brand');

        return NextResponse.json(populatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);

        // Handle duplicate reference error
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Product reference already exists' }, { status: 400 });
        }

        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

// Delete a product by ID
export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is admin
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
        }

        const { id } = params;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
        }

        await dbConnect();

        const product = await Product.findById(id);

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Check if product is referenced in other collections
        // For a complete implementation, you might want to check Orders, BirthLists, etc.
        // to ensure the product is not in use before deleting

        await Product.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
} 