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
        loading: true
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
    }, []);    // Fetch cart data from localStorage
    const fetchCart = useCallback(async (showToast = false) => {
        try {
            setCart(prev => ({ ...prev, loading: true }));

            // Get cart from localStorage
            const localCart = localStorage.getItem('cart');
            let cartItems = [];

            if (localCart) {
                try {
                    const parsed = JSON.parse(localCart);
                    if (parsed?.items && Array.isArray(parsed.items)) {
                        cartItems = parsed.items;
                    }
                } catch (error) {
                    console.error('Error parsing local cart:', error);
                    localStorage.removeItem('cart');
                }
            }

            setCart({
                items: cartItems,
                total: calculateTotal(cartItems),
                count: calculateCount(cartItems),
                loading: false
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
    }, [calculateTotal, calculateCount]);

    // Initialize cart
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);    // Add to cart
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
            };

            // For regular products, check if it exists and update quantity
            // For gift products, always add as new item
            const existingItemIndex = productData.type === 'regular' ?
                items.findIndex(item => item.id === productData.id && !item.type === 'gift') : -1;

            let updatedItems;
            if (existingItemIndex > -1) {
                // Update existing regular item quantity
                updatedItems = items.map((item, index) =>
                    index === existingItemIndex
                        ? { ...item, quantity: item.quantity + productData.quantity }
                        : item
                );
            } else {
                // Add as new item - for both new regular items and all gift items
                updatedItems = [...items, productData];
            }

            // Update local storage with timestamp
            localStorage.setItem('cart', JSON.stringify({
                items: updatedItems,
                timestamp: Date.now()
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
    }, [cart, calculateTotal, calculateCount]);// Remove from cart
    const removeFromCart = useCallback(async (productId) => {
        try {
            if (cart.loading) return false;

            const updatedItems = cart.items.filter(item => item.id !== productId);

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
            }));

            toast.success('Producto eliminado del carrito');
            return true;
        } catch (error) {
            console.error('Error removing from cart:', error); toast.error('Error al eliminar del carrito');
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
    }, [cart, calculateTotal, calculateCount]);// Clear cart
    const clearCart = useCallback(async () => {
        try {
            if (cart.loading) return false;

            // Clear local storage
            localStorage.removeItem('cart');

            // Update state
            setCart(prev => ({
                ...prev,
                items: [],
                total: 0,
                count: 0
            }));

            toast.success('Carrito vaciado');
            return true;
        } catch (error) {
            console.error('Error clearing cart:', error); toast.error('Error al vaciar el carrito');
            return false;
        }
    }, [cart.loading]);

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

    const value = {
        items: cart.items,
        total: cart.total,
        count: cart.count,
        loading: cart.loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        updateItemNote,
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