/* Thiên Số — Service Worker (Hỗ trợ PWA & Offline) */
'use strict';

var CACHE_NAME = 'thienso-v1';
var STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/css/styles.css',
  './assets/images/og-image.svg',
  './assets/js/data.js',
  './assets/js/data-numbers.js',
  './assets/js/data-cycles.js',
  './assets/js/lunar.js',
  './assets/js/iching.js',
  './assets/js/data-hexagrams.js',
  './assets/js/data-tarot.js',
  './assets/js/effects.js',
  './assets/js/app.js',
  './assets/js/iching-ui.js',
  './assets/js/tarot-ui.js'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(STATIC_ASSETS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (k) {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  var url = new URL(event.request.url);

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then(function (cached) {
        if (cached) return cached;
        return fetch(event.request).then(function (response) {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, clone);
          });
          return response;
        });
      })
    );
  }
});
