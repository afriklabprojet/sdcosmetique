'use client';

/*
 * Comparateur de produits (jusqu'à 4). Même architecture que la wishlist
 * (features/wishlist/wishlist.store.tsx) et pour la même raison :
 * `comparisons.client_id` est NOT NULL côté API, donc pas de mode invité
 * possible côté serveur. Invité : localStorage. Connecté : `/comparison` /
 * `/comparison-items`, avec fusion des favoris locaux à la connexion.
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { Product } from '@/shared/types/domain.type';
import { Account } from '@/shared/api/auth';
import { Product as StorefrontProductApi } from '@/shared/api/catalog';
import { api, unwrapData } from '@/shared/api/client';
import { toast } from '@/shared/ui/toast';

export const COMPARISON_LIMIT = 4;

const STORAGE_KEY = 'sd-cosmetique-comparison';
const EMPTY = '[]';
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  if (globalThis.window === undefined) return () => {};
  const syncFromStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  listeners.add(listener);
  globalThis.window.addEventListener('storage', syncFromStorage);
  return () => {
    listeners.delete(listener);
    globalThis.window!.removeEventListener('storage', syncFromStorage);
  };
}

function emitChange() {
  listeners.forEach(listener => listener());
}

function readRaw() {
  if (globalThis.window === undefined) return EMPTY;
  return globalThis.window.localStorage.getItem(STORAGE_KEY) ?? EMPTY;
}

function parse(raw: string): Product[] {
  try {
    const parsed = JSON.parse(raw) as Product[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(items: Product[]) {
  if (globalThis.window === undefined) return;
  try {
    globalThis.window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    emitChange();
  } catch {
    // Stockage indisponible (navigation privée) — le comparateur reste utilisable en mémoire.
  }
}

/* ── Persistance serveur (client connecté) ──────────────────────────── */

interface ServerRow {
  id: number | string;
  slug: string;
  title: string;
}

async function fetchServerComparison(): Promise<ServerRow[]> {
  const body = await api<{ data: ServerRow[] }>('/comparison');
  return unwrapData(body);
}

async function addServerItem(slug: string): Promise<string> {
  const body = await api<{ data: { id: number | string } }>('/comparison-items', {
    method: 'POST',
    body: JSON.stringify({ product: slug }),
  });
  return String(unwrapData(body).id);
}

async function removeServerItem(itemId: string): Promise<void> {
  await api(`/comparison-items/${itemId}`, { method: 'DELETE' });
}

async function loadServerComparison(): Promise<{ items: Product[]; idBySlug: Record<string, string> }> {
  const rows = await fetchServerComparison();
  const idBySlug: Record<string, string> = {};
  rows.forEach(row => { idBySlug[row.slug] = String(row.id); });
  if (rows.length === 0) return { items: [], idBySlug };

  const catalog = await StorefrontProductApi.list({ perPage: 100 });
  const bySlug = new Map(catalog.map(product => [product.id, product]));
  const items = rows
    .map(row => bySlug.get(row.slug))
    .filter((product): product is Product => product !== undefined);

  return { items, idBySlug };
}

interface ComparisonContextValue {
  items: Product[];
  limit: number;
  isFull: boolean;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggle: (product: Product) => void;
  clear: () => void;
  comparisonContains: (productId: string) => boolean;
}

const ComparisonContext = createContext<ComparisonContextValue | null>(null);

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const rawLocal = useSyncExternalStore(subscribe, readRaw, () => EMPTY);
  const localItems = useMemo(() => parse(rawLocal), [rawLocal]);

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
          setServerItems([]);
          idBySlugRef.current = {};
        }
        authStateRef.current = 'guest';
        setAuthState('guest');
        return;
      }

      if (authStateRef.current === 'auth') return;

      if (!mergedGuestRef.current) {
        mergedGuestRef.current = true;
        const guestItems = parse(readRaw()).slice(0, COMPARISON_LIMIT);
        if (guestItems.length > 0) {
          await Promise.all(guestItems.map(item => addServerItem(item.id).catch(() => {})));
          writeLocal([]);
        }
      }

      const { items, idBySlug } = await loadServerComparison();
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
    writeLocal(updater(parse(readRaw())));
  }, []);

  const addItem = useCallback((product: Product) => {
    if (items.length >= COMPARISON_LIMIT && !items.some(item => item.id === product.id)) {
      toast.error(`Vous pouvez comparer ${COMPARISON_LIMIT} produits maximum. Retirez-en un pour en ajouter un autre.`);
      return;
    }

    if (authState === 'auth') {
      setServerItems(current => current.some(item => item.id === product.id) ? current : [...current, product]);
      addServerItem(product.id)
        .then(serverItemId => { idBySlugRef.current[product.id] = serverItemId; })
        .catch(() => {
          setServerItems(current => current.filter(item => item.id !== product.id));
          toast.error('Impossible d\'ajouter au comparateur. Vérifiez votre connexion.');
        });
      return;
    }
    updateLocalItems(currentItems => currentItems.some(item => item.id === product.id) ? currentItems : [...currentItems, product]);
  }, [authState, items, updateLocalItems]);

  const removeItem = useCallback((productId: string) => {
    if (authState === 'auth') {
      const serverItemId = idBySlugRef.current[productId];
      setServerItems(current => current.filter(item => item.id !== productId));
      if (serverItemId) {
        delete idBySlugRef.current[productId];
        removeServerItem(serverItemId).catch(() => {
          toast.error('La suppression du comparateur a échoué côté serveur.');
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

  const clear = useCallback(() => {
    if (authState === 'auth') {
      setServerItems([]);
      idBySlugRef.current = {};
      api('/comparison', { method: 'DELETE' }).catch(() => {
        toast.error('La réinitialisation du comparateur a échoué côté serveur.');
      });
      return;
    }
    writeLocal([]);
  }, [authState]);

  const comparisonContains = useCallback((productId: string) =>
    items.some(p => p.id === productId), [items]);

  return (
    <ComparisonContext.Provider value={{
      items, limit: COMPARISON_LIMIT, isFull: items.length >= COMPARISON_LIMIT,
      addItem, removeItem, toggle, clear, comparisonContains,
    }}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const ctx = useContext(ComparisonContext);
  if (!ctx) throw new Error('useComparison must be used within ComparisonProvider');
  return ctx;
}
