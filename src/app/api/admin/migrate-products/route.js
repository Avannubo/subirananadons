import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import migrateProductStockModel from '@/scripts/updateProductStockModel';

// POST /api/admin/migrate-products - Run product stock model migration
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        // Ensure only admins can run migrations
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized - Admin access required' },
                { status: 401 }
            );
        }

        // Run the migration
        const result = await migrateProductStockModel();

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Migration failed' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'Product stock model migration completed successfully',
            ...result
        });
    } catch (error) {
        console.error('Error running migration:', error);
        return NextResponse.json(
            { error: 'Failed to run migration' },
            { status: 500 }
        );
    }
} 