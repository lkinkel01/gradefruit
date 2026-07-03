'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import styles from './Modal.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  course?: 'gk' | 'lk';
}

// Anzeige-Texte je Kurs. WICHTIG: Die hier gezeigten Preise sind nur Anzeige –
// abgerechnet wird IMMER der echte Stripe-Preis. Halte beide Werte gleich.
const COURSE_INFO = {
  gk: {
    tag: 'Mathe-Abi Hessen 2027 · Grundkurs',
    title: 'Vollzugang',
    blurb: 'Alle Grundkurs-Themen, prüfungsnahe Übungsaufgaben, Erklärvideos und Fragen an die KI.',
    full: '79 €',
    month: '14,90 €',
  },
  lk: {
    tag: 'Mathe-Abi Hessen 2027 · Leistungskurs',
    title: 'LK-Vollzugang',
    blurb: 'Alle Leistungskurs-Themen, prüfungsnahe Übungsaufgaben, Erklärvideos und Fragen an die KI.',
    full: '99 €',
    month: '17,90 €',
  },
} as const;

export default function CheckoutModal({ open, onClose, course = 'gk' }: Props) {
  const { session } = useAuth();
  const [selected, setSelected] = useState<'full' | 'month'>('full');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const info = COURSE_INFO[course];

  async function startCheckout() {
    if (busy) return;
    if (!session?.access_token) {
      setError('Bitte melde dich zuerst an, um den Zugang zu kaufen.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan: selected, course }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.url) {
        setError(data?.message ?? 'Die Bezahlung konnte nicht gestartet werden. Bitte versuch es gleich noch einmal.');
        setBusy(false);
        return;
      }
      // Weiter zur gehosteten, sicheren Stripe-Bezahlseite
      window.location.href = data.url as string;
    } catch {
      setError('Verbindung fehlgeschlagen. Bitte prüfe dein Internet und versuch es erneut.');
      setBusy(false);
    }
  }

  return (
    <>
      <div className={`${styles.scrim} ${open ? styles.open : ''}`} onClick={busy ? undefined : onClose} />
      <div className={`${styles.modal} ${open ? styles.open : ''}`} role="dialog">
        <div className={styles.mhead}>
          <button className={styles.mclose} onClick={onClose} disabled={busy}>✕</button>
          <div className={styles.ptag}>{info.tag}</div>
          <h2>{info.title}</h2>
          <p>{info.blurb}</p>
        </div>
        <div className={styles.mbody}>
          <div
            className={`${styles.opt} ${selected === 'full' ? styles.sel : ''}`}
            onClick={() => setSelected('full')}
          >
            <div className={styles.radio} />
            <div className={styles.ox}><b>Komplettkurs</b><small>einmalig · Zugang bis zur Prüfung</small></div>
            <div className={styles.op}>{info.full}</div>
          </div>
          <div
            className={`${styles.opt} ${selected === 'month' ? styles.sel : ''}`}
            onClick={() => setSelected('month')}
          >
            <div className={styles.radio} />
            <div className={styles.ox}><b>Monatlich</b><small>monatlich kündbar</small></div>
            <div className={styles.op}>{info.month}<small>/ Monat</small></div>
          </div>

          {error && <div className={styles.checkoutError}>{error}</div>}

          <button
            className="btn primary"
            style={{ width: '100%' }}
            onClick={startCheckout}
            disabled={busy}
          >
            {busy ? 'Einen Moment …' : 'Weiter zur sicheren Bezahlung'}
          </button>
          <div className={styles.securenote}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Sichere Bezahlung über Stripe. Wir sehen oder speichern deine Kartendaten nicht.
          </div>
        </div>
      </div>
    </>
  );
}
