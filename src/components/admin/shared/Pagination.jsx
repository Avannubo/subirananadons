'use client';
import React from 'react';

export default function Pagination({
    currentPage = 1,
    totalPages = 1,
    totalItems = 0,
    itemsPerPage = 5,
    onPageChange,
    onItemsPerPageChange,
    showingText = "Mostrando {} de {} productos"
}) {
    // Calculate visible pages range
    const getVisiblePages = () => {
        // Always show at least current page
        const pages = [currentPage];

        // Add pages before current page
        let before = currentPage - 1;
        while (before > 0 && pages.length < 5) {
            pages.unshift(before);
            before--;
        }

        // Add pages after current page
        let after = currentPage + 1;
        while (after <= totalPages && pages.length < 5) {
            pages.push(after);
            after++;
        }

        return pages;
    };

    const visiblePages = getVisiblePages();

    // Format showing text with current values
    const formattedShowingText = showingText
        .replace('{}', Math.min(currentPage * itemsPerPage, totalItems))
        .replace('{}', totalItems);

    // Helper function to handle the items per page change
    const handleItemsPerPageChange = (value) => {
        // Check if onItemsPerPageChange is provided
        if (typeof onItemsPerPageChange === 'function') {
            // Convert to number to ensure consistency
            const numValue = Number(value);

            // Call the handler with the numeric value
            onItemsPerPageChange(numValue);
        } else {
            console.warn('onItemsPerPageChange is not a function or not provided');
        }
    };

    return (
        <div className="flex justify-between items-center flex-wrap gap-3 mt-4 mb-2">
            <div className="text-sm text-gray-600">
                {formattedShowingText}
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">Items por página:</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={500}>500</option>
                    </select>
                </div>

                <div className="flex">
                    <button
                        onClick={() => onPageChange(1)}
                        disabled={currentPage === 1}
                        className="border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                    >
                        Anterior
                    </button>

                    {visiblePages.map(page => (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`border border-gray-300 px-4 py-2 text-sm ${currentPage === page
                                ? 'bg-[#00B0C8] text-white border-[#00B0C8]'
                                : 'hover:bg-gray-50'
                                }`}
                        >
                            {page}
                        </button>
                    ))}

                    {totalPages > 5 && !visiblePages.includes(totalPages) && (
                        <>
                            <span className="border border-gray-300 px-4 py-2 text-sm">...</span>
                            <button
                                onClick={() => onPageChange(totalPages)}
                                className="border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                            >
                                {totalPages}
                            </button>
                        </>
                    )}

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        </div>
    );
} 