'use client';

import MarketingSeite from '@/components/MarketingSeite';
import { useDunkelmodus } from '@/lib/dunkelmodus';
import band from '@/components/SeitenBand.module.css';
import styles from './einstellungen.module.css';

export default function Einstellungen() {
  const { dunkel, waehlen } = useDunkelmodus();

  return (
    <MarketingSeite>
      <section className={band.band}>
        <p className={band.name}>Einstellungen</p>
        <h1 className={band.titel}>Deine Einstellungen.</h1>

        <div className={styles.gruppen}>
          <section className={styles.gruppe}>
            <h2>Darstellung</h2>
            <p className={styles.erklaerung}>
              Gilt auf diesem Gerät. Die Wahl bleibt gespeichert.
            </p>
            <div className={styles.wahl} role="group" aria-label="Darstellung">
              <button
                className={!dunkel ? styles.wahlAktiv : styles.wahlOption}
                onClick={() => waehlen(false)}
                aria-pressed={!dunkel}
              >
                Light Mode
              </button>
              <button
                className={dunkel ? styles.wahlAktiv : styles.wahlOption}
                onClick={() => waehlen(true)}
                aria-pressed={dunkel}
              >
                Dark Mode
              </button>
            </div>
          </section>

          <section className={styles.gruppe}>
            <h2>Sprache</h2>
            <p className={styles.erklaerung}>
              Gradefruit gibt es bisher nur auf Deutsch. Die Prüfung ist es auch.
            </p>
            <div className={styles.wahl} role="group" aria-label="Sprache">
              <button className={styles.wahlAktiv} aria-pressed="true">Deutsch</button>
              <button className={styles.wahlOption} disabled title="Noch nicht verfügbar">English</button>
            </div>
          </section>

          <section className={styles.gruppe}>
            <h2>Konto</h2>
            <p className={styles.erklaerung}>
              Kauf, Rechnungen und Löschung deines Kontos findest du nach dem
              Anmelden unter „Mein Konto“.
            </p>
          </section>

          <section className={styles.gruppe}>
            <h2>Rechtliches</h2>
            <ul className={styles.links}>
              <li><a href="/datenschutz">Datenschutz</a></li>
              <li><a href="/agb">AGB</a></li>
              <li><a href="/widerruf">Widerruf</a></li>
              <li><a href="/impressum">Impressum</a></li>
            </ul>
          </section>
        </div>
      </section>
    </MarketingSeite>
  );
}
