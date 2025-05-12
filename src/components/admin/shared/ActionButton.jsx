'use client';

export default function ActionButton({ onClick, text, icon, isLoading, variant = 'primary', className = '' }) {
    const baseClasses = "flex items-center px-5 py-3 rounded-md transition-colors shadow-md font-medium";

    const variantClasses = {
        primary: "bg-[#00B0C8] text-white hover:bg-[#008da0]",
        secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
        danger: "bg-red-600 text-white hover:bg-red-700",
        success: "bg-green-600 text-white hover:bg-green-700"
    };

    return (
        <button
            onClick={onClick}
            disabled={isLoading}
            className={`${baseClasses} ${variantClasses[variant]} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
        >
            {isLoading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : icon ? (
                <span className="mr-2">{icon}</span>
            ) : null}
            {text}
        </button>
    );
} 