'use client';

/*
 * Panier de favoris. Invité : localStorage uniquement (aucune route API ne
 * le permet — `wishlists.client_id` est NOT NULL côté schéma). Client
 * connecté : la liste vit sur `/account/wishlist` / `/wishlist-items` et
 * suit le compte, pas le navigateur. Au passage invité → connecté, les
 * favoris locaux sont poussés sur le serveur une fois puis le stockage
 * local est vidé.
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { Product } from '@/shared/types/domain.type';
import { Account } from '@/shared/api/auth';
import { Product as StorefrontProductApi } from '@/shared/api/catalog';
import { api, unwrapData } from '@/shared/api/client';
import { toast } from '@/shared/ui/toast';

const WISHLIST_STORAGE_KEY = 'sd-cosmetique-wishlist';
const EMPTY_WISHLIST = '[]';
const wishlistListeners = new Set<() => void>();

function subscribeWishlist(listener: () => void) {
  if (globalThis.window === undefined) return () => {};

  const syncFromStorage = (event: StorageEvent) => {
    if (event.key === WISHLIST_STORAGE_KEY) listener();
  };

  wishlistListeners.add(listener);
  globalThis.window.addEventListener('storage', syncFromStorage);

  return () => {
    wishlistListeners.delete(listener);
    globalThis.window!.removeEventListener('storage', syncFromStorage);
  };
}

function emitWishlistChange() {
  wishlistListeners.forEach(listener => listener());
}

function readStoredWishlistRaw() {
  if (globalThis.window === undefined) return EMPTY_WISHLIST;
  return globalThis.window.localStorage.getItem(WISHLIST_STORAGE_KEY) ?? EMPTY_WISHLIST;
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
  if (globalThis.window === undefined) return;
  try {
    globalThis.window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    emitWishlistChange();
  } catch {
    // Storage can be unavailable in private browsing; wishlist still works in memory.
  }
}

/* ── Persistance serveur (client connecté) ──────────────────────────── */

interface ServerWishlistRow {
  id: number | string;
  slug: string;
  title: string;
}

async function fetchServerWishlist(): Promise<ServerWishlistRow[]> {
  const body = await api<{ data: ServerWishlistRow[] }>('/account/wishlist');
  return unwrapData(body);
}

async function addServerItem(slug: string): Promise<string> {
  const body = await api<{ data: { id: number | string } }>('/wishlist-items', {
    method: 'POST',
    body: JSON.stringify({ product: slug }),
  });
  return String(unwrapData(body).id);
}

async function removeServerItem(itemId: string): Promise<void> {
  await api(`/wishlist-items/${itemId}`, { method: 'DELETE' });
}

async function loadServerWishlist(): Promise<{ items: Product[]; idBySlug: Record<string, string> }> {
  const rows = await fetchServerWishlist();
  const idBySlug: Record<string, string> = {};
  rows.forEach(row => { idBySlug[row.slug] = String(row.id); });
  if (rows.length === 0) return { items: [], idBySlug };

  // Product.id === slug (mapStorefrontProduct) — un seul fetch du catalogue
  // plutôt qu'un aller-retour par article.
  const catalog = await StorefrontProductApi.list({ perPage: 100 });
  const bySlug = new Map(catalog.map(product => [product.id, product]));
  const items = rows
    .map(row => bySlug.get(row.slug))
    .filter((product): product is Product => product !== undefined);

  return { items, idBySlug };
}

interface WishlistContextValue {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggle: (product: Product) => void;
  wishlistContains: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const rawWishlist = useSyncExternalStore(subscribeWishlist, readStoredWishlistRaw, () => EMPTY_WISHLIST);
  const localItems = useMemo(() => parseStoredWishlist(rawWishlist), [rawWishlist]);

  const [authState, setAuthState] = useState<'guest' | 'auth'>('guest');
  const authStateRef = useRef(authState);
  const [serverItems, setServerItems] = useState<Product[]>([]);
  const idBySlugRef = useRef<Record<string, string>>({});
  const mergedGuestRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    Account.identify().then(async (identity) => {
      if (cancelled) return;

      if (!identity) {
        if (authStateRef.current === 'auth') {
          // Déconnexion détectée — la liste serveur ne concerne plus ce visiteur.
          setServerItems([]);
          idBySlugRef.current = {};
        }
        authStateRef.current = 'guest';
        setAuthState('guest');
        return;
      }

      if (authStateRef.current === 'auth') return; // déjà chargée pour cette session

      if (!mergedGuestRef.current) {
        mergedGuestRef.current = true;
        const guestItems = parseStoredWishlist(readStoredWishlistRaw());
        if (guestItems.length > 0) {
          await Promise.all(guestItems.map(item => addServerItem(item.id).catch(() => {})));
          writeStoredWishlist([]);
        }
      }

      const { items, idBySlug } = await loadServerWishlist();
      if (cancelled) return;
      idBySlugRef.current = idBySlug;
      setServerItems(items);
      authStateRef.current = 'auth';
      setAuthState('auth');
    }).catch(() => {
      if (!cancelled) {
        authStateRef.current = 'guest';
        setAuthState('guest');
      }
    });

    return () => { cancelled = true; };
  }, [pathname]);

  const items = authState === 'auth' ? serverItems : localItems;

  const updateLocalItems = useCallback((updater: (items: Product[]) => Product[]) => {
    writeStoredWishlist(updater(parseStoredWishlist(readStoredWishlistRaw())));
  }, []);

  const addItem = useCallback((product: Product) => {
    if (authState === 'auth') {
      setServerItems(current => current.some(item => item.id === product.id) ? current : [...current, product]);
      addServerItem(product.id)
        .then(serverItemId => { idBySlugRef.current[product.id] = serverItemId; })
        .catch(() => {
          setServerItems(current => current.filter(item => item.id !== product.id));
          toast.error("Impossible d'ajouter aux favoris. Vérifiez votre connexion.");
        });
      return;
    }
    updateLocalItems(currentItems => currentItems.some(item => item.id === product.id) ? currentItems : [...currentItems, product]);
  }, [authState, updateLocalItems]);

  const removeItem = useCallback((productId: string) => {
    if (authState === 'auth') {
      const serverItemId = idBySlugRef.current[productId];
      setServerItems(current => current.filter(item => item.id !== productId));
      if (serverItemId) {
        delete idBySlugRef.current[productId];
        removeServerItem(serverItemId).catch(() => {
          toast.error('La suppression du favori a échoué côté serveur.');
        });
      }
      return;
    }
    updateLocalItems(currentItems => currentItems.filter(item => item.id !== productId));
  }, [authState, updateLocalItems]);

  const toggle = useCallback((product: Product) => {
    if (items.some(item => item.id === product.id)) {
      removeItem(product.id);
    } else {
      addItem(product);
    }
  }, [items, addItem, removeItem]);

  const wishlistContains = useCallback((productId: string) =>
    items.some(p => p.id === productId), [items]);

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, toggle, wishlistContains }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
