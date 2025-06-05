'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import PropTypes from 'prop-types';

// Export the context so it can be used by TypeScript for type checking
export const CartContext = createContext();

CartProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export function CartProvider({ children }) {
    const [cart, setCart] = useState({
        items: [],
        total: 0,
        count: 0,
        loading: true,
        generalNote: ''
    });

    // Helper functions
    const calculateTotal = useCallback((items) => {
        return items.reduce((sum, item) => {
            const price = typeof item.priceValue === 'number' ? item.priceValue :
                typeof item.price === 'number' ? item.price :
                    parseFloat(String(item.price || "0").replace(/[^\d.,]/g, '').replace(',', '.'));
            return sum + (price * item.quantity);
        }, 0);
    }, []);

    const calculateCount = useCallback((items) => {
        return items.reduce((count, item) => count + item.quantity, 0);
    }, []);

    // Helper function to clear all cart data from localStorage
    const clearLocalCartData = useCallback(() => {
        localStorage.removeItem('cart');
        localStorage.removeItem('cartTimestamp');
    }, []);

    // Fetch cart data from localStorage
    const fetchCart = useCallback(async (showToast = false) => {
        try {
            setCart(prev => ({ ...prev, loading: true }));            // Get cart from localStorage
            const localCart = localStorage.getItem('cart');
            let cartItems = []; let generalNote = '';
            if (localCart) {
                try {
                    const parsed = JSON.parse(localCart);
                    // Check if cart has items
                    if (parsed?.items && Array.isArray(parsed.items)) {
                        // Check timestamp if it exists (24 hours)
                        if (!parsed.timestamp || (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000)) {
                            cartItems = parsed.items;
                            generalNote = parsed.generalNote || '';
                        } else {
                            // Clear expired cart data
                            clearLocalCartData();
                        }
                    }
                } catch (error) {
                    console.error('Error parsing local cart:', error);
                    clearLocalCartData();
                }
            }

            setCart({
                items: cartItems,
                total: calculateTotal(cartItems),
                count: calculateCount(cartItems),
                loading: false,
                generalNote
            });

            if (showToast) {
                toast.success('Carrito actualizado');
            }

            return true;
        } catch (error) {
            console.error('Error fetching cart:', error);
            setCart(prev => ({ ...prev, loading: false }));
            if (showToast) {
                toast.error('Error al actualizar el carrito');
            }
            return false;
        }
    }, [calculateTotal, calculateCount, clearLocalCartData]);

    // Initialize cart
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // Add to cart
    const addToCart = useCallback(async (product, quantity = 1) => {
        try {
            if (cart.loading) return false;

            const { items } = cart;

            // Ensure product has all required fields
            if (!product.id && !product._id) {
                throw new Error('Product ID is required');
            }

            // Validate gift type products have listInfo
            if (product.type === 'gift' && !product.listInfo) {
                throw new Error('List information is required for gift items');
            }

            const productData = {
                id: product.id || product._id,
                name: product.name,
                price: product.price,
                priceValue: product.priceValue || product.price,
                image: product.image || product.imageUrl,
                brand: product.brand || '',
                category: product.category || '',
                quantity: Math.max(1, parseInt(quantity)),
                type: product.type || 'regular',
                listInfo: product.type === 'gift' ? {
                    ...product.listInfo,
                    updatedAt: new Date().toISOString(),
                } : null,
                updatedAt: Date.now()
            };            // Check if the product already exists in cart
            const existingItemIndex = items.findIndex(item =>
                item.id === productData.id && item.type === productData.type
            );

            // For gift products, prevent adding if it already exists
            if (productData.type === 'gift' && existingItemIndex > -1) {
                toast.error('Este producto de regalo ya está en el carrito');
                return false;
            }            // Get current cart from localStorage to ensure we have the latest data
            const currentCart = localStorage.getItem('cart');
            let currentItems = [];

            try {
                if (currentCart) {
                    const parsed = JSON.parse(currentCart);
                    if (parsed?.items && Array.isArray(parsed.items)) {
                        currentItems = parsed.items;
                    }
                }
            } catch (error) {
                console.error('Error parsing current cart:', error);
            }

            // Find existing item in the current cart items
            const existingItemInCurrent = currentItems.findIndex(item =>
                item.id === productData.id && item.type === productData.type
            );

            let updatedItems;
            if (existingItemInCurrent > -1 && productData.type === 'regular') {
                // Update existing regular item quantity
                updatedItems = currentItems.map((item, index) =>
                    index === existingItemInCurrent
                        ? { ...item, quantity: item.quantity + productData.quantity }
                        : item
                );
            } else {
                // Add as new item while preserving existing items
                updatedItems = [...currentItems];
                if (existingItemInCurrent === -1) { // Only add if not exists
                    updatedItems.push(productData);
                }
            }

            // Update local storage with timestamp           
            localStorage.setItem('cart', JSON.stringify({
                items: updatedItems,
                timestamp: Date.now(),
                generalNote: cart.generalNote
            }));

            // Update state
            setCart(prev => ({
                ...prev,
                items: updatedItems,
                total: calculateTotal(updatedItems),
                count: calculateCount(updatedItems),
            }));

            toast.success('Producto añadido al carrito');
            return true;
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Error al añadir al carrito');
            return false;
        }
    }, [cart, calculateTotal, calculateCount]);

    // Remove from cart    
    const removeFromCart = useCallback(async (productId, itemIndex) => {
        try {
            if (cart.loading) return false;
            // Remove specific item if index is provided, otherwise remove all items with the productId
            const updatedItems = itemIndex !== undefined
                ? cart.items.filter((_, index) => index !== itemIndex)
                : cart.items.filter(item => item.id !== productId);
            // If cart becomes empty, clear it completely
            if (updatedItems.length === 0) {
                localStorage.removeItem('cart');
                localStorage.removeItem('cartTimestamp');
                setCart({
                    items: [],
                    total: 0,
                    count: 0,
                    loading: false,
                    generalNote: ''
                });
                toast.success('Carrito vaciado');
                return true;
            }

            // Update local storage with timestamp in the same object
            localStorage.setItem('cart', JSON.stringify({
                items: updatedItems,
                timestamp: Date.now()
            }));

            // Update state
            setCart(prev => ({
                ...prev,
                items: updatedItems,
                total: calculateTotal(updatedItems),
                count: calculateCount(updatedItems)
            }));
            toast.success('Producto eliminado del carrito');
            return true;
         // Closing brace for the try block
    } catch (error) {
        console.error('Error removing from cart:', error);
        toast.error('Error al eliminar del carrito');
        return false;
    }
}, [cart, calculateTotal, calculateCount]);

// Update quantity

const updateQuantity = useCallback(async (productId, quantity) => {
    try {
        if (cart.loading) return false;

        const updatedItems = cart.items.map(item =>
            item.id === productId
                ? { ...item, quantity: Math.max(1, parseInt(quantity)) }
                : item
        );

        // Update local storage
        localStorage.setItem('cart', JSON.stringify({
            items: updatedItems,
            timestamp: Date.now()
        }));

        // Update state
        setCart(prev => ({
            ...prev,
            items: updatedItems,
            total: calculateTotal(updatedItems),
            count: calculateCount(updatedItems)
        })); toast.success('Cantidad actualizada');
        return true;
    } catch (error) {
        console.error('Error updating quantity:', error); toast.error('Error al actualizar la cantidad');
        return false;
    }
}, [cart, calculateTotal, calculateCount]);    // Clear cart
const clearCart = useCallback(async () => {
    try {
        if (cart.loading) return false;

        // Clear all cart data from localStorage
        clearLocalCartData();

        // Reset state completely
        setCart({
            items: [],
            total: 0,
            count: 0,
            loading: false,
            generalNote: ''
        });

        toast.success('Carrito vaciado');
        return true;
    } catch (error) {
        console.error('Error clearing cart:', error);
        toast.error('Error al vaciar el carrito');
        return false;
    }
}, [cart.loading, clearLocalCartData]);

// Update gift note
const updateItemNote = useCallback(async (itemId, note) => {
    try {
        if (cart.loading) return false;

        const updatedItems = cart.items.map(item =>
            item.id === itemId
                ? {
                    ...item,
                    listInfo: {
                        ...(item.listInfo || {}),
                        note
                    }
                }
                : item
        );

        // Update local storage
        localStorage.setItem('cart', JSON.stringify({
            items: updatedItems,
            timestamp: Date.now()
        }));

        // Update state
        setCart(prev => ({
            ...prev,
            items: updatedItems
        })); toast.success('Nota actualizada');
        return true;
    } catch (error) {
        console.error('Error updating note:', error); toast.error('Error al actualizar la nota');
        return false;
    }
}, [cart]);

// Update general note for all cart items
const updateGeneralNote = useCallback(async (note) => {
    try {
        if (cart.loading) return false;

        // Update cart state with new note
        const updatedCart = {
            ...cart,
            generalNote: note
        };

        // Update local storage with all cart data
        localStorage.setItem('cart', JSON.stringify({
            items: cart.items,
            timestamp: Date.now(),
            generalNote: note
        }));

        // Update state
        setCart(updatedCart);
        toast.success('Nota general actualizada');
        return true;
    } catch (error) {
        console.error('Error updating general note:', error);
        toast.error('Error al actualizar la nota general');
        return false;
    }
}, [cart]);

// Helper function to save cart to localStorage
const saveCartToStorage = useCallback((items, note = cart.generalNote) => {
    localStorage.setItem('cart', JSON.stringify({
        items,
        timestamp: Date.now(),
        generalNote: note
    }));
}, [cart.generalNote]);

const value = {
    items: cart.items,
    total: cart.total,
    count: cart.count,
    loading: cart.loading,
    generalNote: cart.generalNote,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    updateItemNote,
    updateGeneralNote,
    refreshCart: fetchCart
};

return (
    <CartContext.Provider value={value}>
        {children}
    </CartContext.Provider>
);
}

// Custom hook to use the cart context
export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}