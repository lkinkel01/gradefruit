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
 * Wurde jemand unfreiwillig abgemeldet, übernimmt derselbe Bildschirm die
 * Erklärung. Vorher lag dafür ein eigener Hinweis-Zettel darüber — mit einem
 * zweiten „Anmelden" darin, während direkt darunter schon eines stand. Der
 * Hinweis gehört an die Stelle der Auswahl, nicht darüber.
 *
 * Im Browser wird diese Ansicht nie gezeigt.
 */
export default function AppEinstieg({
  onLogin,
  onRegister,
  onTesten,
  hinweis,
  onHinweisSchliessen,
}: {
  onLogin: () => void;
  onRegister: () => void;
  onTesten: () => void;
  /** Grund einer unfreiwilligen Abmeldung — null, solange alles normal ist.
      Wortlaut kommt aus SignedOutNotice, damit es ihn nur einmal gibt. */
  hinweis?: { title: string; body: string } | null;
  onHinweisSchliessen?: () => void;
}) {
  return (
    <main className={styles.seite}>
      <div className={styles.mitte}>
        <BrandMark size={44} />
        <h1 className={styles.titel}>Gradefruit</h1>
        <p className={styles.text}>
          Deine Vorbereitung auf das schriftliche Mathe-Abitur in Hessen 2027.
        </p>

        {hinweis ? (
          <>
            <div className={styles.hinweis} role="status" aria-live="polite">
              <strong className={styles.hinweisTitel}>{hinweis.title}</strong>
              <p className={styles.hinweisText}>{hinweis.body}</p>
            </div>

            <div className={styles.knoepfe}>
              <button type="button" className="btn primary" onClick={onLogin}>Wieder anmelden</button>
              <button type="button" className="btn light" onClick={onHinweisSchliessen}>Abbrechen</button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.knoepfe}>
              <button type="button" className="btn primary" onClick={onLogin}>Anmelden</button>
              <button type="button" className="btn light" onClick={onRegister}>Konto erstellen</button>
            </div>

            <button type="button" className={styles.testen} onClick={onTesten}>
              Analysis kostenlos ansehen
            </button>
          </>
        )}
      </div>
    </main>
  );
}
