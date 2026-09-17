/* ARC House 5 Comfort Survey — offline service worker.
   Bump CACHE whenever index.html changes, or devices keep serving the old page. */
var CACHE = 'arc-survey-v2.2.0';

var ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './fonts/ubuntu-300.woff2',
  './fonts/ubuntu-400.woff2',
  './fonts/ubuntu-500.woff2',
  './fonts/ubuntu-700.woff2',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.map(function (k) {
          return k === CACHE ? null : caches.delete(k);
        }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;

  // Never touch the submission POST, and never touch Apps Script. A cached or
  // replayed survey submission would be worse than a failed one — the page
  // already queues failures itself.
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  // Stale-while-revalidate: instant offline, and picks up a new version
  // in the background whenever there is a connection.
  e.respondWith(
    caches.match(req).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () {
        if (hit) return hit;
        if (req.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      });
      return hit || net;
    })
  );
});
