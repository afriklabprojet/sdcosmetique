'use client';

import React, { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from 'react';
import { Product } from '@/types';

const WISHLIST_STORAGE_KEY = 'sd-cosmetique-wishlist';
const EMPTY_WISHLIST = '[]';
const wishlistListeners = new Set<() => void>();

function subscribeWishlist(listener: () => void) {
  if (typeof window === 'undefined') return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key === WISHLIST_STORAGE_KEY) listener();
  };

  wishlistListeners.add(listener);
  window.addEventListener('storage', handleStorage);

  return () => {
    wishlistListeners.delete(listener);
    window.removeEventListener('storage', handleStorage);
  };
}

function emitWishlistChange() {
  wishlistListeners.forEach(listener => listener());
}

function readStoredWishlistRaw() {
  if (typeof window === 'undefined') return EMPTY_WISHLIST;
  return window.localStorage.getItem(WISHLIST_STORAGE_KEY) ?? EMPTY_WISHLIST;
}

function parseStoredWishlist(rawWishlist: string): Product[] {
  try {
    const parsedWishlist = JSON.parse(rawWishlist) as Product[];
    return Array.isArray(parsedWishlist) ? parsedWishlist : [];
  } catch {
    return [];
  }
}

function writeStoredWishlist(items: Product[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    emitWishlistChange();
  } catch {
    // Storage can be unavailable in private browsing; wishlist still works in memory.
  }
}

interface WishlistContextValue {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggle: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const rawWishlist = useSyncExternalStore(subscribeWishlist, readStoredWishlistRaw, () => EMPTY_WISHLIST);
  const items = useMemo(() => parseStoredWishlist(rawWishlist), [rawWishlist]);

  const updateItems = useCallback((updater: (items: Product[]) => Product[]) => {
    writeStoredWishlist(updater(parseStoredWishlist(readStoredWishlistRaw())));
  }, []);

  const addItem = useCallback((product: Product) => {
    updateItems(currentItems => currentItems.some(item => item.id === product.id) ? currentItems : [...currentItems, product]);
  }, [updateItems]);

  const removeItem = useCallback((productId: string) => {
    updateItems(currentItems => currentItems.filter(item => item.id !== productId));
  }, [updateItems]);

  const toggle = useCallback((product: Product) => {
    updateItems(currentItems =>
      currentItems.some(item => item.id === product.id)
        ? currentItems.filter(item => item.id !== product.id)
        : [...currentItems, product]
    );
  }, [updateItems]);

  const isInWishlist = useCallback((productId: string) =>
    items.some(p => p.id === productId), [items]);

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, toggle, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
