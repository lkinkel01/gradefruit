'use client';

import { useEffect } from 'react';

/**
 * Meldet den Service Worker an, der Gradefruit ohne Netz startfähig macht.
 *
 * Bewusst zurückhaltend: nur im echten Betrieb (in der Entwicklung würde ein
 * Zwischenspeicher jede Änderung verschleiern), und mit einem Notausstieg.
 * Ein fehlerhafter Service Worker ist die einzige Änderung, die eine Seite
 * dauerhaft unbrauchbar machen kann — deshalb der Ausschalter.
 *
 * Notausstieg für den Ernstfall (in der Browser-Konsole aufrufbar):
 *   window.gradefruitServiceWorkerAus()
 */
export default function ServiceWorker() {
  // Das Lebenszeichen für die Notbremse in layout.tsx. Es steht bewusst hier:
  // Dieser Effekt läuft erst, wenn React tatsächlich angelaufen ist — genau das
  // ist die Bedingung, die bei einem weißen Bildschirm fehlt. Ohne dieses
  // Zeichen räumt die Notbremse nach acht Sekunden den Speicher und lädt neu.
  useEffect(() => {
    document.documentElement.setAttribute('data-gf-bereit', '1');
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    const w = window as Window & { gradefruitServiceWorkerAus?: () => Promise<void> };
    w.gradefruitServiceWorkerAus = async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      registrations.forEach(r => r.active?.postMessage('gf-sw-abschalten'));
      await Promise.all(registrations.map(r => r.unregister()));
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    };

    // Erst nach dem Laden anmelden, damit die Anmeldung nie mit dem ersten
    // Aufbau der Seite um Bandbreite konkurriert.
    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* Ohne Service Worker funktioniert alles wie bisher, nur ohne Offline. */
      });
    };
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });

    return () => window.removeEventListener('load', register);
  }, []);

  return null;
}
