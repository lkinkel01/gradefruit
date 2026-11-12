import type { Metadata } from 'next';
import MarketingSeite from '@/components/MarketingSeite';
import ProduktBild from '@/components/ProduktBild';
import { MERKMALE } from '@/lib/marketing';
import band from '@/components/SeitenBand.module.css';
import styles from './lernsystem.module.css';

export const metadata: Metadata = {
  title: 'Lernsystem | Gradefruit',
  description: 'Aufgaben mit vollständigem Lösungsweg, ein Coach im Lernkontext und Wiederholen im Swipe-Format.',
};

export default function Lernsystem() {
  return (
    <MarketingSeite>
      <section className={band.band}>
        <p className={band.name}>Lernsystem</p>
        <h1 className={band.titel}>So lernst du damit.</h1>
        <p className={band.zeile}>
          Fünf Dinge, die zusammenarbeiten. Kein Katalog, durch den du dich allein
          durchklickst.
        </p>
        <div className={band.bild}>
          <ProduktBild
            name="uebersicht"
            alt="Die Übersicht in Gradefruit: Lernfortschritt pro Thema, offene Aufgaben und der nächste Schritt."
            breite={2560}
            hoehe={1800}
          />
        </div>
      </section>

      <section className={`${band.band} ${band.bandTon}`}>
        <h2 className={band.titel}>Was drinsteckt.</h2>
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
        <p className={band.name}>Reel-Modus</p>
        <h2 className={band.titel}>Swipen. Und dabei lernen.</h2>
        <p className={band.zeile}>
          Aufgaben und Formeln im Hochformat, wie bei TikTok. Nur mit dem, was bei
          dir gerade dran ist.
        </p>
        <div className={band.hochkant}>
          <ProduktBild
            name="reel"
            alt="Der Reel-Modus auf dem Handy: eine Funktion mit ihrem Graphen, darunter verstanden, wiederholen oder nicht verstanden."
            breite={860}
            hoehe={1760}
          />
        </div>
      </section>
    </MarketingSeite>
  );
}
