import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('greenbasket_cart') || localStorage.getItem('freshbasket_cart') || localStorage.getItem('freshmart_cart');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('greenbasket_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Could not save cart to localStorage', e);
    }
  }, [cart]);

  const addToCart = (productId, qty = 1) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + qty,
    }));
  };

  const updateQuantity = (productId, qty) => {
    setCart((prev) => {
      const next = { ...prev };
      if (qty <= 0) {
        delete next[productId];
      } else {
        next[productId] = qty;
      }
      return next;
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  const clearCart = () => {
    setCart({});
    localStorage.removeItem('greenbasket_cart');
    localStorage.removeItem('freshbasket_cart');
    localStorage.removeItem('freshmart_cart');
  };

  const totalItemCount = useMemo(() => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
