'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { View } from '@/lib/types';
import styles from './AppTabBar.module.css';

/**
 * Untere Navigationsleiste — nur in der App.
 *
 * Am Handy ist die ausfahrbare Seitenleiste ein Website-Muster: Sie versteckt
 * die Navigation hinter einem Knopf und liegt außerhalb der Daumenreichweite.
 * Vier feste Ziele am unteren Rand sind das, was in einer App erwartet wird.
 */
const ZIELE: { view: View | 'feed'; label: string; icon: ReactNode }[] = [
  {
    view: 'dashboard',
    label: 'Lernen',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2v13a1.5 1.5 0 0 0-1.5-1.5h-5A1.5 1.5 0 0 1 4 16z" />
        <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2v13a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 0 20 16z" />
      </svg>
    ),
  },
  {
    view: 'themen',
    label: 'Themen',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" />
        <circle cx="4.5" cy="6" r="1.2" /><circle cx="4.5" cy="12" r="1.2" /><circle cx="4.5" cy="18" r="1.2" />
      </svg>
    ),
  },
  {
    view: 'review',
    label: 'Wiederholen',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 0 1 15.3-6.4L21 8" /><path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-15.3 6.4L3 16" /><path d="M3 21v-5h5" />
      </svg>
    ),
  },
  {
    view: 'feed',
    label: 'Reels',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="3" width="14" height="18" rx="3" /><polyline points="9.5 12.5 12 10 14.5 12.5" /><line x1="12" y1="10" x2="12" y2="15.5" />
      </svg>
    ),
  },
  {
    view: 'account',
    label: 'Konto',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="3.6" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
      </svg>
    ),
  },
];

export default function AppTabBar({
  view,
  onNavigate,
  onReels,
  dunkel = false,
}: {
  view: View;
  onNavigate: (v: View) => void;
  onReels: () => void;
  /** Der Reel-Modus ist immer dunkel, unabhängig vom gewählten Erscheinungsbild. */
  dunkel?: boolean;
}) {
  // Beim Herunterscrollen rückt die Leiste zusammen und die Beschriftungen
  // treten zurück, wie bei Instagram. Der Inhalt bekommt dadurch Platz, ohne
  // dass die Navigation je verschwindet.
  const [kompakt, setKompakt] = useState(false);
  const letzte = useRef(0);

  useEffect(() => {
    // In der App scrollt der Seitenkörper, nicht das Dokument — deshalb beide
    // Quellen abfragen. Genau daran ist eine frühere Fassung gescheitert.
    const position = () => window.scrollY || document.scrollingElement?.scrollTop || 0;
    let warten = false;

    const beobachten = () => {
      if (warten) return;
      warten = true;
      requestAnimationFrame(() => {
        warten = false;
        const jetzt = position();
        // Kleine Bewegungen ignorieren, sonst zappelt die Leiste beim Wippen.
        if (Math.abs(jetzt - letzte.current) < 6) return;
        setKompakt(jetzt > letzte.current && jetzt > 40);
        letzte.current = jetzt;
      });
    };

    window.addEventListener('scroll', beobachten, { passive: true });
    document.addEventListener('scroll', beobachten, { passive: true, capture: true });
    return () => {
      window.removeEventListener('scroll', beobachten);
      document.removeEventListener('scroll', beobachten, { capture: true });
    };
  }, []);

  return (
    <nav
      className={`${styles.leiste} ${dunkel ? styles.dunkel : ''} ${kompakt ? styles.kompakt : ''}`}
      aria-label="Hauptnavigation"
    >
      {ZIELE.map(ziel => {
        const aktiv = ziel.view === view;
        return (
          <button
            key={ziel.label}
            type="button"
            className={`${styles.ziel} ${aktiv ? styles.aktiv : ''}`}
            aria-current={aktiv ? 'page' : undefined}
            onClick={() => (ziel.view === 'feed' ? onReels() : onNavigate(ziel.view as View))}
          >
            <span className={styles.icon} aria-hidden="true">{ziel.icon}</span>
            <span className={styles.label}>{ziel.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
