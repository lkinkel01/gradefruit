import type { Metadata } from 'next';
import Link from 'next/link';
import styles from '../legal.module.css';

export const metadata: Metadata = {
  title: 'Impressum — Gradefruit',
};

const Ph = ({ children }: { children: React.ReactNode }) => (
  <span className={styles.ph}>{children}</span>
);

export default function ImpressumPage() {
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.brand}>
          <span className={styles.dot} />
          Gradefruit
        </Link>
        <Link href="/" className={styles.back}>
          ← Zurück zur Startseite
        </Link>
      </nav>

      <div className={styles.notice}>
        <p>
          <strong>Platzhalter ausfüllen:</strong> Alle rot markierten Felder müssen vor der
          Veröffentlichung durch echte Angaben ersetzt werden. Siehe Checkliste am Seitenende.
        </p>
      </div>

      <header className={styles.header}>
        <div className={styles.eyebrow}>Rechtliches</div>
        <h1 className={styles.title}>Impressum</h1>
        <p className={styles.updated}>Angaben gemäß § 5 TMG</p>
      </header>

      <div className={styles.section}>
        <h2>Anbieter</h2>
        <p>
          <Ph>[Vollständiger Name]</Ph><br />
          <Ph>[Straße und Hausnummer]</Ph><br />
          <Ph>[PLZ Ort]</Ph><br />
          Deutschland
        </p>
      </div>

      <div className={styles.section}>
        <h2>Kontakt</h2>
        <p>
          E-Mail: <Ph>[E-Mail-Adresse]</Ph>
        </p>
        <p>
          Telefon (optional): <Ph>[Telefonnummer oder „nicht öffentlich"]</Ph>
        </p>
      </div>

      <div className={styles.section}>
        <h2>Umsatzsteuer</h2>
        <p>
          Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
        </p>
        <p>
          <Ph>[USt-IdNr. — oder: „Nicht vorhanden. Kleinunternehmer gemäß § 19 UStG."]</Ph>
        </p>
      </div>

      <div className={styles.section}>
        <h2>Verantwortlich für den Inhalt</h2>
        <p>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</p>
        <p>
          <Ph>[Vollständiger Name]</Ph><br />
          <Ph>[Straße und Hausnummer]</Ph><br />
          <Ph>[PLZ Ort]</Ph>
        </p>
      </div>

      <div className={styles.divider} />

      <div className={styles.section}>
        <h2>Haftungsausschluss</h2>

        <h3>Haftung für Inhalte</h3>
        <p>
          Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
          Vollständigkeit und Aktualität der Inhalte übernehmen wir keine Gewähr. Als
          Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach
          den allgemeinen Gesetzen verantwortlich.
        </p>

        <h3>Haftung für Links</h3>
        <p>
          Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen
          Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
          oder Betreiber der Seiten verantwortlich. Eine permanente inhaltliche Kontrolle der
          verlinkten Seiten ist ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar.
        </p>

        <h3>Urheberrecht</h3>
        <p>
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
          dem deutschen Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet. Die
          Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
          Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors.
        </p>
      </div>

      <div className={styles.divider} />

      <div className={styles.section}>
        <h2>Checkliste: Was noch eingetragen werden muss</h2>
        <ul>
          <li>Vollständiger Name (Vor- und Nachname bei Privatperson, Firmenname bei Unternehmen)</li>
          <li>Vollständige Anschrift (Straße, Hausnummer, PLZ, Ort)</li>
          <li>Erreichbare E-Mail-Adresse</li>
          <li>Telefonnummer (optional, aber empfohlen)</li>
          <li>
            Umsatzsteuer-ID — falls du Kleinunternehmer bist (§ 19 UStG), diesen Hinweis stattdessen
            eintragen
          </li>
          <li>
            Handelsregisternummer + Registergericht (nur wenn als GmbH, UG o. Ä. eingetragen)
          </li>
        </ul>
        <p style={{ marginTop: '16px' }}>
          Sobald alle Felder ausgefüllt sind, den Hinweis-Banner oben auf dieser Seite entfernen.
        </p>
      </div>
    </div>
  );
}
