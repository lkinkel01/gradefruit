'use client';
import { useAuth } from '@/lib/AuthContext';
import styles from './Watermark.module.css';

/**
 * Persönliches Wasserzeichen über den Kursinhalten.
 *
 * Screenshots lassen sich im Browser nicht verhindern — das kann keine
 * Website. Was geht: jeden Screenshot dem Konto zuordnen, aus dem er stammt.
 * Deshalb liegt hier die E-Mail des angemeldeten Nutzers sehr dezent und
 * gekachelt über dem Inhalt. Wer weitergibt, gibt seinen eigenen Namen mit.
 *
 * Bewusst zurückhaltend gesetzt: beim Lesen kaum wahrnehmbar, auf einem
 * Screenshot aber lesbar.
 */
export default function Watermark() {
  const { user } = useAuth();
  if (!user) return null;

  const label = user.email ?? user.id.slice(0, 8);
  // Mehrere Zeilen, damit das Zeichen auch bei Teilausschnitten im Bild ist.
  const rows = Array.from({ length: 14 });

  return (
    <div className={styles.mark} aria-hidden="true">
      <div className={styles.flaeche}>
      {rows.map((_, index) => (
        <div key={index} className={styles.row}>
          <span>{label}</span>
          <span>{label}</span>
          <span>{label}</span>
        </div>
      ))}
      </div>
    </div>
  );
}
