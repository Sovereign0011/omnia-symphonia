const CACHE = "omnia-shell-v1";
const SHELL = ["./", "./index.html", "./styles.css", "./app.js", "./manifest.webmanifest"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;
  // Network-first for navigation, cache-first for local app assets.
  if (req.mode === "navigate") {
    event.respondWith(fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(cache => cache.put("./index.html", copy)); return res;
    }).catch(() => caches.match("./index.html")));
  } else if (["style", "script"].includes(req.destination) || url.pathname.endsWith("manifest.webmanifest")) {
    event.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) caches.open(CACHE).then(cache => cache.put(req, res.clone()));
      return res;
    })));
  }
});
