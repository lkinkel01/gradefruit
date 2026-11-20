import type { Metadata } from 'next';
import MarketingSeite from '@/components/MarketingSeite';
import LernsystemBilder from './LernsystemBilder';
import LernSchritte from '@/components/LernSchritte';
import { MERKMALE } from '@/lib/marketing';
import band from '@/components/SeitenBand.module.css';
import styles from './lernsystem.module.css';

export const metadata: Metadata = {
  title: 'Lernsystem | Gradefruit',
  description: 'In fünf Schritten durch jedes Thema: verstehen, rechnen, vergleichen, nachschauen, prüfen.',
};

export default function Lernsystem() {
  return (
    <MarketingSeite>
      {/* Die fünf Schritte als Grafik, nicht als Satz. Dieselbe Darstellung
          wie auf der Startseite — wer von dort kommt, erkennt sie wieder. */}
      <section className={band.band}>
        <h1 className={band.titel}>So lernst du mit Gradefruit.</h1>
        <p className={band.zeile}>Fünf Schritte, in jedem Thema dieselben.</p>
        <LernSchritte />
        <div className={band.bild}>
          <LernsystemBilder art="uebersicht" />
        </div>
      </section>

      <section className={`${band.band} ${band.bandTon}`}>
        <h2 className={band.titel}>Was Gradefruit dir bietet.</h2>
        <ul className={styles.liste}>
          {MERKMALE.map(m => (
            <li key={m.titel}>
              <strong>{m.titel}</strong>
              <span>{m.text}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={band.band}>
        <h2 className={band.titel}>Swipen. Und dabei lernen.</h2>
        <p className={band.zeile}>
          Aufgaben und Formeln im Hochformat, wie bei TikTok. Nur mit dem, was bei
          dir gerade dran ist.
        </p>
        <div className={band.hochkant}>
          <LernsystemBilder art="reel" />
        </div>
      </section>
    </MarketingSeite>
  );
}
