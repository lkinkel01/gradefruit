'use client';

import type { SignedOutReason } from '@/lib/AuthContext';
import styles from './SignedOutNotice.module.css';

// Wer nicht selbst auf „Abmelden" geklickt hat, soll erfahren, warum er
// plötzlich abgemeldet ist. Ohne diesen Hinweis wirkt es wie ein Fehler.
const TEXT: Record<SignedOutReason, { title: string; body: string }> = {
  'other-device': {
    title: 'Auf einem anderen Gerät angemeldet',
    body: 'Dein Konto wird gerade auf einem anderen Gerät verwendet. Pro Konto ist immer nur ein Gerät gleichzeitig angemeldet.',
  },
  idle: {
    title: 'Automatisch abgemeldet',
    body: 'Zu deiner Sicherheit melden wir dich nach zwei Stunden ohne Aktivität ab.',
  },
};

interface Props {
  reason: SignedOutReason | null;
  onSignIn: () => void;
  onClose: () => void;
}

export default function SignedOutNotice({ reason, onSignIn, onClose }: Props) {
  if (!reason) return null;
  const { title, body } = TEXT[reason];

  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <div className={styles.card}>
        <div className={styles.text}>
          <strong className={styles.title}>{title}</strong>
          <p className={styles.body}>{body}</p>
        </div>
        <div className={styles.actions}>
          <button type="button" className="btn primary" onClick={onSignIn}>Wieder anmelden</button>
          <button type="button" className={styles.dismiss} onClick={onClose} aria-label="Hinweis schließen">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
