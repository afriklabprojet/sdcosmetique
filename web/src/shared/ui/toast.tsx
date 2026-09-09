'use client';

/*
 * Petit système de notifications globales, sur le même principe pub/sub que
 * les stores wishlist/comparaison (pas de Provider à poser partout : un seul
 * <Toaster /> monté dans layout.tsx suffit, `toast.error()` s'appelle depuis
 * n'importe quel store ou composant).
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

interface ToastEntry {
  id: number;
  message: string;
  variant: 'error' | 'success';
}

let nextId = 1;
let toasts: ToastEntry[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach(listener => listener());
}

function push(message: string, variant: ToastEntry['variant']) {
  const id = nextId++;
  toasts = [...toasts, { id, message, variant }];
  emit();
  globalThis.setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
    emit();
  }, 3600);
}

export const toast = {
  error: (message: string) => push(message, 'error'),
  success: (message: string) => push(message, 'success'),
};

export function Toaster() {
  const [items, setItems] = useState<ToastEntry[]>(toasts);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const listener = () => setItems([...toasts]);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 84px)',
        transform: 'translateX(-50%)',
        zIndex: 90,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        width: 'min(92vw, 380px)',
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {items.map(item => (
          <motion.div
            key={item.id}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.24, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 10,
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#fff',
              background: item.variant === 'error' ? '#B3261E' : '#1A0E05',
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
              textAlign: 'center',
            }}
          >
            {item.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
