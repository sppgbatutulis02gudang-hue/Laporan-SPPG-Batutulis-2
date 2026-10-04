/* Service worker pembungkus. Hanya menyimpan "kulit" halaman pembungkus ini.
   Aplikasi Apps Script di dalamnya TIDAK disimpan, jadi selalu versi terbaru. */
const CACHE = 'sppg-bt02-shell-v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  // Jaringan lebih dulu agar perubahan pembungkus langsung terbaca; cache hanya cadangan.
  e.respondWith(
    fetch(r).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(r, copy); });
      return res;
    }).catch(function () {
      return caches.match(r).then(function (m) { return m || caches.match('index.html'); });
    })
  );
});
