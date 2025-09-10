'use client';
import { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { usePathname } from 'next/navigation';
import { DiscountService } from '@/services/DiscountService';
const CHECK_INTERVAL = 60000; // Check every minute
export default function DiscountTaskManager() {
    const intervalRef = useRef(null);
    const pathname = usePathname();
    const checkAndUpdateDiscounts = async () => {
        try {
            const result = await DiscountService.updateProductDiscounts();
            if (result.updated > 0 && pathname === '/dashboard/productos') {
                toast.success(`Updated ${result.updated} product discount(s)`);
            }
        } catch (error) {
            console.error('Error checking discounts:', error);
            // Don't show error toast to avoid spamming users
        }
    };
    useEffect(() => {
        // Initial check
        checkAndUpdateDiscounts();
        // Set up periodic checks
        intervalRef.current = setInterval(checkAndUpdateDiscounts, CHECK_INTERVAL);
        // Cleanup
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);
    // This component doesn't render anything
    return null;
}
