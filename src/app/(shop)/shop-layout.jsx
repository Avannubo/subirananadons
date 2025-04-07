import Header from "@/components/landing/header.jsx";
import Footer from "@/components/landing/footer.jsx";
export default function ShopLayout({ children }) {
    return (
        <>
            <Header />
            {children} 
            <Footer />
        </>
    );
}