// Manillas Coloridas: guarda la app en el teléfono para que funcione sin internet.
// Cambia VERSION cada vez que actualices algún archivo.
const VERSION = 'manillas-v1';
const FILES = [
  './',
  './index.html',
  './three.min.js',
  './manifest.webmanifest',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './fonts/fredoka-latin-500-normal.woff2',
  './fonts/fredoka-latin-600-normal.woff2',
  './fonts/nunito-latin-400-normal.woff2',
  './fonts/nunito-latin-600-normal.woff2',
  './fonts/nunito-latin-700-normal.woff2',
  './fonts/nunito-latin-800-normal.woff2'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// La página se busca primero en internet (para recibir actualizaciones) y, si no hay señal, se usa la copia guardada.
// El resto de archivos se sirven desde la copia guardada.
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put('./index.html', copy)); return res; })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }
  event.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
