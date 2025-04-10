'use client';

import React, { forwardRef } from 'react';

const Input = forwardRef(({ className = '', ...props }, ref) => {
    return (
        <input
            ref={ref}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00B0C8] focus:border-[#00B0C8] text-sm ${className}`}
            {...props}
        />
    );
});

Input.displayName = 'Input';

export { Input };
