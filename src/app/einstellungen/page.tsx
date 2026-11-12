'use client';

import MarketingSeite from '@/components/MarketingSeite';
import { useDunkelmodus } from '@/lib/dunkelmodus';
import { useSprache } from '@/lib/sprache';
import band from '@/components/SeitenBand.module.css';
import styles from './einstellungen.module.css';

export default function Einstellungen() {
  const { dunkel, waehlen } = useDunkelmodus();
  const { sprache, waehlen: spracheWaehlen, t } = useSprache();

  return (
    <MarketingSeite>
      <section className={band.band}>
        <p className={band.name}>{t('einstellungen.name')}</p>
        <h1 className={band.titel}>{t('einstellungen.titel')}</h1>

        <div className={styles.gruppen}>
          <section className={styles.gruppe}>
            <h2>{t('einstellungen.darstellung')}</h2>
            <p className={styles.erklaerung}>{t('einstellungen.darstellungText')}</p>
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
            <h2>{t('einstellungen.sprache')}</h2>
            <p className={styles.erklaerung}>{t('einstellungen.spracheText')}</p>
            <div className={styles.wahl} role="group" aria-label={t('einstellungen.sprache')}>
              <button
                className={sprache === 'de' ? styles.wahlAktiv : styles.wahlOption}
                onClick={() => spracheWaehlen('de')}
                aria-pressed={sprache === 'de'}
              >
                Deutsch
              </button>
              <button
                className={sprache === 'en' ? styles.wahlAktiv : styles.wahlOption}
                onClick={() => spracheWaehlen('en')}
                aria-pressed={sprache === 'en'}
              >
                English
              </button>
            </div>
          </section>

          <section className={styles.gruppe}>
            <h2>{t('einstellungen.konto')}</h2>
            <p className={styles.erklaerung}>{t('einstellungen.kontoText')}</p>
          </section>

          <section className={styles.gruppe}>
            <h2>{t('einstellungen.rechtliches')}</h2>
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
