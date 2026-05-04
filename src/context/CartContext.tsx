'use client';

import React, { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from 'react';
import { CartItem, Product } from '@/types';

const CART_STORAGE_KEY = 'sd-cosmetique-cart';
const EMPTY_CART = '[]';
const cartListeners = new Set<() => void>();

function subscribeCart(listener: () => void) {
  const browserWindow = globalThis.window;
  if (browserWindow === undefined) return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key === CART_STORAGE_KEY) listener();
  };

  cartListeners.add(listener);
  browserWindow.addEventListener('storage', handleStorage);

  return () => {
    cartListeners.delete(listener);
    browserWindow.removeEventListener('storage', handleStorage);
  };
}

function emitCartChange() {
  cartListeners.forEach(listener => listener());
}

function readStoredCartRaw() {
  if (globalThis.window === undefined) return EMPTY_CART;
  return globalThis.window.localStorage.getItem(CART_STORAGE_KEY) ?? EMPTY_CART;
}

function parseStoredCart(rawCart: string): CartItem[] {
  try {
    const parsedCart = JSON.parse(rawCart) as CartItem[];
    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch {
    return [];
  }
}

function writeStoredCart(items: CartItem[]) {
  const browserWindow = globalThis.window;
  if (browserWindow === undefined) return;
  try {
    browserWindow.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    emitCartChange();
  } catch {
    // Storage can be unavailable in private browsing; cart still works in memory.
  }
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: number;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { readonly children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const rawCart = useSyncExternalStore(subscribeCart, readStoredCartRaw, () => EMPTY_CART);
  const items = useMemo(() => parseStoredCart(rawCart), [rawCart]);

  const updateItems = useCallback((updater: (items: CartItem[]) => CartItem[]) => {
    writeStoredCart(updater(parseStoredCart(readStoredCartRaw())));
  }, []);

  const addItem = useCallback((product: Product) => {
    updateItems(currentItems => {
      const existingItem = currentItems.find(item => item.product.id === product.id);
      if (existingItem) {
        return currentItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...currentItems, { product, quantity: 1 }];
    });
    setIsOpen(true);
  }, [updateItems]);

  const removeItem = useCallback((productId: string) => {
    updateItems(currentItems => currentItems.filter(item => item.product.id !== productId));
  }, [updateItems]);

  const updateQty = useCallback((productId: string, quantity: number) => {
    updateItems(currentItems => {
      if (quantity <= 0) return currentItems.filter(item => item.product.id !== productId);
      return currentItems.map(item => item.product.id === productId ? { ...item, quantity } : item);
    });
  }, [updateItems]);

  const clearCart = useCallback(() => writeStoredCart([]), []);
  const toggleCart = useCallback(() => setIsOpen(open => !open), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0), [items]);
  const contextValue = useMemo(
    () => ({
      items,
      isOpen,
      totalItems,
      totalPrice,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      toggleCart,
      openCart,
      closeCart,
    }),
    [items, isOpen, totalItems, totalPrice, addItem, removeItem, updateQty, clearCart, toggleCart, openCart, closeCart]
  );

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
