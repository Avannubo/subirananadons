// components/SearchInput.tsx
'use client';
import { FiSearch } from 'react-icons/fi'; 
export const SearchInput = ({ placeholder, value, onChange }) => (
    <div className="relative">
        <FiSearch className="absolute left-3 top-3 text-gray-400" />
        <input
            type="text"
            placeholder={placeholder}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);