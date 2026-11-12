import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'lex-leonis-carrinho';

const CartContext = createContext(null);

function readStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readStorage());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      /* carrinho segue apenas em memória */
    }
  }, [items]);

  const add = useCallback(
    (product, size, quantity = 1, variation = '', customName = '', customNumber = '') => {
      setItems((current) => {
        const key = `${product.id}::${size || ''}::${variation || ''}::${customName || ''}::${customNumber || ''}`;
        const existing = current.find((item) => item.key === key);
        if (existing) {
          return current.map((item) =>
            item.key === key ? { ...item, quantity: item.quantity + quantity } : item,
          );
        }
        return [
          ...current,
          {
            key,
            product_id: product.id,
            name: product.name,
            image: product.images?.[0] || '',
            size: size || '',
            variation: variation || '',
            custom_name: customName || '',
            custom_number: customNumber || '',
            price: Number(product.promo_price ?? product.price ?? 0),
            preorder: Boolean(product.preorder),
            quantity,
          },
        ];
      });
    },
    [],
  );

  const updateQuantity = useCallback((key, quantity) => {
    setItems((current) =>
      current
        .map((item) => (item.key === key ? { ...item, quantity: Math.max(0, quantity) } : item))
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const remove = useCallback((key) => {
    setItems((current) => current.filter((item) => item.key !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const count = items.reduce((total, item) => total + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return { items, count, total, add, updateQuantity, remove, clear };
  }, [items, add, updateQuantity, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart precisa estar dentro de CartProvider');
  return context;
}