var staticCacheName = 'restaurant-review-static-v1';

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll([
        '/',
        'restaurant.html',
        'js/dbhelper.js',
        'js/main.js',
        'js/restaurant_info.js',
        'css/styles.css',
        'img/offline-image.jpg',
        'data/restaurants.json',
        'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
        'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js'
      ]);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('restaurant-review-') &&
                 cacheName != staticCacheName;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  var requestUrl = new URL(event.request.url);

  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname.includes('restaurant.html')) {
      console.log('rest match');
      event.respondWith(caches.match('restaurant.html').then(function(response) {
        return response || fetch(event.request);
      }).catch(function(err) {
        console.log('error', err);
      }));
      return;
    }
  }

  if (requestUrl.pathname.endsWith('.jpg')) {
    event.respondWith(caches.match(requestUrl.pathname).then(function(response) {
      console.log(response);
      if (response) return response;

      return fetch(event.request).then(function(response) {
        return response;
      }).catch(function() {
        return caches.match('img/offline-image.jpg');
      });
    }).catch(function(err) {
      console.log('error', err);
    }));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
