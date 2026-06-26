'use client';
import { View } from '@/lib/types';
import styles from './Topbar.module.css';

const LABELS: Partial<Record<View, string>> = {
  dashboard: 'Übersicht',
  analysis: 'Analysis',
  linalg: 'Lineare Algebra & Geometrie',
  stochastik: 'Stochastik',
  videos: 'Erklärvideos',
  saved: 'Gespeichert',
  tutors: '1:1 Nachhilfe',
};

interface Props {
  view: View;
  dark: boolean;
  onToggleDark: () => void;
  onOpenNav: () => void;
}

export default function Topbar({ view, dark, onToggleDark, onOpenNav }: Props) {
  return (
    <div className={styles.topbar}>
      <button className={styles.hamb} onClick={onOpenNav} aria-label="Menü">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <div className={styles.crumbs}>
        <span>Gradefruit</span>
        <span className={styles.sep}>›</span>
        <span className={styles.here}>{LABELS[view] ?? view}</span>
      </div>
      <button className={styles.darkBtn} onClick={onToggleDark} title={dark ? 'Hellmodus' : 'Dunkelmodus'}>
        {dark ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
          </svg>
        )}
      </button>
      <div className={styles.shield}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        Sichere Verbindung
      </div>
    </div>
  );
}
