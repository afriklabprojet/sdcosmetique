'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  addCartItem,
  applyCartCoupon,
  fetchCart,
  removeCartCoupon,
  removeCartItem,
  updateCartItem,
} from '@/shared/api/cart';
import { sellableSlug, type MappedCart } from '@/shared/api/mappers/cart';
import { CartItem, Product } from '@/shared/types/domain.type';

const EMPTY: MappedCart = { items: [], subtotal: 0, discount: 0, total: 0, couponCode: null };

interface CartContextValue {
  items: CartItem[];
  open: boolean;
  totalItems: number;
  totalPrice: number;
  discount: number;
  couponCode: string | null;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  refresh: () => Promise<void>;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { readonly children: React.ReactNode }) {
  const [open, setIsOpen] = useState(false);
  const [cart, setCart] = useState<MappedCart>(EMPTY);

  const refresh = useCallback(async () => {
    try {
      setCart(await fetchCart());
    } catch {
      setCart(EMPTY);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetchCart()
      .then((data) => {
        if (active) setCart(data);
      })
      .catch(() => {
        if (active) setCart(EMPTY);
      });
    return () => {
      active = false;
    };
  }, []);

  const addItem = useCallback((product: Product) => {
    void addCartItem(sellableSlug(product), 1)
      .then(setCart)
      .then(() => setIsOpen(true));
  }, []);

  const removeItem = useCallback((productId: string) => {
    const line = cart.items.find((item) => item.product.id === productId);
    if (line?.lineId == null) return;
    void removeCartItem(line.lineId).then(setCart);
  }, [cart.items]);

  const updateQty = useCallback((productId: string, quantity: number) => {
    const line = cart.items.find((item) => item.product.id === productId);
    if (line?.lineId == null) return;
    if (quantity <= 0) {
      void removeCartItem(line.lineId).then(setCart);
      return;
    }
    void updateCartItem(line.lineId, quantity).then(setCart);
  }, [cart.items]);

  const clearCart = useCallback(() => {
    const lines = cart.items.filter((item) => item.lineId != null);
    void Promise.all(lines.map((item) => removeCartItem(item.lineId as number))).then(() => refresh());
  }, [cart.items, refresh]);

  const applyCoupon = useCallback(async (code: string) => {
    setCart(await applyCartCoupon(code));
  }, []);

  const removeCoupon = useCallback(async () => {
    setCart(await removeCartCoupon());
  }, []);

  const toggleCart = useCallback(() => setIsOpen((value) => !value), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const totalItems = useMemo(
    () => cart.items.reduce((sum, item) => sum + item.quantity, 0),
    [cart.items],
  );
  const contextValue = useMemo(
    () => ({
      items: cart.items,
      open,
      totalItems,
      totalPrice: cart.subtotal,
      discount: cart.discount,
      couponCode: cart.couponCode,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      applyCoupon,
      removeCoupon,
      refresh,
      toggleCart,
      openCart,
      closeCart,
    }),
    [
      cart.items,
      cart.subtotal,
      cart.discount,
      cart.couponCode,
      open,
      totalItems,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      applyCoupon,
      removeCoupon,
      refresh,
      toggleCart,
      openCart,
      closeCart,
    ],
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
