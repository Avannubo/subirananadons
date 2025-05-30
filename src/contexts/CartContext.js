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
    const { data: session, status } = useSession();    // Initialize gift notes from cart items
    useEffect(() => {
        if (!isLoading && cartItems.length > 0) {
            const initialNotes = cartItems.reduce((acc, item) => {
                if (item.isGift && item.giftInfo?.note) {
                    acc[item.id] = item.giftInfo.note;
                }
                return acc;
            }, {});
            if (Object.keys(initialNotes).length > 0) {
                localStorage.setItem('giftNotes', JSON.stringify(initialNotes));
            }
        }
    }, [cartItems, isLoading]);

    // Load cart data from local storage or database
    useEffect(() => {
        const loadCart = async () => {
            try {
                setIsLoading(true);                // Always check local storage first
                const localCart = localStorage.getItem('cart');
                if (localCart) {
                    try {
                        const parsedCart = JSON.parse(localCart);
                        const MAX_CART_AGE = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
                        // Only use local cart data if it's less than 24 hours old
                        if (parsedCart.timestamp && (Date.now() - parsedCart.timestamp) < MAX_CART_AGE) {
                            // Validate each item has required fields and validate their values
                            const validItems = (parsedCart.items || []).filter(item => {
                                const isValid = item &&
                                    item.id &&
                                    item.name &&
                                    (item.price || item.priceValue) &&
                                    typeof item.quantity === 'number' &&
                                    item.quantity > 0;
                                // Log invalid items for debugging
                                if (!isValid) {
                                    console.warn('Invalid cart item:', item);
                                }
                                return isValid;
                            });
                            // Only update state if we have valid items
                            if (validItems.length > 0) {
                                setCartItems(validItems);
                                setCartId(parsedCart.id || null);
                            } else {
                                console.log('No valid items in cart, clearing local storage');
                                localStorage.removeItem('cart');
                            }
                        } else {
                            console.log('Cart data expired or invalid, clearing local storage');
                            localStorage.removeItem('cart');
                        }
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
    }, [session, status]);    // Debounced save to prevent too frequent localStorage updates
    let saveTimeout;
    const saveCart = async (items, id = cartId) => {
        try {
            // Clear any pending save
            if (saveTimeout) clearTimeout(saveTimeout);
            // Update state immediately
            setCartItems(items);
            setCartId(id);
            // Debounce localStorage save
            saveTimeout = setTimeout(() => {
                try {
                    localStorage.setItem('cart', JSON.stringify({
                        items,
                        id,
                        timestamp: Date.now() // Add timestamp for validation
                    }));
                } catch (error) {
                    console.error('Error saving to localStorage:', error);
                }
            }, 500); // 500ms debounce
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
            const { isGift, giftInfo, note } = options;

            // Use the dedicated add endpoint for gifts
            if (isGift && giftInfo) {
                try {
                    console.log('Adding gift to cart with data:', {
                        product,
                        quantity: 1, // Force quantity to 1 for gifts
                        giftInfo,
                        note
                    });

                    // Ensure we have the correct productId format and note is passed
                    const requestData = {
                        productId: product.productId || product.id,
                        quantity: 1,
                        isGift: true,
                        giftInfo: {
                            ...giftInfo,
                            note: note || '',
                            listId: giftInfo.listId.toString(),
                            listOwnerId: giftInfo.listOwnerId.toString(),
                            addedAt: Date.now()
                        }
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
                            // Validate and update local cart with gift item
                            if (data.cart?.items) {                                // Ensure each item is properly formatted in the cart
                                const validatedItems = data.cart.items.map(item => ({
                                    ...item,
                                    id: item.isGift ? `${item.product}-${Date.now()}` : (item.id || item.productId), // Unique ID for gift items
                                    isGift: item.isGift === undefined ? true : item.isGift,
                                    giftInfo: item.giftInfo || giftInfo,
                                    quantity: Math.max(1, parseInt(item.quantity) || 1),
                                    updatedAt: Date.now()
                                }));
                                await saveCart(validatedItems, data.cart._id || cartId);
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
            }            // Regular (non-gift) product handling
            const productId = product.productId || product.id;
            const existingItem = cartItems.find(item => (item.id === productId || item.productId === productId));
            let newItems;
            if (existingItem) {
                newItems = cartItems.map(item =>
                    item.id === product.id
                        ? {
                            ...item,
                            quantity: item.quantity + quantity,
                            // Always ensure we have the latest product data
                            name: product.name || item.name,
                            price: product.price || item.price,
                            priceValue: product.priceValue || product.price || item.priceValue,
                            image: product.image || product.imageUrl || item.image,
                            brand: product.brand || item.brand,
                            category: product.category || item.category
                        }
                        : item
                );
            } else {                // Validate required product data
                if (!product.id || !product.name || !(product.price || product.priceValue)) {
                    console.error('Invalid product data:', product);
                    toast.error('Error: Datos del producto inválidos');
                    return false;
                }
                // Make sure we store all necessary product data with proper validation and defaults
                const cartItem = {
                    id: product.id,
                    name: product.name.trim(),
                    price: parseFloat(product.price) || 0,
                    priceValue: parseFloat(product.priceValue || product.price) || 0,
                    image: product.image || product.imageUrl || '',
                    brand: (product.brand || '').trim(),
                    category: (product.category || '').trim(),
                    quantity: Math.max(1, parseInt(quantity) || 1),
                    isGift: Boolean(product.isGift),
                    giftInfo: product.giftInfo || null,
                    listOwner: product.listOwner || null,
                    updatedAt: Date.now() // Track when the item was last updated
                };
                newItems = [...cartItems, cartItem];
            }
            const result = await saveCart(newItems);
            if (result) {
                // toast.success('Añadido al carrito');
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
                //toast.success('Eliminado del carrito');
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

            // Get the item
            const item = cartItems.find(i => i.id === productId);

            // Prevent quantity changes for gift items
            if (item && item.isGift) {
                toast.error('No se puede modificar la cantidad de un regalo');
                return false;
            }

            if (quantity <= 0) {
                return removeFromCart(productId);
            }

            const newItems = cartItems.map(item =>
                item.id === productId ? { ...item, quantity } : item
            );
            return await saveCart(newItems);
        } catch (error) {
            console.error('Error updating quantity:', error);
            toast.error('Error al actualizar la cantidad');
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
    const updateGiftNote = async (itemId, note) => {
        try {
            if (isLoading) return false;

            // Find the gift item
            const item = cartItems.find(i => i.id === itemId);
            if (!item || !item.isGift) {
                console.error('Item not found or not a gift item');
                return false;
            }

            // Update the gift note in the item
            const newItems = cartItems.map(item =>
                item.id === itemId ? {
                    ...item,
                    giftInfo: {
                        ...item.giftInfo,
                        note
                    }
                } : item
            );

            // Save to local state and server
            return await saveCart(newItems);
        } catch (error) {
            console.error('Error updating gift note:', error);
            return false;
        }
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
                isLoading,
                updateGiftNote
            }}
        >
            {children}
        </CartContext.Provider>
    );
}
export function useCart() {
    return useContext(CartContext);
}