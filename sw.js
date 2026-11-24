// Service worker de León con Peques.
// - Página (HTML), datos y lógica (data.js, lib.js): primero red, preguntando siempre al servidor si hay
//   versión nueva (cache: 'no-cache'; GitHub Pages permite reutilizar los ficheros 10 min
//   sin preguntar). Si no hay conexión o la red tarda más de NET_TIMEOUT_MS, se usa la
//   última copia guardada y la descarga sigue en segundo plano para la próxima vez.
// - Iconos y manifiesto: primero caché.
// - Ficheros .ics: directos al servidor (los abre el Calendario del sistema).
// - Fuentes de Google: se sirve la copia guardada y se refresca en segundo plano.
// Sube VERSION si cambias la lista de ficheros precargados.
const VERSION = 'v5';
const NET_TIMEOUT_MS = 3000;
const CACHE = `leon-con-peques-${VERSION}`;
const PRECACHE = [
  './',
  './index.html',
  './data.js',
  './lib.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

self.addEventListener('install', (event) => {
  // cache: 'reload' → descarga del servidor, sin reutilizar la caché HTTP del navegador
  event.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(PRECACHE.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Red primero con límite de tiempo; guarda la respuesta buena bajo cacheKey.
function networkFirst(event, cacheKey) {
  const network = fetch(event.request.url, { cache: 'no-cache', credentials: 'same-origin' }).then((res) => {
    if (res.ok) {
      const copy = res.clone();
      return caches.open(CACHE).then((c) => c.put(cacheKey, copy)).then(() => res);
    }
    return res;
  });
  event.waitUntil(network.catch(() => {}));
  return new Promise((resolve) => {
    let settled = false;
    const finish = (res) => { if (!settled && res) { settled = true; resolve(res); } };
    const timer = setTimeout(() => { caches.match(cacheKey).then(finish); }, NET_TIMEOUT_MS);
    network
      .then((res) => { clearTimeout(timer); finish(res); })
      .catch(() => {
        clearTimeout(timer);
        caches.match(cacheKey).then((c) => finish(c || Response.error()));
      });
  });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const path = url.pathname;

  // .ics: sin interceptar
  if (sameOrigin && path.endsWith('.ics')) return;

  // Página principal
  if (req.mode === 'navigate') {
    if (sameOrigin && (path.endsWith('/') || path.endsWith('.html'))) {
      event.respondWith(networkFirst(event, './index.html'));
    }
    return;
  }

  // Datos y lógica compartida
  if (sameOrigin && (path.endsWith('/data.js') || path.endsWith('/lib.js'))) {
    event.respondWith(networkFirst(event, '.' + path.slice(path.lastIndexOf('/'))));
    return;
  }

  // Google Fonts: stale-while-revalidate
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(CACHE).then(async (c) => {
        const cached = await c.match(req);
        const network = fetch(req)
          .then((res) => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // Resto del mismo origen (iconos, manifiesto): caché primero
  if (sameOrigin) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      }))
    );
  }
});
