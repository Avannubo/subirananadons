'use client';

export default function LoadingSpinner({ size = 'md', color = '[#00B0C8]' }) {
    const sizeClasses = {
        sm: 'h-6 w-6',
        md: 'h-10 w-10',
        lg: 'h-16 w-16'
    };

    return (
        <div className="flex justify-center items-center py-8">
            <div className={`animate-spin rounded-full ${sizeClasses[size]} border-t-2 border-b-2 border-${color}`}></div>
        </div>
    );
}