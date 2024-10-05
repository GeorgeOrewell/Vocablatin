const CACHE_NAME = 'vocab-trainer-cache-v1'; // Cache-Name mit Versionierung
const urlsToCache = [
  '/', // Hauptseite
  '/index.html',
  '/styles.css', // CSS-Dateien
  '/script.js', // Haupt-JavaScript-Datei
  '/assets/correct.mp3', // Sound-Dateien
  '/assets/wrong2.mp3',
  '/assets/background1.mp3',
  '/assets/background4.mp3',
  '/manifest.json', // Manifest-Datei für PWA
  '/assets/icon-small.png',

  // Weitere Ressourcen wie Bilder, Fonts oder Lektionen hinzufügen
];

// Funktion zum Hinzufügen der Lektionen zum Cache-Array
function addLessonsToCache(language) {
  for (let i = 1; i <= 20; i++) {
    urlsToCache.push(`/${language}/lektion${i}.json`); // Beispiel-Pfad für Lektionen
  }
}

// Lektionen für Latein und Französisch hinzufügen
addLessonsToCache('latein');
addLessonsToCache('franzoesisch');


// Installation des Service Workers
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching all resources');
      return cache.addAll(urlsToCache);
    })
  );
});

// Aktivierung des Service Workers
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache); // Alte Caches löschen
          }
        })
      );
    })
  );
});

// Ressourcen abrufen
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response; // Wenn Ressource im Cache ist, diese zurückgeben
      }
      return fetch(event.request).then((networkResponse) => {
        // Netzwerkanfrage, wenn Ressource nicht im Cache ist
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone()); // Neue Ressourcen zwischenspeichern
          return networkResponse;
        });
      });
    })
  );
});
