import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Brand from '@/models/Brand';
import Product from '@/models/Product';
export async function PUT(request, { params }) {
    try {
        await dbConnect(); 
        const { id } = params;
        const data = await request.json();
        // Update brand with new discount
        const brand = await Brand.findByIdAndUpdate(
            id,
            {
                discount: data.discount,
                updatedAt: new Date()
            },
            { new: true }
        );
        if (!brand) {
            return NextResponse.json({ success: false, message: "Brand not found" }, { status: 404 });
        }
        // If discount is active, apply it to all products of this brand
        if (data.discount.active) {
            const excludedProductIds = data.discount.excludedProducts || [];
            // Update all products of this brand that aren't in the excluded list
            await Product.updateMany(
                {
                    brandId: id,
                    _id: { $nin: excludedProductIds }
                },
                {
                    discount: {
                        active: data.discount.active,
                        type: data.discount.type,
                        value: data.discount.value,
                        startDate: data.discount.startDate,
                        endDate: data.discount.endDate,
                        minPurchaseAmount: data.discount.minPurchaseAmount,
                        minQuantity: data.discount.minQuantity
                    },
                    updatedAt: new Date()
                }
            );
        } else {
            // If discount is deactivated, remove discount from all brand products
            await Product.updateMany(
                { brandId: id },
                {
                    $unset: { discount: "" },
                    updatedAt: new Date()
                }
            );
        }
        return NextResponse.json({
            success: true,
            data: brand
        });
    } catch (error) {
        console.error('Error updating brand discount:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const { id } = params;
        // Remove discount from brand
        const brand = await Brand.findByIdAndUpdate(
            id,
            {
                $unset: { discount: "" },
                updatedAt: new Date()
            },
            { new: true }
        );
        if (!brand) {
            return NextResponse.json({ success: false, message: "Brand not found" }, { status: 404 });
        }
        // Remove discount from all products of this brand
        await Product.updateMany(
            { brandId: id },
            {
                $unset: { discount: "" },
                updatedAt: new Date()
            }
        );
        return NextResponse.json({
            success: true,
            data: brand
        });
    } catch (error) {
        console.error('Error removing brand discount:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
