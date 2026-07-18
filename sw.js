/* Kaiser PWA Service Worker — Netzwerk zuerst für die Seite (immer aktuelle
   Version), Cache als Offline-Fallback; Assets stale-while-revalidate. */
const CACHE = "kaiser-v16";
const DATEIEN = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(DATEIEN)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const istSeite = e.request.mode === "navigate" || e.request.destination === "document";
  if (istSeite) {
    /* Netzwerk zuerst: neue Spielversionen kommen sofort an */
    e.respondWith(
      fetch(e.request).then(res => {
        const kopie = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, kopie));
        return res;
      }).catch(() =>
        caches.match(e.request).then(hit => hit || caches.match("index.html"))
      )
    );
  } else {
    /* Assets: Cache sofort, im Hintergrund auffrischen */
    e.respondWith(
      caches.match(e.request).then(hit => {
        const laden = fetch(e.request).then(res => {
          const kopie = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, kopie));
          return res;
        }).catch(() => hit);
        return hit || laden;
      })
    );
  }
});
