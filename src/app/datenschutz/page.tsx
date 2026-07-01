import type { Metadata } from 'next';
import Link from 'next/link';
import styles from '../legal.module.css';

export const metadata: Metadata = {
  title: 'Datenschutz — Gradefruit',
};

const Ph = ({ children }: { children: React.ReactNode }) => (
  <span className={styles.ph}>{children}</span>
);

export default function DatenschutzPage() {
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
        <h1 className={styles.title}>Datenschutzerklärung</h1>
        <p className={styles.updated}>Stand: Juli 2026 · gemäß DSGVO und BDSG</p>
      </header>

      <div className={styles.section}>
        <h2>1. Verantwortlicher</h2>
        <p>
          Verantwortlicher im Sinne der DSGVO ist:
        </p>
        <p>
          <Ph>[Vollständiger Name]</Ph><br />
          <Ph>[Straße und Hausnummer]</Ph><br />
          <Ph>[PLZ Ort]</Ph><br />
          E-Mail: <Ph>[E-Mail-Adresse]</Ph>
        </p>
        <p>
          Ein Datenschutzbeauftragter ist nicht gesetzlich vorgeschrieben und wurde nicht bestellt.
          Bei datenschutzrechtlichen Fragen wende dich direkt an die oben genannte E-Mail-Adresse.
        </p>
      </div>

      <div className={styles.divider} />

      <div className={styles.section}>
        <h2>2. Welche Daten wir erheben und warum</h2>

        <h3>2.1 Besuch der Website</h3>
        <p>
          Beim Aufruf der Website verarbeitet unser Hosting-Anbieter Vercel automatisch folgende
          Daten in Server-Logs:
        </p>
        <ul>
          <li>IP-Adresse (anonymisiert nach kurzer Zeit)</li>
          <li>Datum und Uhrzeit der Anfrage</li>
          <li>Aufgerufene URL, HTTP-Methode und Statuscode</li>
          <li>Referrer-URL und Browser-Kennung (User-Agent)</li>
        </ul>
        <p>
          Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Betrieb und
          Sicherheit der Website). Speicherdauer: max. 30 Tage.
        </p>

        <h3>2.2 Registrierung und Account</h3>
        <p>
          Zur Nutzung der Plattform kannst du dich mit deiner E-Mail-Adresse und einem Passwort
          registrieren. Dabei speichern wir:
        </p>
        <ul>
          <li>E-Mail-Adresse</li>
          <li>Verschlüsseltes Passwort (gespeichert bei Supabase, nie im Klartext)</li>
          <li>Erstellungsdatum des Accounts</li>
          <li>Lernfortschritte (welche Themen und Aufgaben bearbeitet wurden)</li>
          <li>KI-Nutzung (Anzahl täglicher Anfragen zur Einhaltung des Limits)</li>
        </ul>
        <p>
          Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung). Speicherdauer: bis zur
          Löschung des Accounts auf Anfrage.
        </p>

        <h3>2.3 Käufe und Zahlungsabwicklung</h3>
        <p>
          Wenn du den Vollzugang kaufst, wird die Zahlung vollständig über Stripe, Inc. abgewickelt.
          Wir erhalten keine Kreditkartendaten. Stripe speichert und verarbeitet Zahlungsdaten
          gemäß seinem eigenen Datenschutzstandard (PCI DSS Level 1).
        </p>
        <p>
          Wir speichern in unserer Datenbank: E-Mail-Adresse, Stripe-Kunden-ID und den Status des
          Vollzugangs (aktiv/inaktiv).
        </p>
        <p>
          Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) und Art. 6 Abs. 1
          lit. c DSGVO (gesetzliche Aufbewahrungspflichten). Speicherdauer: 10 Jahre gemäß § 147
          AO für steuerrelevante Daten.
        </p>

        <h3>2.4 KI-Assistent</h3>
        <p>
          Wenn du den integrierten KI-Assistenten nutzt, werden deine Fragen und der Kontext der
          jeweiligen Aufgabe an die Anthropic API übermittelt. Hochgeladene Bilder oder PDFs werden
          dabei ebenfalls an Anthropic gesendet. Die Übertragung erfolgt verschlüsselt (TLS).
          Anthropic verarbeitet die Anfragen auf Servern in den USA.
        </p>
        <p>
          Wir speichern keine KI-Gesprächsverläufe dauerhaft in unserer Datenbank. Anthropic
          verarbeitet Anfragen gemäß seiner eigenen Datenschutzrichtlinie. Rechtsgrundlage:
          Art. 6 Abs. 1 lit. b DSGVO.
        </p>

        <h3>2.5 Schriften (Google Fonts)</h3>
        <p>
          Diese Website lädt Schriftarten über Google Fonts von Google-Servern. Dabei wird deine
          IP-Adresse an Google LLC (USA) übertragen. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.
        </p>
        <p>
          Um die Übertragung zu vermeiden, kannst du in deinem Browser JavaScript deaktivieren oder
          einen entsprechenden Blocker einsetzen.
        </p>
      </div>

      <div className={styles.divider} />

      <div className={styles.section}>
        <h2>3. Eingesetzte Drittanbieter</h2>
        <ul>
          <li>
            <strong>Vercel Inc.</strong>, 340 Pine Street, Suite 701, San Francisco, CA 94104, USA
            — Hosting und Infrastruktur. Datenschutz: vercel.com/legal/privacy-policy
          </li>
          <li>
            <strong>Supabase Inc.</strong>, 970 Toa Payoh North, #07-04, Singapur — Authentifizierung
            und Datenbank. Datenschutz: supabase.com/privacy
          </li>
          <li>
            <strong>Stripe, Inc.</strong>, 510 Townsend Street, San Francisco, CA 94103, USA —
            Zahlungsabwicklung. Datenschutz: stripe.com/de/privacy
          </li>
          <li>
            <strong>Anthropic PBC</strong>, 548 Market Street, PMB 90375, San Francisco, CA 94104,
            USA — KI-Assistent. Datenschutz: anthropic.com/privacy
          </li>
          <li>
            <strong>Google LLC</strong>, 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA —
            Google Fonts. Datenschutz: policies.google.com/privacy
          </li>
        </ul>
        <p>
          Für Übermittlungen in die USA gilt: Soweit die jeweiligen Anbieter unter dem
          EU-US Data Privacy Framework zertifiziert sind, erfolgt die Übermittlung auf dieser
          Grundlage. Andernfalls werden Standardvertragsklauseln (SCCs) gemäß Art. 46 Abs. 2
          lit. c DSGVO verwendet.
        </p>
      </div>

      <div className={styles.divider} />

      <div className={styles.section}>
        <h2>4. Cookies und lokale Speicherung</h2>
        <p>
          Wir setzen keine Tracking- oder Werbe-Cookies ein. Für die Sitzungsverwaltung
          (eingeloggter Zustand) verwendet Supabase einen technisch notwendigen Cookie sowie
          localStorage im Browser. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
        </p>
      </div>

      <div className={styles.divider} />

      <div className={styles.section}>
        <h2>5. Deine Rechte</h2>
        <p>Du hast gegenüber uns folgende Rechte hinsichtlich deiner Daten:</p>
        <ul>
          <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
          <li>Recht auf Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
          <li>Recht auf Löschung („Recht auf Vergessenwerden", Art. 17 DSGVO)</li>
          <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Recht auf Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
        </ul>
        <p>
          Um dein Konto und alle zugehörigen Daten löschen zu lassen, sende eine E-Mail an{' '}
          <Ph>[E-Mail-Adresse]</Ph>. Wir bearbeiten Anfragen innerhalb von 30 Tagen.
        </p>
      </div>

      <div className={styles.divider} />

      <div className={styles.section}>
        <h2>6. Beschwerderecht</h2>
        <p>
          Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung
          deiner Daten zu beschweren. Die zuständige Behörde richtet sich nach deinem Wohnort.
          Eine Liste aller deutschen Aufsichtsbehörden findest du auf der Website des BfDI
          (bfdi.bund.de).
        </p>
      </div>

      <div className={styles.divider} />

      <div className={styles.section}>
        <h2>Checkliste: Was noch eingetragen werden muss</h2>
        <ul>
          <li>Vollständiger Name des Verantwortlichen (Abschnitt 1)</li>
          <li>Vollständige Anschrift des Verantwortlichen (Abschnitt 1)</li>
          <li>E-Mail-Adresse für Datenschutzanfragen (Abschnitt 1 und 5)</li>
          <li>
            Falls weitere Drittanbieter eingebunden werden (z. B. Analytics, CDN, E-Mail-Dienst):
            diese in Abschnitt 3 ergänzen
          </li>
          <li>
            Prüfen ob Google Fonts lokal gehostet werden kann — erspart den Google-Eintrag in
            Abschnitt 2.5 und vereinfacht die DSGVO-Konformität erheblich
          </li>
          <li>
            Sobald alle Felder ausgefüllt sind, den Hinweis-Banner oben auf dieser Seite entfernen
          </li>
        </ul>
      </div>
    </div>
  );
}
