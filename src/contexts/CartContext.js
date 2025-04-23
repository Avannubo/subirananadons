'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

const CartContext = createContext();

const handleApiResponse = async (response) => {
    const contentType = response.headers.get('content-type');
    if (!response.ok) {
        if (contentType && contentType.includes('application/json')) {
            const error = await response.json();
            throw new Error(error.message || 'An error occurred');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format');
    }
    return response.json();
};

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [cartId, setCartId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { data: session, status } = useSession();

    // Load cart data on mount and when session changes
    useEffect(() => {
        const loadCart = async () => {
            try {
                if (status === 'loading') return;

                if (session?.user) {
                    // If user is logged in, try to fetch cart from database
                    // Commenting out the toast in loadCart function
                    /*
                    try {
                        const response = await fetch('/api/cart');
                        const cart = await handleApiResponse(response);
                        setCartItems(cart.items || []);
                        setCartId(cart._id);
                        // Update localStorage with the latest data
                        localStorage.setItem('cart', JSON.stringify({
                            items: cart.items || [],
                            id: cart._id
                        }));
                        setIsLoading(false);
                        return;
                    } catch (error) {
                        console.error('Error fetching cart:', error);
                        toast.error('Failed to load cart from server');
                    }
                    */
                }

                // If not logged in or failed to fetch, load from localStorage
                const savedCart = localStorage.getItem('cart');
                if (savedCart) {
                    const { items, id } = JSON.parse(savedCart);
                    setCartItems(items || []);
                    setCartId(id);
                }
                setIsLoading(false);
            } catch (error) {
                console.error('Error loading cart:', error);
                setIsLoading(false);
                toast.error('Failed to load cart');
            }
        };

        loadCart();
    }, [session, status]);

    const saveCart = async (items, id = cartId) => {
        try {
            // Always save to localStorage
            localStorage.setItem('cart', JSON.stringify({ items, id }));
            setCartItems(items);
            setCartId(id);

            // Commenting out the database saving logic
            /*
            if (session?.user && id) {
                try {
                    const response = await fetch('/api/cart', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ items, cartId: id }),
                    });
                    await handleApiResponse(response);
                } catch (error) {
                    console.error('Failed to update cart:', error);
                    toast.error('Failed to save cart to server');
                    return false;
                }
            }
            */

            return true;
        } catch (error) {
            console.error('Error saving cart:', error);
            toast.error('Failed to save cart');
            return false;
        }
    };

    const addToCart = async (product, quantity = 1) => {
        try {
            if (isLoading) return;

            const existingItem = cartItems.find(item => item.id === product.id);
            let newItems;

            if (existingItem) {
                newItems = cartItems.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                newItems = [...cartItems, { ...product, quantity }];
            }

            // Commenting out the database creation logic
            /*
            if (session?.user && !cartId) {
                try {
                    const response = await fetch('/api/cart', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ items: newItems }),
                    });
                    const data = await handleApiResponse(response);
                    const result = await saveCart(newItems, data.id);
                    if (result) {
                        toast.success('Added to cart');
                    }
                    return result;
                } catch (error) {
                    console.error('Error creating cart:', error);
                    toast.error('Failed to create cart on server');
                    // Still save to localStorage even if DB fails
                    await saveCart(newItems);
                    toast.success('Added to cart (local only)');
                    return true;
                }
            }
            */

            const result = await saveCart(newItems);
            /*if (result) {
                toast.success('Añadido al carrito');
            }*/
            return result;
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add to cart');
            return false;
        }
    };

    const updateQuantity = async (productId, newQuantity) => {
        if (newQuantity < 1 || isLoading) return false;

        try {
            const newItems = cartItems.map(item =>
                item.id === productId ? { ...item, quantity: newQuantity } : item
            );

            const result = await saveCart(newItems);
            // Commenting out the toast in updateQuantity function
            /*
            if (result) {
                toast.success('Cart updated');
            }
            */
            return result;
        } catch (error) {
            console.error('Error updating quantity:', error);
            toast.error('Failed to update quantity');
            return false;
        }
    };

    const removeItem = async (productId) => {
        if (isLoading) return false;

        try {
            const newItems = cartItems.filter(item => item.id !== productId);
            const result = await saveCart(newItems);
            // Commenting out the toast in removeItem function
            /*
            if (result) {
                toast.success('Item removed from cart');
            }
            */
            return result;
        } catch (error) {
            console.error('Error removing item:', error);
            toast.error('Failed to remove item');
            return false;
        }
    };

    const clearCart = async () => {
        if (isLoading) return false;

        try {
            // Commenting out the database deletion logic
            /*
            if (session?.user && cartId) {
                try {
                    const response = await fetch('/api/cart', {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ cartId }),
                    });
                    await handleApiResponse(response);
                } catch (error) {
                    console.error('Failed to delete cart:', error);
                    toast.error('Failed to clear cart on server');
                }
            }
            */

            // Removed database deletion logic
            localStorage.removeItem('cart');
            setCartItems([]);
            setCartId(null);
            toast.success('Cart cleared');
            return true;
        } catch (error) {
            console.error('Error clearing cart:', error);
            toast.error('Failed to clear cart');
            return false;
        }
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            cartId,
            isLoading,
            addToCart,
            updateQuantity,
            removeItem,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
} 