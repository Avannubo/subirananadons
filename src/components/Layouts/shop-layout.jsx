import Header from "@/components/landing/header";
import Footer from "@/components/landing/footer";
export default function ShopLayout({ children }) {
    return (
        <>
            <Header />
            <div className="flex flex-col justify-center items-center w-full h-full bg-white">
                <div className="flex flex-col justify-center items-center w-full ">
                    {children}
                </div> 
            </div> 
            <Footer />
        </>
    );
}