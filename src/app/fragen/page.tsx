import type { Metadata } from 'next';
import MarketingSeite from '@/components/MarketingSeite';
import { FRAGEN } from '@/lib/marketing';
import band from '@/components/SeitenBand.module.css';
import styles from './fragen.module.css';

export const metadata: Metadata = {
  title: 'Fragen — Gradefruit',
  description: 'Die wichtigsten Antworten zu Gradefruit, dem Mathe-Abitur in Hessen 2027 und den Kursen.',
};

export default function Fragen() {
  return (
    <MarketingSeite>
      <section className={band.band}>
        <p className={band.name}>Fragen</p>
        <h1 className={band.titel}>Kurz erklärt.</h1>
        <div className={styles.liste}>
          {FRAGEN.map(f => (
            <details key={f.frage} className={styles.eintrag}>
              <summary>
                <span>{f.frage}</span>
                <span className={styles.plus} aria-hidden="true" />
              </summary>
              <p>{f.antwort}</p>
            </details>
          ))}
        </div>
      </section>
    </MarketingSeite>
  );
}
