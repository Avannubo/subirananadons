'use client';
// Add this after other imports
import { toast } from 'react-hot-toast';

// Add this button somewhere in your JSX
<button
    onClick={async () => {
        const toastId = toast.loading('Running stock migration...');
        try {
            const response = await fetch('/api/admin/migrate-products', {
                method: 'GET',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                toast.success(`Migration complete: ${data.message}`, { id: toastId });
                console.log('Migration results:', data.results);
            } else {
                toast.error(`Migration failed: ${data.error}`, { id: toastId });
            }
        } catch (error) {
            toast.error(`Error: ${error.message}`, { id: toastId });
        }
    }}
    className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
>
    Migrate Product Stock
</button> 