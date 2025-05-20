import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/landing/header';
export default function AdminLayout({ children }) {
    return (
        <div className="flex flex-col ">
            <Header />
            <div className="flex flex-1 bg-gray-100">
                <div className="sticky top-0 shadow-md pt-[100px] bg-white">
                    <Sidebar />
                </div>
                <div className="flex-1  pt-28 px-8 pb-8">
                    <div className="max-w-[1400px] mx-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}