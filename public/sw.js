// Service Worker — macht Gradefruit startfähig ohne Netz.
//
// SICHERHEITSREGEL, nicht verhandelbar: Antworten von /api/ werden NIE
// zwischengespeichert. Dort liegen die Kursinhalte hinter der Zugangsprüfung;
// ein Zwischenspeicher würde genau die Schranke aushebeln, die die Inhalte
// server-seitig schützt.
//
// Zwischengespeichert wird ausschließlich das Gerüst: die Seite selbst und die
// statischen Dateien, die Next.js unter /_next/static/ ausliefert. Die sind mit
// einer Prüfsumme im Namen versehen, ändern sich also bei jeder Version.

const VERSION = 'gf-v2';
const SHELL = `${VERSION}-shell`;
const OFFLINE_URL = '/offline.html';
// Das zuletzt geladene Seitengerüst. Ohne das startet die App ohne Netz gar
// nicht — und käme nie dazu, die abgelegten Kursinhalte zu lesen.
const SHELL_URL = '/';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL).then(cache => cache.addAll([OFFLINE_URL])),
  );
  // Sofort übernehmen, statt auf das Schließen aller Tabs zu warten. Ohne das
  // bliebe nach einem Fehler die alte Fassung hartnäckig aktiv.
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => !key.startsWith(VERSION)).map(key => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  );
});

// Notausstieg: Meldet sich die Seite mit 'gf-sw-abschalten', entfernt sich der
// Service Worker selbst und räumt seinen Speicher. Damit lässt sich ein Fehler
// auch dann noch beheben, wenn die Seite selbst nicht mehr lädt.
self.addEventListener('message', event => {
  if (event.data === 'gf-sw-abschalten') {
    event.waitUntil(
      caches.keys()
        .then(keys => Promise.all(keys.map(key => caches.delete(key))))
        .then(() => self.registration.unregister()),
    );
  }
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Kursinhalte, Kauf, Konto, KI: niemals anfassen.
  if (url.pathname.startsWith('/api/')) return;

  // Statische Dateien mit Prüfsumme im Namen: aus dem Speicher, sonst laden.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(hit => hit ?? fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(SHELL).then(cache => cache.put(request, copy));
        }
        return response;
      })),
    );
    return;
  }

  // Seitenaufrufe: erst das Netz, damit Änderungen sofort ankommen. Jede
  // erfolgreiche Antwort wird als Gerüst hinterlegt. Ohne Verbindung kommt
  // dieses Gerüst — damit startet die App und kann die abgelegten Inhalte
  // lesen. Erst wenn noch nie eines geladen wurde, die Ausweichseite.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(SHELL).then(cache => cache.put(SHELL_URL, copy));
          }
          return response;
        })
        .catch(() => caches.match(SHELL_URL)
          .then(hit => hit ?? caches.match(OFFLINE_URL))
          .then(hit => hit ?? new Response('Keine Verbindung.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          }))),
    );
  }
});
