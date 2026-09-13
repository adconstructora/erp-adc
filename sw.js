// ══════════════════════════════════════════════════════════════
// ERP ADC — Service Worker
// Estrategia: el HTML SIEMPRE se pide a la red (así el iPad ve
// la última versión). La copia en caché solo se usa sin internet.
// Sube este archivo junto al index.html (misma carpeta).
// ══════════════════════════════════════════════════════════════
const CACHE = 'erp-adc-shell-v1';
const FALLBACK = 'offline-index';

// No llamamos skipWaiting aquí a propósito: la app avisa con un
// banner y el usuario decide cuándo actualizar (no se pierde nada
// que esté capturando en ese momento).
self.addEventListener('install', function(e) { /* nada */ });

self.addEventListener('activate', function(e) {
  e.waitUntil((async function(){
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', function(e) {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', function(e) {
  const req = e.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch(err) { return; }
  // Supabase, Google Fonts, CDNs: directo a la red, sin tocar
  if (url.origin !== self.location.origin) return;

  const esDocumento = req.mode === 'navigate' || req.destination === 'document';

  if (esDocumento) {
    e.respondWith((async function(){
      try {
        const fresh = await fetch(req, { cache: 'no-store' });
        const c = await caches.open(CACHE);
        c.put(FALLBACK, fresh.clone());
        return fresh;
      } catch (err) {
        const c = await caches.open(CACHE);
        const cached = await c.match(FALLBACK);
        return cached || new Response('Sin conexión y sin copia guardada', {
          status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }
    })());
  }
});
