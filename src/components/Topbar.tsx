'use client';
import { useEffect, useRef, useState } from 'react';
import { NavigateTo, TopicTab, View } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import { MenuIcon, MoonIcon, SunIcon } from './UiIcons';
import styles from './Topbar.module.css';

const LABELS: Partial<Record<View, string>> = {
  dashboard: 'Dashboard',
  analysis: 'Analysis',
  linalg: 'Lineare Algebra & Geometrie',
  stochastik: 'Stochastik',
  videos: 'Erklärvideos',
  review: 'Wiederholen',
  tutors: '1:1 Nachhilfe',
  account: 'Mein Konto',
};

// Themenseiten besitzen eine zweite Brotkrumen-Ebene (den aktiven Tab).
const TOPIC_VIEWS: View[] = ['analysis', 'linalg', 'stochastik'];
const TAB_LABELS = { zusammenfassung: 'Zusammenfassung', uebungen: 'Übungen' } as const;

interface Props {
  view: View;
  topicTab: TopicTab;
  topicItemLabel: string | null;
  dark: boolean;
  onToggleDark: () => void;
  onOpenNav: () => void;
  onNavigate: NavigateTo;
  onOpenAuth: () => void;
}

export default function Topbar({ view, topicTab, topicItemLabel, dark, onToggleDark, onOpenNav, onNavigate, onOpenAuth }: Props) {
  const { user } = useAuth();
  const initials = user ? (user.user_metadata?.full_name || user.email || 'U').slice(0, 2).toUpperCase() : null;

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let frame = 0;
    // Im Lernbereich scrollt nicht das Fenster, sondern <body> (globals.css
    // setzt height:100% + overflow-x:hidden). Scroll-Ereignisse von Elementen
    // steigen nicht auf — deshalb in der Capture-Phase am document lauschen
    // und den Stand vom tatsächlichen Scroll-Container lesen.
    const readY = (target: EventTarget | null) => {
      if (target instanceof HTMLElement) return Math.max(0, target.scrollTop);
      if (target === document || target === window) {
        return Math.max(0, window.scrollY || document.documentElement.scrollTop || document.body.scrollTop);
      }
      return Math.max(0, window.scrollY);
    };

    const apply = (nextY: number) => {
      const delta = nextY - lastScrollY.current;
      setScrolled(nextY > 12);
      setHidden(nextY > 96 && delta > 3);
      if (nextY < 20 || delta < -3) setHidden(false);
      lastScrollY.current = nextY;
    };

    const onScroll = (event: Event) => {
      if (frame) return;
      const nextY = readY(event.target);
      frame = requestAnimationFrame(() => {
        frame = 0;
        apply(nextY);
      });
    };

    apply(Math.max(0, window.scrollY || document.body.scrollTop));
    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => {
      document.removeEventListener('scroll', onScroll, { capture: true } as EventListenerOptions);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className={`${styles.topbar} ${scrolled ? styles.scrolled : ''} ${hidden ? styles.hidden : ''}`}>
      <button type="button" className={styles.hamb} onClick={onOpenNav} aria-label="Menü">
        <MenuIcon size={20} />
      </button>
      <nav className={styles.crumbs} aria-label="Brotkrumen-Navigation">
        <button type="button" className={styles.crumbLink} onClick={() => onNavigate('dashboard')} aria-label="Zum Dashboard">
          Gradefruit
        </button>
        <span className={styles.sep} aria-hidden="true">›</span>
        {TOPIC_VIEWS.includes(view) ? (
          <>
            <button
              type="button"
              className={`${styles.crumbLink} ${styles.crumbMid}`}
              onClick={() => onNavigate(view, { tab: topicTab, itemId: null })}
            >
              {LABELS[view]}
            </button>
            <span className={styles.sep} aria-hidden="true">›</span>
            {topicItemLabel ? (
              <>
                <button
                  type="button"
                  className={`${styles.crumbLink} ${styles.crumbMid}`}
                  onClick={() => onNavigate(view, { tab: topicTab, itemId: null })}
                >
                  {TAB_LABELS[topicTab]}
                </button>
                <span className={styles.sep} aria-hidden="true">›</span>
                <span className={styles.here} aria-current="page">{topicItemLabel}</span>
              </>
            ) : (
              <button
                type="button"
                className={`${styles.crumbLink} ${styles.hereLink}`}
                aria-current="page"
                onClick={() => onNavigate(view, { tab: topicTab, itemId: null })}
              >
                {TAB_LABELS[topicTab]}
              </button>
            )}
          </>
        ) : (
          <span className={styles.here} aria-current="page">{LABELS[view] ?? view}</span>
        )}
      </nav>
      <button type="button" className={styles.darkBtn} onClick={onToggleDark} aria-label={dark ? 'Hellmodus aktivieren' : 'Dunkelmodus aktivieren'} title={dark ? 'Hellmodus' : 'Dunkelmodus'}>
        {dark ? (
          <SunIcon size={16} />
        ) : (
          <MoonIcon size={16} />
        )}
      </button>
      {user ? (
        <button type="button" className={styles.avatarBtn} onClick={() => onNavigate('account')} aria-label="Mein Konto öffnen" title="Mein Konto">
          {initials}
        </button>
      ) : (
        <button type="button" className={styles.loginBtn} onClick={onOpenAuth}>Anmelden</button>
      )}
    </div>
  );
}
