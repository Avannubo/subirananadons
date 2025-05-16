'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

const CartContext = createContext();

const handleApiResponse = async (response) => {
    try {
        const contentType = response.headers.get('content-type');

        // If the response is not OK, handle the error
        if (!response.ok) {
            console.error(`API error: ${response.status} ${response.statusText}`);

            // If we have JSON content, try to parse the error details
            if (contentType && contentType.includes('application/json')) {
                try {
                    const errorData = await response.json();
                    console.error('Error details:', errorData);

                    // Extract the error message or use a default message
                    const errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`;
                    throw new Error(errorMessage);
                } catch (parseError) {
                    // If JSON parsing fails, throw a generic error with status code
                    console.error('Error parsing error response:', parseError);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            } else {
                // Non-JSON error response
                const text = await response.text();
                console.error('Non-JSON error response:', text);
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }
        }

        // For successful responses, verify we have JSON and return it
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Invalid response format - expected JSON but got:', text.substring(0, 200));
            throw new Error('Server returned an invalid response format - expected JSON');
        }

        return response.json();
    } catch (error) {
        console.error('Error handling API response:', error);
        throw error; // Re-throw the error after logging
    }
};

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [cartId, setCartId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { data: session, status } = useSession();

    // Load cart data from local storage or database
    useEffect(() => {
        const loadCart = async () => {
            try {
                setIsLoading(true);
                // Always check local storage first
                const localCart = localStorage.getItem('cart');

                if (localCart) {
                    try {
                        const parsedCart = JSON.parse(localCart);
                        setCartItems(parsedCart.items || []);
                        setCartId(parsedCart.id || null);
                    } catch (error) {
                        console.error('Error parsing local cart:', error);
                        // Clear invalid cart data
                        localStorage.removeItem('cart');
                    }
                }

                // If user is authenticated, try to get their cart from the server
                if (session?.user) {
                    try {
                        const response = await fetch('/api/cart');
                        const data = await handleApiResponse(response);

                        // If server has cart data, update local state
                        if (data && data.items && data.items.length > 0) {
                            setCartItems(data.items);
                            setCartId(data._id);
                            // Also update localStorage
                            localStorage.setItem('cart', JSON.stringify({
                                items: data.items,
                                id: data._id
                            }));
                        }
                    } catch (error) {
                        console.error('Error fetching cart from server:', error);
                        // We'll continue using local cart data if server fetch fails
                    }
                }
            } catch (error) {
                console.error('Error loading cart:', error);
                toast.error('Failed to load cart');
            } finally {
                setIsLoading(false);
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

            // If user is authenticated and we have a cart ID, save to the database
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
                    console.error('Failed to update cart on server:', error);
                    // Don't show error toast here as we still have local cart data
                }
            }

            return true;
        } catch (error) {
            console.error('Error saving cart:', error);
            toast.error('Failed to save cart');
            return false;
        }
    };

    const addToCart = async (product, quantity = 1, options = {}) => {
        try {
            if (isLoading) return false;

            const { isGift, giftInfo } = options;

            // Use the dedicated add endpoint for gifts
            if (isGift && giftInfo) {
                try {
                    console.log('Adding gift to cart with data:', {
                        product,
                        quantity,
                        giftInfo
                    });

                    // Ensure we have the correct productId format
                    const productId = product.productId || product.id;

                    if (!productId) {
                        console.error('Invalid product ID:', product);
                        toast.error('Error: ID de producto inválido');
                        return false;
                    }

                    // Validate gift info before sending to API
                    if (!giftInfo.listId) {
                        console.error('Missing list ID in gift info:', giftInfo);
                        toast.error('Error: Falta información de la lista de regalo');
                        return false;
                    }

                    // Format request data
                    const requestData = {
                        productId,
                        quantity,
                        isGift,
                        giftInfo
                    };

                    console.log('Sending request to API:', requestData);

                    try {
                        const response = await fetch('/api/cart/add', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(requestData)
                        });

                        // Log response status for debugging
                        console.log(`API response status: ${response.status} ${response.statusText}`);

                        const data = await handleApiResponse(response);
                        console.log('API response data:', data);

                        if (data.success) {
                            // Update local cart
                            if (data.cart && data.cart.items) {
                                await saveCart(data.cart.items, cartId);
                                toast.success('Regalo añadido al carrito');
                                return true;
                            } else {
                                console.warn('API returned success but no cart items:', data);
                                toast.success('Regalo añadido, pero hubo un problema al actualizar el carrito');
                                return true;
                            }
                        } else {
                            console.error('API returned error:', data);
                            toast.error(data.message || 'Error al añadir el regalo');
                            return false;
                        }
                    } catch (apiError) {
                        console.error('API request failed:', apiError);
                        toast.error(`Error: ${apiError.message || 'Error al comunicar con el servidor'}`);
                        return false;
                    }
                } catch (error) {
                    console.error('Error adding gift to cart:', error);
                    toast.error(`Error al añadir el regalo: ${error.message || 'Se produjo un error desconocido'}`);
                    return false;
                }
            }

            // Regular (non-gift) product handling
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

            const result = await saveCart(newItems);
            if (result) {
                toast.success('Añadido al carrito');
            }
            return result;
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add to cart');
            return false;
        }
    };

    const removeFromCart = async (productId) => {
        try {
            if (isLoading) return;

            const newItems = cartItems.filter(item => item.id !== productId);
            const result = await saveCart(newItems);
            if (result) {
                toast.success('Eliminado del carrito');
            }
            return result;
        } catch (error) {
            console.error('Error removing from cart:', error);
            toast.error('Failed to remove from cart');
            return false;
        }
    };

    const updateQuantity = async (productId, quantity) => {
        try {
            if (isLoading) return;

            if (quantity <= 0) {
                return removeFromCart(productId);
            }

            const newItems = cartItems.map(item =>
                item.id === productId ? { ...item, quantity } : item
            );
            return await saveCart(newItems);
        } catch (error) {
            console.error('Error updating quantity:', error);
            toast.error('Failed to update quantity');
            return false;
        }
    };

    const clearCart = async () => {
        try {
            if (isLoading) return;

            localStorage.removeItem('cart');
            setCartItems([]);
            setCartId(null);

            if (session?.user && cartId) {
                try {
                    await fetch('/api/cart', {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ cartId }),
                    });
                } catch (error) {
                    console.error('Failed to delete cart from server:', error);
                }
            }

            toast.success('Carrito vaciado');
            return true;
        } catch (error) {
            console.error('Error clearing cart:', error);
            toast.error('Failed to clear cart');
            return false;
        }
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => {
            const price = parseFloat(item.priceValue || item.price || 0);
            return total + price * item.quantity;
        }, 0);
    };

    const getCartCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getCartTotal,
                getCartCount,
                isLoading
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
} 