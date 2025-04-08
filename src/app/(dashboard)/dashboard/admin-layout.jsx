import React from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { auth } from "@/auth";

export default async function AdminLayout({ children }) {
    const session = await auth();
    if (!session) redirect("/");

    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex flex-1 flex-col">
                <Header />
                <div className="flex-1 p-5 bg-gray-100">
                    {children}
                </div>
            </div>
        </div>
    );
};