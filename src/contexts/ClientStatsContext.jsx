'use client';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
const ClientStatsContext = createContext();
export function ClientStatsProvider({ children, refreshInterval = 30000 }) {
}
// Custom hook to use the client stats context
export function useClientStats() {
    const context = useContext(ClientStatsContext); 
    return context;
} 