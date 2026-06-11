// Minimal shell cache so /capture opens with no network (the offline spark
// queue lives in the page itself, in localStorage). Site pages are untouched.
const CACHE = 'capture-shell-v1';
const SHELL = ['/capture/', '/manifest.webmanifest', '/fonts/Geist-Variable.woff2'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE && k.startsWith('capture-')).map((k) => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isShell =
    url.origin === location.origin &&
    (url.pathname === '/capture' || url.pathname === '/capture/' || SHELL.includes(url.pathname));
  if (!isShell) return;

  // Network first (fresh deploys win), cache fallback (subway-proof).
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(url.pathname === '/capture' ? '/capture/' : event.request, copy));
        return res;
      })
      .catch(() => caches.match(url.pathname === '/capture' ? '/capture/' : event.request))
  );
});
