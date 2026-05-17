const CACHE_NAME = "kakeibo-shell-v1";

function pathFromScope(path) {
  return new URL(path, self.registration.scope).pathname;
}

const APP_SHELL = [
  pathFromScope("./"),
  pathFromScope("./manifest.webmanifest"),
  pathFromScope("./icon-192.png"),
  pathFromScope("./icon-512.png"),
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match(pathFromScope("./"))));
    return;
  }

  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
