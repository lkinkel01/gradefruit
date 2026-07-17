import type { Metadata } from 'next';
import Link from 'next/link';
import { BrandMark } from '@/components/BrandMark';
import styles from '../legal.module.css';

export const metadata: Metadata = {
  title: 'Widerrufsbelehrung — Gradefruit',
};

const Ph = ({ children }: { children: React.ReactNode }) => (
  <span className={styles.ph}>{children}</span>
);

export default function WiderrufPage() {
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.brand}>
          <BrandMark size={25} />
          Gradefruit
        </Link>
        <Link href="/" className={styles.back}>
          ← Zurück zur Startseite
        </Link>
      </nav>

      <div className={styles.notice}>
        <p>
          <strong>Entwurf:</strong> Vor dem Verkaufsstart die rot markierten Felder ausfüllen und
          den Text juristisch prüfen lassen. Er folgt dem gesetzlichen Muster, ist aber keine
          Rechtsberatung.
        </p>
      </div>

      <header className={styles.header}>
        <div className={styles.eyebrow}>Rechtliches</div>
        <h1 className={styles.title}>Widerrufsbelehrung</h1>
        <p className={styles.updated}>Für Verbraucher bei Verträgen über digitale Inhalte</p>
      </header>

      <div className={styles.section}>
        <h2>Widerrufsrecht</h2>
        <p>
          Du hast das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu
          widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsschlusses.
        </p>
        <p>
          Um dein Widerrufsrecht auszuüben, musst du uns
        </p>
        <p>
          <Ph>[Vollständiger Name]</Ph><br />
          <Ph>[Straße und Hausnummer]</Ph><br />
          <Ph>[PLZ Ort]</Ph><br />
          E-Mail: <Ph>[E-Mail-Adresse]</Ph>
        </p>
        <p>
          mittels einer eindeutigen Erklärung (z. B. eine E-Mail) über deinen Entschluss, diesen
          Vertrag zu widerrufen, informieren. Du kannst dafür das beigefügte
          Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.
        </p>
        <p>
          Zur Wahrung der Widerrufsfrist reicht es aus, dass du die Mitteilung über die Ausübung
          des Widerrufsrechts vor Ablauf der Widerrufsfrist absendest.
        </p>
      </div>

      <div className={styles.section}>
        <h2>Folgen des Widerrufs</h2>
        <p>
          Wenn du diesen Vertrag widerrufst, haben wir dir alle Zahlungen, die wir von dir
          erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag
          zurückzuzahlen, an dem die Mitteilung über deinen Widerruf dieses Vertrags bei uns
          eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das du
          bei der ursprünglichen Transaktion eingesetzt hast, sofern nichts anderes vereinbart
          wurde; in keinem Fall werden dir wegen dieser Rückzahlung Entgelte berechnet.
        </p>
      </div>

      <div className={styles.section}>
        <h2>Erlöschen des Widerrufsrechts bei digitalen Inhalten</h2>
        <p>
          Das Widerrufsrecht erlischt bei einem Vertrag über die Bereitstellung von nicht auf
          einem körperlichen Datenträger befindlichen digitalen Inhalten gemäß § 356 Abs. 5 BGB,
          wenn wir mit der Ausführung des Vertrags begonnen haben, nachdem du
        </p>
        <ul>
          <li>ausdrücklich zugestimmt hast, dass wir mit der Ausführung des Vertrags vor Ablauf
            der Widerrufsfrist beginnen, und</li>
          <li>deine Kenntnis davon bestätigt hast, dass du durch deine Zustimmung mit Beginn der
            Ausführung des Vertrags dein Widerrufsrecht verlierst.</li>
        </ul>
        <p>
          Diese Zustimmung gibst du im Bestellvorgang über die entsprechende Checkbox ab. Der
          Zugang wird dir anschließend sofort freigeschaltet.
        </p>
      </div>

      <div className={styles.divider} />

      <div className={styles.section}>
        <h2>Muster-Widerrufsformular</h2>
        <p>
          (Wenn du den Vertrag widerrufen willst, dann fülle bitte dieses Formular aus und sende
          es zurück.)
        </p>
        <p>
          An:<br />
          <Ph>[Vollständiger Name]</Ph>, <Ph>[Straße und Hausnummer]</Ph>, <Ph>[PLZ Ort]</Ph><br />
          E-Mail: <Ph>[E-Mail-Adresse]</Ph>
        </p>
        <p>
          Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den
          Kauf der folgenden Waren (*) / die Erbringung der folgenden Dienstleistung (*):
        </p>
        <p>
          Bestellt am (*) / erhalten am (*): ____________<br />
          Name des/der Verbraucher(s): ____________<br />
          Anschrift des/der Verbraucher(s): ____________<br />
          Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier): ____________<br />
          Datum: ____________
        </p>
        <p>(*) Unzutreffendes streichen.</p>
      </div>
    </div>
  );
}
