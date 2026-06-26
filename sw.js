/**
 * TerzaGeo — Service Worker
 * Gère le cache pour fonctionnement hors ligne (offline)
 * BABACAR GUEYE — Université Amadou Mahtar Mbow
 */

const CACHE_NAME = 'terzageo-v1.0';

// Fichiers à mettre en cache pour le mode hors ligne
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

// ── INSTALLATION : mise en cache des ressources ──────────────────────────────
self.addEventListener('install', event => {
  console.log('[TerzaGeo SW] Installation du service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[TerzaGeo SW] Mise en cache des ressources');
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATION : nettoyage des anciens caches ────────────────────────────────
self.addEventListener('activate', event => {
  console.log('[TerzaGeo SW] Activation...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[TerzaGeo SW] Suppression ancien cache :', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH : stratégie Cache First puis Network ───────────────────────────────
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        // Ressource trouvée en cache → retour immédiat (fonctionne hors ligne)
        return cached;
      }
      // Pas en cache → requête réseau
      return fetch(event.request).then(response => {
        // Mettre à jour le cache avec la nouvelle réponse
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Hors ligne et ressource absente du cache
        return new Response(
          '<h1 style="font-family:sans-serif;color:#3b82f6;text-align:center;margin-top:20%">' +
          'TerzaGeo — Mode Hors Ligne<br>' +
          '<small style="color:#94a3b8">Ouvrez l\'application depuis le cache principal.</small></h1>',
          { headers: { 'Content-Type': 'text/html' } }
        );
      });
    })
  );
});
