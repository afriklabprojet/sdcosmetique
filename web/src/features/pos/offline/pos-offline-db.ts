import type { CreatePosSalePayload } from '@/shared/api/admin/pos';

const DB_NAME = 'sdc-pos-offline';
const DB_VERSION = 2;
const STORE = 'queued_sales';

export type QueuedSale = {
  idempotencyKey: string;
  operatorId: number;
  payload: CreatePosSalePayload;
  queuedAt: string;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'idempotencyKey' });
      } else {
        request.transaction?.objectStore(STORE).clear();
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Vrai seulement côté navigateur — IndexedDB n'existe pas pendant le rendu serveur/build. */
function available(): boolean {
  return typeof indexedDB !== 'undefined';
}

export async function enqueueSale(payload: CreatePosSalePayload, operatorId: number): Promise<void> {
  if (!available()) return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put({ idempotencyKey: payload.idempotency_key, operatorId, payload, queuedAt: new Date().toISOString() } satisfies QueuedSale);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function listQueuedSales(operatorId: number): Promise<QueuedSale[]> {
  if (!available()) return [];
  const db = await openDb();
  const result = await new Promise<QueuedSale[]>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const request = tx.objectStore(STORE).getAll();
    request.onsuccess = () => resolve(
      (request.result as QueuedSale[]).filter((sale) => sale.operatorId === operatorId),
    );
    request.onerror = () => reject(request.error);
  });
  db.close();
  return result;
}

export async function removeQueuedSale(idempotencyKey: string): Promise<void> {
  if (!available()) return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(idempotencyKey);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function countQueuedSales(operatorId: number): Promise<number> {
  return (await listQueuedSales(operatorId)).length;
}
