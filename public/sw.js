const CACHE_NAME = "note-send-v1";
const URLS_TO_CACHE = ["/", "/index.html", "/manifest.json", "/vite.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

self.addEventListener("fetch", (event) => {
  // Ignorar requisições não-GET e extensões de chrome
  if (event.request.method !== "GET" || !event.request.url.startsWith("http")) {
    return;
  }

  // Se for uma requisição para a API (ex: notas), tenta a rede primeiro, depois cai pro cache
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clona a resposta e guarda no cache
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Se falhar (offline), tenta pegar do cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // Estratégia Cache First para arquivos estáticos
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
