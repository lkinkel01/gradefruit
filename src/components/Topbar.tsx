'use client';
import { useEffect, useRef, useState } from 'react';
import { View } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import { MenuIcon, MoonIcon, SunIcon } from './UiIcons';
import styles from './Topbar.module.css';

const LABELS: Partial<Record<View, string>> = {
  dashboard: 'Übersicht',
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
  topicTab: 'zusammenfassung' | 'uebungen';
  topicSection: string | null;
  dark: boolean;
  onToggleDark: () => void;
  onOpenNav: () => void;
  onNavigate: (v: View) => void;
  onOpenAuth: () => void;
}

export default function Topbar({ view, topicTab, topicSection, dark, onToggleDark, onOpenNav, onNavigate, onOpenAuth }: Props) {
  const { user } = useAuth();
  const initials = user ? (user.user_metadata?.full_name || user.email || 'U').slice(0, 2).toUpperCase() : null;

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const nextY = Math.max(0, window.scrollY);
        const delta = nextY - lastScrollY.current;
        setScrolled(nextY > 12);
        setHidden(nextY > 96 && delta > 3);
        if (nextY < 20 || delta < -3) setHidden(false);
        lastScrollY.current = nextY;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className={`${styles.topbar} ${scrolled ? styles.scrolled : ''} ${hidden ? styles.hidden : ''}`}>
      <button type="button" className={styles.hamb} onClick={onOpenNav} aria-label="Menü">
        <MenuIcon size={20} />
      </button>
      <nav className={styles.crumbs} aria-label="Brotkrumen-Navigation">
        <button type="button" className={styles.crumbLink} onClick={() => onNavigate('dashboard')} aria-label="Zur Übersicht">
          Gradefruit
        </button>
        <span className={styles.sep} aria-hidden="true">›</span>
        {TOPIC_VIEWS.includes(view) ? (
          <>
            <button type="button" className={`${styles.crumbLink} ${styles.crumbMid}`} onClick={() => onNavigate(view)}>
              {LABELS[view]}
            </button>
            <span className={styles.sep} aria-hidden="true">›</span>
            {topicSection && topicTab === 'zusammenfassung' ? (
              <>
                <span className={`${styles.crumbLevel} ${styles.crumbMid}`}>{TAB_LABELS[topicTab]}</span>
                <span className={styles.sep} aria-hidden="true">›</span>
                <span className={styles.here} aria-current="page">{topicSection}</span>
              </>
            ) : (
              <span className={styles.here} aria-current="page">{TAB_LABELS[topicTab]}</span>
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
