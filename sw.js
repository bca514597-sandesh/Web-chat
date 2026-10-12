// Network-first: GitHub par naya version daalte hi update dikhega; internet na ho to purana chalega
const CACHE = 'webchat-v1';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;   // Firebase/CDN ko na chhuen
  e.respondWith(
    fetch(r).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(r, copy));
      return res;
    }).catch(() => caches.match(r).then((m) => m || caches.match('./index.html')))
  );
});
