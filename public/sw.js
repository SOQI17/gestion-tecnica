// Service worker mínimo: solo habilita la instalación como PWA.
// No cachea nada a propósito (la app depende de datos en vivo de Firestore),
// así que todas las peticiones de red se comportan exactamente igual que sin él.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
