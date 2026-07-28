'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import styles from './ScreenGuard.module.css';

/**
 * Verdeckt die Kursinhalte, sobald der Bildschirm abfotografiert oder
 * aufgezeichnet werden könnte.
 *
 * Wie das funktioniert: Eine Webseite kann Screenshots nicht abfangen — das
 * kann nur das Betriebssystem. Aber die macOS-Screenshot-Auswahl
 * (Cmd+Shift+3/4/5) und Aufnahme-Programme nehmen dem Browserfenster den
 * Fokus, und das merkt die Seite. Sobald der Fokus weg ist, legt sich eine
 * Sperre über den Inhalt; sie verschwindet, sobald das Fenster wieder aktiv
 * ist. Unter Windows wird zusätzlich die Druck-Taste abgefangen.
 *
 * Grenzen, damit niemand sich in falscher Sicherheit wiegt: Screenshots am
 * Handy lösen keinen Fokuswechsel aus und werden damit nicht erfasst, und
 * abfotografieren mit einer Kamera lässt sich ohnehin nie verhindern.
 */
export default function ScreenGuard() {
  const { user } = useAuth();
  const [covered, setCovered] = useState(false);

  useEffect(() => {
    if (!user) return;
    let releaseTimer = 0;

    const cover = () => setCovered(true);
    const release = () => setCovered(false);

    const onKeyDown = (event: KeyboardEvent) => {
      // Windows/Linux: Druck-Taste. macOS fängt seine eigenen Kürzel selbst
      // ab — dort greift stattdessen der Fokusverlust unten.
      const key = event.key;
      if (key === 'PrintScreen' || key === 'F13') {
        cover();
        window.clearTimeout(releaseTimer);
        releaseTimer = window.setTimeout(release, 1400);
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') cover();
      else release();
    };

    window.addEventListener('blur', cover);
    window.addEventListener('focus', release);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(releaseTimer);
      window.removeEventListener('blur', cover);
      window.removeEventListener('focus', release);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [user]);

  if (!user || !covered) return null;

  return (
    <div className={styles.guard} role="status" aria-live="polite">
      <div className={styles.badge}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="4" y="10.5" width="16" height="10" rx="2.4" />
          <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
        </svg>
        <strong>Inhalt geschützt</strong>
        <span>Klick ins Fenster, um weiterzulernen.</span>
      </div>
    </div>
  );
}
