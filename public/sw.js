// Service Worker pou Citadel Ciné — pèmèt enstalasyon kòm app AK videyo offline
const VIDEO_CACHE = "citadel-videos-v1";

self.addEventListener("install", (e) => self.skipWaiting());
self.addEventListener("activate", (e) => self.clients.claim());

self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Si se yon videyo Bunny, sove yon kopi nan cache la pou pita
        if (e.request.url.includes("b-cdn.net") && e.request.method === "GET") {
          const resClone = res.clone();
          caches.open(VIDEO_CACHE).then((cache) => cache.put(e.request, resClone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

