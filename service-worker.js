'use strict';

var version = 'v2::';
var rainbows = 'https://i.imgur.com/EgwCMYB.jpg';
var offlineFundamentals = [
  '/',
  '/en/',
  '/all.css',
  rainbows
];

self.addEventListener('install', installer);
self.addEventListener('activate', activator);
self.addEventListener('fetch', fetcher);

function installer (e) {
  if ('skipWaiting' in self) {
    self.skipWaiting();
  }
  e.waitUntil(caches.open(version + 'fundamentals').then(function prefill (cache) {
    return cache.addAll(offlineFundamentals);
  }));
}

function activator (e) {
  if ('clients' in self && self.clients.claim) {
    self.clients.claim();
  }

  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys
        .filter(function (key) {
          return key.indexOf(version) !== 0;
        })
        .map(function (key) {
          return caches.delete(key);
        })
      );
    })
  );
}

function fetcher (e) {
  var request = e.request;
  if (request.method !== 'GET') {
    return;
  }
  e.respondWith(caches.match(request).then(function queriedCache (cached) {
    return cached || fetch(request).then(function fetchedFromNetwork (response) {
      var cacheCopy = response.clone();
      caches.open(version + 'pages').then(function add (cache) {
        cache.put(request, cacheCopy);
      });
      return response;
    });
  }));
}
