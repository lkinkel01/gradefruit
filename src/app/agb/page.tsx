import type { Metadata } from 'next';
import Link from 'next/link';
import { BrandMark } from '@/components/BrandMark';
import styles from '../legal.module.css';

export const metadata: Metadata = {
  title: 'AGB — Gradefruit',
};

const Ph = ({ children }: { children: React.ReactNode }) => (
  <span className={styles.ph}>{children}</span>
);

export default function AgbPage() {
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
          <strong>Entwurf:</strong> Diese AGB sind eine sorgfältige Vorlage, aber keine
          Rechtsberatung. Vor dem Verkaufsstart die rot markierten Felder ausfüllen und den
          gesamten Text juristisch prüfen lassen (Anwalt oder geprüfter Generator).
        </p>
      </div>

      <header className={styles.header}>
        <div className={styles.eyebrow}>Rechtliches</div>
        <h1 className={styles.title}>Allgemeine Geschäftsbedingungen</h1>
        <p className={styles.updated}>Stand: <Ph>[Datum vor Verkaufsstart eintragen]</Ph></p>
      </header>

      <div className={styles.section}>
        <h2>1. Geltungsbereich und Anbieter</h2>
        <p>
          Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge über die Nutzung
          der Lernplattform Gradefruit (www.gradefruit.de) zwischen dem Anbieter
        </p>
        <p>
          <Ph>[Vollständiger Name]</Ph>, <Ph>[Straße und Hausnummer]</Ph>, <Ph>[PLZ Ort]</Ph>,
          Deutschland (siehe auch <Link href="/impressum">Impressum</Link>)
        </p>
        <p>und den Nutzerinnen und Nutzern der Plattform (nachfolgend „du").</p>
      </div>

      <div className={styles.section}>
        <h2>2. Leistungen</h2>
        <p>
          Gradefruit ist eine Lernplattform zur Vorbereitung auf das schriftliche Mathe-Abitur in
          Hessen. Angeboten werden digitale Lerninhalte: Übungsaufgaben mit
          Schritt-für-Schritt-Lösungen, Themen-Zusammenfassungen, Erklärvideos und ein
          KI-gestützter Lernassistent. Die Aufgaben sind eigens erstellte Übungsaufgaben im Stil
          der hessischen Abiturprüfung, keine Original-Prüfungsaufgaben.
        </p>
        <p>
          Der Bereich Analysis ist kostenlos nutzbar. Der volle Zugang zum Grundkurs oder
          Leistungskurs ist kostenpflichtig. Ein bestimmter Lernerfolg oder eine bestimmte Note
          wird nicht geschuldet.
        </p>
      </div>

      <div className={styles.section}>
        <h2>3. Registrierung und Konto</h2>
        <p>
          Für den Kauf und die Nutzung der kostenpflichtigen Inhalte ist ein Nutzerkonto
          erforderlich. Deine Zugangsdaten musst du vertraulich behandeln. Ein Konto ist
          persönlich und darf nicht mit anderen geteilt werden.
        </p>
      </div>

      <div className={styles.section}>
        <h2>4. Vertragsschluss</h2>
        <p>
          Die Darstellung der Kurse auf der Website ist kein rechtlich bindendes Angebot, sondern
          eine Aufforderung zur Bestellung. Mit dem Abschluss des Bezahlvorgangs über unseren
          Zahlungsdienstleister Stripe gibst du ein verbindliches Angebot zum Abschluss eines
          Vertrags ab. Der Vertrag kommt zustande, wenn wir den Zugang zu den gekauften Inhalten
          freischalten. Die Freischaltung erfolgt in der Regel unmittelbar nach
          Zahlungsbestätigung.
        </p>
      </div>

      <div className={styles.section}>
        <h2>5. Preise und Zahlung</h2>
        <p>
          Es gelten die zum Zeitpunkt der Bestellung auf der Website angezeigten Preise. Alle
          Preise sind Endpreise in Euro
          {' '}<Ph>[inkl. gesetzlicher Umsatzsteuer — ODER bei Kleinunternehmern: „Gemäß § 19
          UStG wird keine Umsatzsteuer erhoben und ausgewiesen."]</Ph>.
        </p>
        <p>
          Die Zahlung erfolgt über den Zahlungsdienstleister Stripe. Wir speichern oder sehen
          deine Zahlungsdaten (z. B. Kartendaten) nicht.
        </p>
      </div>

      <div className={styles.section}>
        <h2>6. Laufzeit, Zugang und Kündigung</h2>
        <p>
          <strong>Einmalzahlung:</strong> Der Zugang gilt bis zum Ende des jeweiligen
          Prüfungszeitraums, konkret bis zum <Ph>[Datum, z. B. 31.07.2027]</Ph>. Es entstehen
          keine Folgekosten, der Zugang verlängert sich nicht automatisch.
        </p>
        <p>
          <strong>Monatsabo:</strong> Das Abo verlängert sich monatlich automatisch und ist
          jederzeit zum Ende des laufenden Abrechnungsmonats kündbar. Die Kündigung ist ohne
          Angabe von Gründen über das Stripe-Kundenportal möglich (erreichbar im Bereich „Mein
          Konto") oder per E-Mail an <Ph>[E-Mail-Adresse]</Ph>.
        </p>
      </div>

      <div className={styles.section}>
        <h2>7. Widerrufsrecht</h2>
        <p>
          Als Verbraucher hast du ein gesetzliches Widerrufsrecht von 14 Tagen. Die Einzelheiten
          ergeben sich aus der <Link href="/widerruf">Widerrufsbelehrung</Link>.
        </p>
        <p>
          Wichtig bei digitalen Inhalten: Stimmst du im Bestellvorgang ausdrücklich zu, dass wir
          mit der Bereitstellung der Inhalte vor Ablauf der Widerrufsfrist beginnen, und
          bestätigst du deine Kenntnis, dass dein Widerrufsrecht mit Beginn der Bereitstellung
          erlischt, so erlischt das Widerrufsrecht mit der Freischaltung des Zugangs
          (§ 356 Abs. 5 BGB).
        </p>
      </div>

      <div className={styles.section}>
        <h2>8. Nutzungsrechte</h2>
        <p>
          Mit dem Kauf erhältst du ein einfaches, nicht übertragbares Recht, die Inhalte für
          deine persönliche Prüfungsvorbereitung zu nutzen. Eine Weitergabe, Veröffentlichung
          oder kommerzielle Nutzung der Inhalte ist nicht gestattet.
        </p>
      </div>

      <div className={styles.section}>
        <h2>9. KI-Lernassistent</h2>
        <p>
          Der KI-Assistent erstellt Antworten automatisiert. Trotz sorgfältiger Gestaltung können
          einzelne Antworten unvollständig oder fehlerhaft sein. Die Antworten sind Lernhilfen
          und ersetzen keine verbindliche Auskunft. Die Nutzung ist fair begrenzt (derzeit 30
          Fragen pro Tag); wir können dieses Limit anpassen, um die Plattform für alle stabil zu
          halten.
        </p>
      </div>

      <div className={styles.section}>
        <h2>10. Verfügbarkeit und Weiterentwicklung</h2>
        <p>
          Wir entwickeln die Plattform laufend weiter; Inhalte und Funktionen können sich in
          zumutbarem Umfang ändern, solange der Kern der Leistung erhalten bleibt. Eine
          hundertprozentige Verfügbarkeit können wir nicht garantieren; Wartungsarbeiten und
          Störungen können den Zugriff vorübergehend einschränken.
        </p>
      </div>

      <div className={styles.section}>
        <h2>11. Haftung</h2>
        <p>
          Wir haften unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie bei Verletzung von
          Leben, Körper und Gesundheit. Bei einfacher Fahrlässigkeit haften wir nur für die
          Verletzung wesentlicher Vertragspflichten (Pflichten, deren Erfüllung die Durchführung
          des Vertrags erst ermöglicht und auf deren Einhaltung du vertrauen darfst), begrenzt
          auf den vertragstypischen, vorhersehbaren Schaden. Die Haftung nach dem
          Produkthaftungsgesetz bleibt unberührt.
        </p>
      </div>

      <div className={styles.section}>
        <h2>12. Minderjährige</h2>
        <p>
          Bist du noch nicht 18 Jahre alt, benötigst du für den Kauf die Einwilligung deiner
          Erziehungsberechtigten.
        </p>
      </div>

      <div className={styles.section}>
        <h2>13. Schlussbestimmungen</h2>
        <p>
          Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts;
          zwingende verbraucherschützende Vorschriften deines gewöhnlichen Aufenthalts bleiben
          unberührt. Die Europäische Kommission stellt eine Plattform zur
          Online-Streitbeilegung bereit: https://ec.europa.eu/consumers/odr. Zur Teilnahme an
          einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle sind wir nicht
          verpflichtet und nicht bereit.
        </p>
      </div>
    </div>
  );
}
