/* ARC House 5 Comfort Survey — offline service worker.
   Bump CACHE whenever index.html changes, or devices keep serving the old page. */
var CACHE = 'arc-survey-v2.4.0';

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

/* ---------- background sending ----------
   The page keeps a copy of its send queue in IndexedDB and registers a
   'arc-send' sync. The browser fires it when there is a connection — even if
   the app was closed long ago — and this sends whatever is still waiting.
   Google ignores a record it already has, so the page and this can never
   double up. A failure is re-thrown so the browser tries again later. */
var IDB_NAME = 'arc-survey';

function db(){
  return new Promise(function (res, rej) {
    var r = indexedDB.open(IDB_NAME, 1);
    r.onupgradeneeded = function () { r.result.createObjectStore('kv'); };
    r.onsuccess = function () { res(r.result); };
    r.onerror = function () { rej(r.error); };
  });
}
function dbGet(d, k){
  return new Promise(function (res, rej) {
    var r = d.transaction('kv').objectStore('kv').get(k);
    r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); };
  });
}
function dbPut(d, k, v){
  return new Promise(function (res, rej) {
    var t = d.transaction('kv', 'readwrite', {durability: 'strict'});
    t.objectStore('kv').put(v, k);
    t.oncomplete = function () { res(); }; t.onerror = t.onabort = function () { rej(t.error); };
  });
}
function rid(p){ return (p && (p.uid || p.submitted_at)) || ''; }

function sendWaiting(){
  return db().then(function (d) {
    return dbGet(d, 'config').then(function (cfg) {
      if (!cfg || !cfg.endpoint) return;
      return dbGet(d, cfg.queueKey).then(function (q) {
        var failed = false;
        return (q || []).reduce(function (chain, p) {
          return chain.then(function () {
            return fetch(cfg.endpoint, {
              method: 'POST',
              headers: {'Content-Type': 'text/plain;charset=utf-8'},
              body: JSON.stringify({token: cfg.token, fields: cfg.fields, row: p})
            }).then(function (r) { return r.text(); }).then(function (t) {
              if (t.indexOf('OK') !== 0) throw new Error(t.slice(0, 80));
              /* re-read both lists: the page may have changed them meanwhile */
              return Promise.all([dbGet(d, cfg.queueKey), dbGet(d, cfg.sentKey)]).then(function (r) {
                var rest = (r[0] || []).filter(function (x) { return rid(x) !== rid(p); });
                var sent = (r[1] || []).filter(function (x) { return rid(x.p) !== rid(p); });
                sent.push({p: p, at: Date.now(), how: 'sent'});
                return dbPut(d, cfg.queueKey, rest).then(function () { return dbPut(d, cfg.sentKey, sent); });
              });
            }).catch(function () { failed = true; });
          });
        }, Promise.resolve()).then(function () {
          if (failed) throw new Error('some records still waiting');
        });
      });
    });
  });
}

self.addEventListener('sync', function (e) {
  if (e.tag === 'arc-send') e.waitUntil(sendWaiting());
});
