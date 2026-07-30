'use client';

import { useEffect, useState } from 'react';
import { erinnerungLoeschen, erinnerungSetzen, gespeicherteZeit, imAppRahmen } from '@/lib/nativeApp';
import styles from './LernErinnerung.module.css';

/**
 * Tägliche Lernerinnerung — erscheint nur in der App.
 *
 * Im Browser gibt es dafür keine verlässliche Entsprechung, deshalb wird hier
 * gar nichts angezeigt, statt etwas zu versprechen, das nicht hält.
 */
export default function LernErinnerung() {
  const [inApp, setInApp] = useState(false);
  const [zeit, setZeit] = useState('17:00');
  const [aktiv, setAktiv] = useState(false);
  const [hinweis, setHinweis] = useState<string | null>(null);

  useEffect(() => {
    setInApp(imAppRahmen());
    const gespeichert = gespeicherteZeit();
    if (gespeichert) { setZeit(gespeichert); setAktiv(true); }
  }, []);

  if (!inApp) return null;

  const umschalten = async () => {
    if (aktiv) {
      await erinnerungLoeschen();
      setAktiv(false);
      setHinweis(null);
      return;
    }
    const fehler = await erinnerungSetzen(zeit);
    setAktiv(!fehler);
    setHinweis(fehler);
  };

  return (
    <section className={styles.box}>
      <div className={styles.text}>
        <strong className={styles.title}>Tägliche Lernerinnerung</strong>
        <p className={styles.body}>
          {aktiv
            ? `Du wirst jeden Tag um ${zeit} Uhr erinnert.`
            : 'Eine kurze Mitteilung am Tag — damit Lernen nicht untergeht.'}
        </p>
        {hinweis && <p className={styles.hinweis}>{hinweis}</p>}
      </div>
      <div className={styles.actions}>
        <input
          type="time"
          className={styles.zeit}
          value={zeit}
          onChange={event => setZeit(event.target.value)}
          disabled={aktiv}
          aria-label="Uhrzeit der Erinnerung"
        />
        <button type="button" className="btn light" onClick={() => void umschalten()}>
          {aktiv ? 'Ausschalten' : 'Einschalten'}
        </button>
      </div>
    </section>
  );
}
