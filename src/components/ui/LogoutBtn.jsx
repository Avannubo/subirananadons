"use client";
export default function LogoutBtn() {
    const handleLogout = () => {
        // Delete the entire token from cookies
        document.cookie = "token=; Max-Age=0; path=/;";
        // Optionally, redirect to the login page
        window.location.href = "/";
    };

    return (
        <p 
            onClick={handleLogout} 
            className=" cursor-pointer"
        >
            Logout
        </p>
    );
}