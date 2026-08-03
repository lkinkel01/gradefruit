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

// Die Nummer hochzählen, wenn ein zwischengespeichertes Gerüst Ärger machen
// könnte: `activate` löscht dann alles, was nicht mit der neuen Nummer beginnt.
//
// Warum das nötig sein kann: Das Gerüst (die HTML-Seite) verweist auf
// JavaScript-Dateien mit einer Prüfsumme im Namen. Nach mehreren
// Veröffentlichungen an einem Tag kann ein älteres Gerüst im Speicher liegen,
// dessen Dateien es auf dem Server nicht mehr gibt — die Seite lädt dann, findet
// ihren Code nicht und bleibt weiß. Ein Sprung der Nummer räumt das ab.
// v3: nach den Veröffentlichungen vom 30./31.07.2026.
// v4: räumt die vergifteten Gerüste ab — bis hierhin konnte unter „/" die
//     zuletzt besuchte Unterseite liegen (siehe unten beim Seitenaufruf).
// v5: legt das Gerüst schon beim Einrichten ab (vorher brauchte es dafür einen
//     zweiten Seitenaufruf — nach jeder Veröffentlichung war Offline also
//     genau so lange kaputt) und speichert auch Bilder und Schriften.
const VERSION = 'gf-v5';
const SHELL = `${VERSION}-shell`;
const OFFLINE_URL = '/offline.html';
// Das zuletzt geladene Seitengerüst. Ohne das startet die App ohne Netz gar
// nicht — und käme nie dazu, die abgelegten Kursinhalte zu lesen.
const SHELL_URL = '/';

self.addEventListener('install', event => {
  // Gerüst UND Ausweichseite sofort holen.
  //
  // Vorher lag hier nur die Ausweichseite. Das Gerüst wurde erst beim nächsten
  // Seitenaufruf abgelegt — und den gibt es in der App erst beim nächsten
  // Start. Nach jeder Veröffentlichung war Offline deshalb einen Start lang
  // wirkungslos, ohne dass man es merkte.
  //
  // `reload` erzwingt eine frische Antwort: Ein Gerüst aus dem Browser-Speicher
  // kann auf Dateien zeigen, die es nach der Veröffentlichung nicht mehr gibt.
  event.waitUntil(
    caches.open(SHELL).then(cache => cache.addAll([
      new Request(SHELL_URL, { cache: 'reload' }),
      new Request(OFFLINE_URL, { cache: 'reload' }),
    ])).catch(() => {
      /* Beim Einrichten ohne Netz: Das Gerüst kommt beim ersten Aufruf mit Netz. */
    }),
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

  // Statische Dateien: Next.js-Bündel (Prüfsumme im Namen) sowie Bilder und
  // Schriften aus /public. Ohne die zweite Hälfte startet die App ohne Netz
  // zwar, aber ohne Logo und ohne Bilder — es sieht kaputt aus, obwohl es
  // funktioniert.
  const istStatisch = url.pathname.startsWith('/_next/static/')
    || /\.(?:png|jpg|jpeg|svg|webp|avif|woff2?|ico)$/.test(url.pathname);
  if (istStatisch) {
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

  // Seitenaufrufe: erst das Netz, damit Änderungen sofort ankommen. Ohne
  // Verbindung kommt das hinterlegte Gerüst — damit startet die App und kann
  // die abgelegten Inhalte lesen. Erst wenn noch nie eines geladen wurde, die
  // Ausweichseite.
  if (request.mode === 'navigate') {
    // NUR die Startseite darf das Gerüst sein.
    //
    // Vorher wurde JEDE erfolgreiche Seitenantwort unter dem Schlüssel „/"
    // abgelegt. Wer zuletzt `/passwort-neu` geöffnet hatte, bekam beim nächsten
    // Aufruf von gradefruit.de dessen Seite serviert — die Adresse stimmte, der
    // Inhalt nicht. Ein Gerüst, das irgendeine Unterseite sein kann, ist kein
    // Gerüst.
    const istStartseite = new URL(request.url).pathname === SHELL_URL;
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok && istStartseite) {
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
