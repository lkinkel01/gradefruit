'use client';

import { BrandMark } from './BrandMark';
import { useSprache } from '@/lib/sprache';
import styles from './SeitenFuss.module.css';

/** Fußzeile für alle öffentlichen Seiten. */
export default function SeitenFuss() {
  const { t } = useSprache();

  return (
    <footer className={styles.fuss}>
      <div className={styles.marke}>
        <BrandMark size={22} />
        <span>Gradefruit</span>
      </div>
      <div className={styles.links}>
        <a href="/impressum">Impressum</a>
        <a href="/datenschutz">Datenschutz</a>
        <a href="/agb">AGB</a>
        <a href="/widerruf">Widerruf</a>
      </div>
      <p>{t('fuss.hinweis')}</p>
    </footer>
  );
}
