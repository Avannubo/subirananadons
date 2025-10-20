'use client';
import React, { forwardRef } from 'react';
const Input = forwardRef(({ className = '', ...props }, ref) => {
    return (
        <input
            ref={ref}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#36A9E1] focus:border-[#36A9E1] text-sm ${className}`}
            {...props}
        />
    );
});
Input.displayName = 'Input';
export { Input };
