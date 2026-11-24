// Service worker de León con Peques.
// - Página (HTML): primero red, y si no hay conexión, la última copia guardada.
//   Así la app instalada muestra siempre la versión más reciente cuando hay red.
// - Iconos y manifiesto: primero caché.
// - Fuentes de Google: se sirve la copia guardada y se refresca en segundo plano.
// Sube VERSION si cambias la lista de ficheros precargados.
const VERSION = 'v3';
const NAV_TIMEOUT_MS = 3000;
const CACHE = `leon-con-peques-${VERSION}`;
const PRECACHE = [
  './',
  './index.html',
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

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Navegación: red primero, pero si la red tarda más de NAV_TIMEOUT_MS
  // (cobertura débil) se muestra la copia guardada. La descarga sigue en
  // segundo plano y actualiza la copia para la próxima vez.
  // cache: 'no-cache' obliga a preguntar al servidor si hay versión nueva
  // (GitHub Pages permite reutilizar la página 10 min sin preguntar; sin esto,
  // la app instalada seguía mostrando la versión anterior tras un cambio).
  if (req.mode === 'navigate') {
    const network = fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }).then((res) => {
      if (res.ok) {
        const copy = res.clone();
        return caches.open(CACHE).then((c) => c.put('./index.html', copy)).then(() => res);
      }
      return res;
    });
    event.waitUntil(network.catch(() => {}));
    event.respondWith(new Promise((resolve) => {
      let settled = false;
      const finish = (res) => { if (!settled && res) { settled = true; resolve(res); } };
      const timer = setTimeout(() => {
        caches.match('./index.html').then(finish);
      }, NAV_TIMEOUT_MS);
      network
        .then((res) => { clearTimeout(timer); finish(res); })
        .catch(() => {
          clearTimeout(timer);
          caches.match('./index.html').then((c) => finish(c || Response.error()));
        });
    }));
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

  // Resto del mismo origen: caché primero
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      }))
    );
  }
});
