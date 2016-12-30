self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('cache-v2').then(function(cache) {
      return cache.addAll([
        '/css/materializenew.min.css',
        '/js/script.min.css'
      ]);
    })
  );
});
