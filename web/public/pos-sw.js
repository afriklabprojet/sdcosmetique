// Service worker de l'écran de caisse (§30 — préparation du mode offline).
// Portée volontairement restreinte à /admin/pos* (voir l'enregistrement dans
// pos.view.tsx, `{ scope: '/admin/pos' }`) : ne touche jamais le site public
// ni le reste du dashboard admin.
//
// Stratégie : network-first avec repli sur le cache pour les pages et
// assets statiques de la caisse. Les appels vers l'API Laravel (autre
// origine) ne sont jamais interceptés — c'est la file IndexedDB côté
// application (use-offline-sync.ts) qui gère leur échec réseau, pas ce
// service worker.

const CACHE_NAME = 'sdc-pos-shell-v1';

self.addEventListener('install', (_event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // laisse passer l'API (autre origine)

  const isShellAsset = url.pathname.startsWith('/admin/pos') || url.pathname.startsWith('/_next/static/');
  if (!isShellAsset) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached ?? Response.error())),
  );
});
