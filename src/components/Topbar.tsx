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
const TAB_LABELS: Record<TopicTab, string> = { uebersicht: 'Übersicht', zusammenfassung: 'Zusammenfassung', uebungen: 'Übungen' };

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
  const { user, anzeigeName } = useAuth();
  // Kürzel: Vor- und Nachname (Leon Kinkel → LK). Ohne Nachnamen die ersten
  // beiden Buchstaben des Vornamens (Leon → LE); ohne Namen der Benutzername;
  // ohne beides die E-Mail. Anders als bei der Begrüßung braucht die Kachel
  // zwingend etwas — sie wäre sonst leer.
  const initials = (() => {
    if (!user) return null;
    const name = anzeigeName?.trim();
    if (name) {
      const parts = name.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (user.email || 'U').slice(0, 2).toUpperCase();
  })();

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
      // Beim Scrollen verschwindet die Leiste komplett; sie kommt erst
      // wieder, wenn man ganz oben ist.
      setHidden(nextY > 8);
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
        {TOPIC_VIEWS.includes(view) && topicTab !== 'uebersicht' ? (
          <>
            <button
              type="button"
              className={`${styles.crumbLink} ${styles.crumbMid}`}
              onClick={() => onNavigate(view, { tab: 'uebersicht', itemId: null })}
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
