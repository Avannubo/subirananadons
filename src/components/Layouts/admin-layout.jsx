import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/landing/header';

export default function AdminLayout({ children }) {
    return (
        <div className="flex flex-col">
            <Header />
            <div className="flex flex-1">
                <div className="sticky top-0 shadow-md pt-[100px]">
                    <Sidebar />
                </div>
                <div className="flex-1 bg-gray-100 pt-28 p-14">
                    {children}
                </div>
            </div>
        </div>
    );
}