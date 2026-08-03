'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  alleTonspuren, tonspurenEntfernen, tonspurenLaden, tonspurenVorhanden,
} from '@/lib/offlineAudio';
import styles from './OfflineVideos.module.css';

type Zustand = 'pruefe' | 'offen' | 'laedt' | 'fertig' | 'fehler';

/**
 * „Erklärvideos aufs Gerät laden" unter „Konto".
 *
 * Die Texte des Kurses liegen ohnehin auf dem Gerät (siehe OfflineVorrat) —
 * sie sind klein. Der Ton der Erklärvideos ist es nicht: rund 11 MB. Deshalb
 * hier ein Knopf mit ehrlicher Größenangabe statt eines stillen Downloads.
 */
export default function OfflineVideos() {
  const gesamt = alleTonspuren().length;
  const [zustand, setZustand] = useState<Zustand>('pruefe');
  const [fertig, setFertig] = useState(0);

  useEffect(() => {
    let lebt = true;
    void tonspurenVorhanden().then(anzahl => {
      if (!lebt) return;
      setFertig(anzahl);
      setZustand(anzahl >= gesamt ? 'fertig' : 'offen');
    });
    return () => { lebt = false; };
  }, [gesamt]);

  const laden = useCallback(async () => {
    setZustand('laedt');
    setFertig(0);
    try {
      const stand = await tonspurenLaden(anzahl => setFertig(anzahl));
      setZustand(stand.fertig >= stand.gesamt ? 'fertig' : 'fehler');
    } catch {
      setZustand('fehler');
    }
  }, []);

  const entfernen = useCallback(async () => {
    await tonspurenEntfernen();
    setFertig(0);
    setZustand('offen');
  }, []);

  if (zustand === 'pruefe') return null;

  return (
    <div className={styles.block}>
      <p className={styles.text}>
        {zustand === 'fertig'
          ? 'Alle Erklärvideos liegen auf dem Gerät und laufen auch ohne Netz.'
          : zustand === 'laedt'
            ? `Wird geladen … ${fertig} von ${gesamt}`
            : zustand === 'fehler'
              ? `Nicht alles hat geklappt (${fertig} von ${gesamt}). Prüfe deine Verbindung und versuch es erneut.`
              : 'Die Kursinhalte sind bereits ohne Netz lesbar. Der Ton der Erklärvideos fehlt noch — rund 11 MB.'}
      </p>

      {zustand === 'laedt' && (
        <div className={styles.balken} aria-hidden="true">
          <span
            className={styles.balkenFuellung}
            style={{ transform: `scaleX(${gesamt ? fertig / gesamt : 0})` }}
          />
        </div>
      )}

      <div className={styles.knoepfe}>
        <button
          type="button"
          className="btn light sm"
          onClick={() => void laden()}
          disabled={zustand === 'laedt'}
        >
          {zustand === 'fertig' ? 'Erneut laden' : 'Erklärvideos laden'}
        </button>
        {zustand === 'fertig' && (
          <button type="button" className="btn light sm" onClick={() => void entfernen()}>
            Vom Gerät entfernen
          </button>
        )}
      </div>
    </div>
  );
}
