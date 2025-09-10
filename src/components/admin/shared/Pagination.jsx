'use client';
import React from 'react';
export default function Pagination({
    currentPage = 1,
    totalPages = 1,
    totalItems = 0,
    itemsPerPage = 2,
    onPageChange,
    onItemsPerPageChange,
    showingText = "Mostrant {} de {} productes"
}) {
    // Calculate visible pages range (improved for ellipsis and style)
    const getVisiblePages = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage, '...', totalPages);
            }
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
    // Navigation helpers for new style
    const goToPreviousPage = () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
    };
    const goToNextPage = () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1);
    };
    const goToPage = (page) => {
        if (page !== '...' && page !== currentPage) onPageChange(page);
    };
    return (
        <div className="flex flex-col items-center justify-center gap-3 mt-4 mb-2 px-4">
            <div className="text-sm text-gray-600 mb-2">{formattedShowingText}</div>
            <div className="flex justify-center mt-4">
                <nav className="flex items-center space-x-1" aria-label="Paginació">
                    {/* Previous page button */}
                    <button
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 rounded-md cursor-pointer ${currentPage === 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-100'}`}
                        aria-label="Anterior"
                    >
                        <span className="sr-only">Anterior</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                    {/* Page numbers */}
                    {visiblePages.map((page, index) => (
                        <button
                            key={index}
                            onClick={() => typeof page === 'number' ? goToPage(page) : null}
                            disabled={page === '...'}
                            className={`px-4 py-2 cursor-pointer rounded-md ${page === currentPage
                                ? 'bg-[#36A9E1] text-white'
                                : page === '...'
                                    ? 'text-gray-500'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                    {/* Next page button */}
                    <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2 cursor-pointer rounded-md ${currentPage === totalPages
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-100'}`}
                        aria-label="Següent"
                    >
                        <span className="sr-only">Següent</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                </nav>
            </div>
            <div className="flex items-center mt-2">
                <span className="text-sm text-gray-600 mr-2">Ítems per pàgina:</span>
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
        </div>
    );
}