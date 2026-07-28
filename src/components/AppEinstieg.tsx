'use client';

import { BrandMark } from './BrandMark';
import styles from './AppEinstieg.module.css';

/**
 * Startbildschirm der App für Nicht-Angemeldete.
 *
 * In der App ist die Werbeseite fehl am Platz: Wer sie installiert hat, muss
 * nicht mehr überzeugt werden. Statt Kacheln, Preisen und Reel-Abschnitt gibt
 * es hier das Nötige — anmelden, oder Analysis kostenlos ansehen.
 *
 * Im Browser wird diese Ansicht nie gezeigt.
 */
export default function AppEinstieg({
  onLogin,
  onRegister,
  onTesten,
}: {
  onLogin: () => void;
  onRegister: () => void;
  onTesten: () => void;
}) {
  return (
    <main className={styles.seite}>
      <div className={styles.mitte}>
        <BrandMark size={44} />
        <h1 className={styles.titel}>Gradefruit</h1>
        <p className={styles.text}>
          Deine Vorbereitung auf das schriftliche Mathe-Abitur in Hessen 2027.
        </p>

        <div className={styles.knoepfe}>
          <button type="button" className="btn primary" onClick={onLogin}>Anmelden</button>
          <button type="button" className="btn light" onClick={onRegister}>Konto erstellen</button>
        </div>

        <button type="button" className={styles.testen} onClick={onTesten}>
          Analysis kostenlos ansehen
        </button>
      </div>
    </main>
  );
}
