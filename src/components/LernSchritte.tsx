import styles from './LernSchritte.module.css';

/**
 * Der Weg durch ein Thema, als Folge von Schritten von links nach rechts.
 *
 * Vorher stand dasselbe als Fließtext da: „Zusammenfassung lesen,
 * Übungsaufgabe rechnen, mit dem Lösungsweg vergleichen, Erklärvideo ansehen
 * und am Ende prüfungsnahe Aufgaben lösen." Schritte in einem Satz muss man
 * lesen und sich nebenbei merken, in welcher Reihenfolge sie kommen.
 * Nebeneinander sieht man die Reihenfolge, ohne sie zu lesen.
 *
 * „Erklärvideo ansehen" ist dabei als eigener Schritt entfallen. Videos sind
 * kein Schritt zwischen zweien, sondern gibt es zu jeder Station — das sagt
 * jetzt die Zeile über der Grafik, statt es an eine Stelle zu sperren.
 *
 * Die Nummern stehen im Markup, nicht nur in CSS: Wer die Seite vorgelesen
 * bekommt, soll „Schritt 1 von 5" hören und nicht einen Haufen loser Wörter.
 */
const SCHRITTE = [
  { titel: 'Verstehen', text: 'Zusammenfassung lesen oder ansehen' },
  { titel: 'Rechnen', text: 'Übungsaufgabe erst selbst lösen' },
  { titel: 'Vergleichen', text: 'Lösungsweg nachgehen, Schritt für Schritt' },
  { titel: 'Prüfen', text: 'Prüfungsnahe Aufgabe, gleiches Vorgehen' },
] as const;

export default function LernSchritte() {
  return (
    <ol className={styles.schritte} aria-label="Der Weg durch ein Thema in vier Schritten">
      {SCHRITTE.map((s, i) => (
        <li key={s.titel} className={styles.schritt}>
          <span className={styles.nummer} aria-hidden="true">{i + 1}</span>
          <span className={styles.titel}>
            <span className={styles.nurVorleser}>Schritt {i + 1} von {SCHRITTE.length}: </span>
            {s.titel}
          </span>
          <span className={styles.text}>{s.text}</span>
        </li>
      ))}
    </ol>
  );
}
