// Service worker mínimo para PWA (instalable, sin caché agresivo)
const CACHE = "food-control-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// Estrategia: network-first — siempre intenta la red, usa caché solo si falla
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  // No cachear llamadas a la API
  if (event.request.url.includes("/auth") || event.request.url.includes("onrender.com")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copia = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copia));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
