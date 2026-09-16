'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Pos, type PosSale } from '@/shared/api/admin/pos';
import { ApiError } from '@/shared/api/client';
import { toast } from '@/shared/ui/toast';
import { countQueuedSales, listQueuedSales, removeQueuedSale } from '@/features/pos/offline/pos-offline-db';

/**
 * Ventes prises hors-ligne (§30 — préparation du mode offline) : quand
 * `Pos.createSale()` échoue pour une vraie coupure réseau (pas une erreur
 * serveur), la vente est mise en file dans IndexedDB avec sa clé
 * d'idempotence, puis rejouée automatiquement au retour de la connexion — la
 * même clé garantit qu'aucune vente n'est jamais créée deux fois côté
 * Laravel, même si la synchronisation est retentée plusieurs fois.
 */
export function useOfflineSync(operatorId: number | null) {
  const [queuedCount, setQueuedCount] = useState(0);
  const syncing = useRef(false);

  const refreshCount = useCallback(() => {
    if (operatorId === null) return;

    countQueuedSales(operatorId).then(setQueuedCount).catch(() => undefined);
  }, [operatorId]);

  const syncNow = useCallback(async () => {
    if (operatorId === null || syncing.current || typeof navigator !== 'undefined' && !navigator.onLine) return;
    syncing.current = true;

    try {
      const queued = await listQueuedSales(operatorId);

      for (const entry of queued) {
        try {
          const sale: PosSale = await Pos.createSale(entry.payload);
          await removeQueuedSale(entry.idempotencyKey);
          toast.success(`Vente hors-ligne synchronisée : ${sale.reference}`);
        } catch (err) {
          if (err instanceof ApiError) {
            // Le serveur a répondu (ex. stock désormais insuffisant) : on
            // retire quand même de la file, la rejouer indéfiniment n'aiderait
            // pas — l'erreur est journalisée pour que le vendeur soit averti.
            await removeQueuedSale(entry.idempotencyKey);
            toast.error(`Vente hors-ligne rejetée à la synchronisation : ${err.message}`);
          } else {
            // Toujours pas de réseau — on arrête, on retentera plus tard.
            break;
          }
        }
      }
    } finally {
      syncing.current = false;
      refreshCount();
    }
  }, [operatorId, refreshCount]);

  useEffect(() => {
    refreshCount();
    void syncNow();

    const onOnline = () => { void syncNow(); };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [refreshCount, syncNow]);

  return { queuedCount, syncNow, refreshCount };
}
