'use client';

export default function PageContainer({ children, title, actionButton }) {
    return (
        <div className="py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{title}</h1>
                {actionButton && actionButton}
            </div>
            {children}
        </div>
    );
} 