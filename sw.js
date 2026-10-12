// Network-first: GitHub par naya version daalte hi update dikhega; internet na ho to purana chalega
const CACHE = 'webchat-v2';
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

// Notification par dabane par app khule aur us chat par jaye
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const key = e.notification.data && e.notification.data.key;
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ('focus' in c) { c.postMessage({ key: key }); return c.focus(); }
      }
      return self.clients.openWindow('./');
    })
  );
});
