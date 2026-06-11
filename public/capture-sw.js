// Minimal shell cache so the Companion surfaces open with no network (the
// offline spark queue lives in the Capture page itself, in localStorage).
// Site pages are untouched. Also handles the scheduled pushes: they are sent
// without a payload (VAPID wake-up only), so the text is fixed here. Two
// crons exist — Tuesday brief and Friday desk — and a payload-less push
// can't say which fired, so the weekday picks the notification.
const CACHE = 'capture-shell-v3';
const SHELL = ['/capture/', '/interview/', '/desk/', '/manifest.webmanifest', '/fonts/Geist-Variable.woff2'];

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

function shellPath(pathname) {
  if (pathname === '/capture' || pathname === '/capture/') return '/capture/';
  if (pathname === '/interview' || pathname === '/interview/') return '/interview/';
  if (pathname === '/desk' || pathname === '/desk/') return '/desk/';
  return SHELL.includes(pathname) ? pathname : null;
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== location.origin || event.request.method !== 'GET') return;
  const path = shellPath(url.pathname);
  if (!path) return;

  // Network first (fresh deploys win), cache fallback (subway-proof).
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(path, copy));
        return res;
      })
      .catch(() => caches.match(path))
  );
});

self.addEventListener('push', (event) => {
  // Friday (or Thursday evening west of the cron's timezone) → the desk push.
  const day = new Date().getDay();
  const desk = day === 5 || day === 4;
  event.waitUntil(
    self.registration.showNotification("Q's Notes", {
      body: desk
        ? 'The desk has drafts waiting. Ship, one change, or downgrade — five minutes.'
        : 'This week’s interview brief is ready. 15–30 min, any language, fragments welcome.',
      icon: '/icons/capture-192.png',
      badge: '/icons/capture-192.png',
      tag: desk ? 'qnotes-desk' : 'qnotes-brief',
      data: { url: desk ? '/desk/' : '/interview/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/interview/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const win of wins) {
        if (new URL(win.url).pathname === url && 'focus' in win) return win.focus();
      }
      return clients.openWindow(url);
    })
  );
});
