'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { PREISE, STEUERHINWEIS } from '@/lib/preise';
import styles from './Modal.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  course?: 'gk' | 'lk';
}

// Anzeige-Texte je Kurs. Die Preise kommen aus `preise.ts` — dort steht auch,
// warum sie nicht mehr in jeder Datei einzeln gepflegt werden.
const COURSE_INFO = {
  gk: {
    tag: 'Mathe-Abi Hessen 2027 · Grundkurs',
    title: 'Vollzugang',
    blurb: 'Alle Grundkurs-Themen, prüfungsnahe Übungsaufgaben, Erklärvideos und Fragen an die KI.',
  },
  lk: {
    tag: 'Mathe-Abi Hessen 2027 · Leistungskurs',
    title: 'LK-Vollzugang',
    blurb: 'Alle Leistungskurs-Themen, prüfungsnahe Übungsaufgaben, Erklärvideos und Fragen an die KI.',
  },
} as const;

export default function CheckoutModal({ open, onClose, course = 'gk' }: Props) {
  if (!open) return null;
  return <CheckoutDialog onClose={onClose} course={course} />;
}

function CheckoutDialog({ onClose, course }: { onClose: () => void; course: 'gk' | 'lk' }) {
  const { session } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  // Zustimmung zu AGB + Erlöschen des Widerrufsrechts (Pflicht bei digitalen
  // Inhalten mit sofortiger Freischaltung, § 356 Abs. 5 BGB).
  const [consent, setConsent] = useState(false);
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
        // Es gibt nur den Einmalkauf. Das Abo ist bewusst raus: Bei einer
        // Zielgruppe, die überwiegend minderjährig ist, sind wiederkehrende
        // Zahlungen ohne Zustimmung der Eltern rechtlich wacklig — und nach
        // der Prüfung würde ohnehin jede:r kündigen.
        body: JSON.stringify({ plan: 'full', course }),
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
      <div className={`${styles.scrim} ${styles.open}`} onClick={busy ? undefined : onClose} />
      <div className={`${styles.modal} ${styles.open}`} role="dialog" aria-modal="true" aria-labelledby="checkout-title">
        <div className={styles.mhead}>
          <button type="button" className={styles.mclose} onClick={onClose} disabled={busy} aria-label="Dialog schließen">✕</button>
          <div className={styles.ptag}>{info.tag}</div>
          <h2 id="checkout-title">{info.title}</h2>
          <p>{info.blurb}</p>
        </div>
        <div className={styles.mbody}>
          {/* Nur ein Tarif — deshalb keine Auswahl, sondern die Zusammenfassung
              dessen, was gekauft wird. */}
          <div className={`${styles.opt} ${styles.sel} ${styles.summary}`}>
            <div className={styles.ox}><b>Komplettkurs</b><small>einmalig · Zugang bis zur Prüfung</small></div>
            <div className={styles.op}>{PREISE[course].einmalig}</div>
          </div>

          <p className={styles.vat}>Einmalzahlung, keine Folgekosten. {STEUERHINWEIS}</p>

          <label className={styles.consent}>
            <input
              type="checkbox"
              checked={consent}
              onChange={e => setConsent(e.target.checked)}
              disabled={busy}
            />
            <span>
              Ich verlange die sofortige Freischaltung des Zugangs und bestätige meine
              Kenntnis, dass mein Widerrufsrecht mit Beginn der Bereitstellung erlischt.
              Die <a href="/agb" target="_blank" rel="noopener">AGB</a> und die{' '}
              <a href="/widerruf" target="_blank" rel="noopener">Widerrufsbelehrung</a> habe
              ich gelesen.
            </span>
          </label>

          {/* Sichtbar im Kaufvorgang, nicht nur in den AGB. Wer unter 18 ist,
              schließt Verträge nur mit Zustimmung der Eltern wirksam ab — der
              Hinweis nützt nichts, wenn ihn niemand liest. */}
          <p className={styles.minderjaehrig}>
            Du bist noch nicht 18? Dann kauf bitte mit dem Einverständnis deiner Eltern.
          </p>

          {error && <div className={styles.checkoutError}>{error}</div>}

          <button
            className="btn primary"
            style={{ width: '100%' }}
            onClick={startCheckout}
            disabled={busy || !consent}
            title={consent ? undefined : 'Bitte bestätige zuerst die Checkbox oben'}
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
