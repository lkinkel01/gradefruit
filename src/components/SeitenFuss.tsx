import { BrandMark } from './BrandMark';
import styles from './SeitenFuss.module.css';

/** Fußzeile für alle öffentlichen Seiten. */
export default function SeitenFuss() {
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
      <p>© 2026 Gradefruit · Mathe-Abitur Hessen 2027 · Zahlung über Stripe</p>
    </footer>
  );
}
