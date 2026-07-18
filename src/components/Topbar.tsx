'use client';
import { useEffect, useState } from 'react';
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

interface Props {
  view: View;
  dark: boolean;
  onToggleDark: () => void;
  onOpenNav: () => void;
  onNavigate: (v: View) => void;
  onOpenAuth: () => void;
}

export default function Topbar({ view, dark, onToggleDark, onOpenNav, onNavigate, onOpenAuth }: Props) {
  const { user } = useAuth();
  const initials = user ? (user.user_metadata?.full_name || user.email || 'U').slice(0, 2).toUpperCase() : null;

  // Scroll-Edge (Apple): die Leiste ist am Seitenanfang randlos und bekommt
  // erst beim Scrollen eine feine Trennung + Schatten – schwebt über dem Inhalt.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={`${styles.topbar} ${scrolled ? styles.scrolled : ''}`}>
      <button type="button" className={styles.hamb} onClick={onOpenNav} aria-label="Menü">
        <MenuIcon size={20} />
      </button>
      <div className={styles.crumbs}>
        <span>Gradefruit</span>
        <span className={styles.sep}>›</span>
        <span className={styles.here}>{LABELS[view] ?? view}</span>
      </div>
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
