import type { Metadata } from 'next';
import MarketingSeite from '@/components/MarketingSeite';
import { THEMEN } from '@/lib/marketing';
import band from '@/components/SeitenBand.module.css';
import styles from './ueber-uns.module.css';

export const metadata: Metadata = {
  title: 'Über uns | Gradefruit',
  description: 'Gradefruit bereitet auf genau eine Prüfung vor: das schriftliche Mathe-Abitur in Hessen 2027.',
};

export default function UeberUns() {
  return (
    <MarketingSeite>
      <section className={band.band}>
        <p className={band.name}>Über uns</p>
        <h1 className={band.titel}>Nur deine Prüfung.</h1>
        <p className={band.zeile}>
          Kein allgemeiner Lernkatalog. Nur das schriftliche Mathe-Abitur in
          Hessen 2027. Grundkurs und Leistungskurs getrennt.
        </p>
      </section>

      <section className={`${band.band} ${band.bandTon}`}>
        <h2 className={band.titel}>Die drei Themen.</h2>
        <ul className={styles.themen}>
          {THEMEN.map(t => (
            <li key={t.titel}>
              <strong>{t.titel}</strong>
              <span>{t.inhalt}</span>
            </li>
          ))}
        </ul>
      </section>
    </MarketingSeite>
  );
}
