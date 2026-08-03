'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { STATUS_LABEL, type LernStatus } from '@/lib/types';
import styles from './TopicMenu.module.css';

// Ampel wie überall: grün = verstanden, gelb = wiederholen, rot = unklar.
const STATUS_FARBE: Record<Exclude<LernStatus, 'none'>, string> = {
  verstanden: 'var(--green)',
  wiederholen: 'var(--yellow)',
  unklar: 'var(--danger)',
};

export interface MenuEintrag {
  key: string;
  nummer: number;
  label: string;
  status: LernStatus;
  aktiv: boolean;
}

/**
 * Sprungliste für Zusammenfassung und Übungen.
 *
 * Im Browser steht sie dauerhaft in der Seitenleiste. In der App gibt es die
 * nicht — dort musste man bisher jedes Mal zurück in die Liste, um zum nächsten
 * Abschnitt zu kommen. Drei Striche öffnen sie von links, wie man es von jeder
 * App kennt, die ein Inhaltsverzeichnis hat.
 *
 * Per Portal an `document.body`: Die Themenseite trägt eine Einstiegs-Animation
 * (transform), und die fängt ein `position: fixed` sonst ein.
 */
export default function TopicMenu({
  offen,
  titel,
  eintraege,
  onWaehlen,
  onClose,
}: {
  offen: boolean;
  titel: string;
  eintraege: MenuEintrag[];
  onWaehlen: (key: string) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!offen) return;
    const beiTaste = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', beiTaste);
    return () => window.removeEventListener('keydown', beiTaste);
  }, [offen, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      <div
        className={`${styles.schleier} ${offen ? styles.offen : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`${styles.lade} ${offen ? styles.offen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={titel}
      >
        <div className={styles.kopf}>
          <span className={styles.kopfTitel}>{titel}</span>
          <button type="button" className={styles.zu} onClick={onClose} aria-label="Menü schließen">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className={styles.liste}>
          {eintraege.map(eintrag => (
            <button
              key={eintrag.key}
              type="button"
              className={`${styles.zeile} ${eintrag.aktiv ? styles.zeileAktiv : ''}`}
              aria-current={eintrag.aktiv ? 'true' : undefined}
              onClick={() => { onWaehlen(eintrag.key); onClose(); }}
            >
              <span className={styles.nummer}>{eintrag.nummer}</span>
              <span className={styles.label}>{eintrag.label}</span>
              {eintrag.status === 'none' ? (
                <span className={styles.punktLeer} aria-hidden="true" />
              ) : (
                <span
                  className={styles.punkt}
                  style={{ background: STATUS_FARBE[eintrag.status] }}
                  aria-label={STATUS_LABEL[eintrag.status]}
                />
              )}
            </button>
          ))}
        </nav>
      </aside>
    </>,
    document.body,
  );
}
