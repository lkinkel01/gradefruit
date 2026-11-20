import styles from './LernSchritte.module.css';

/**
 * Der Weg durch ein Thema, als Folge von Schritten von links nach rechts.
 *
 * Vorher stand dasselbe als Fließtext da: „Zusammenfassung lesen,
 * Übungsaufgabe rechnen, mit dem Lösungsweg vergleichen, Erklärvideo ansehen
 * und am Ende prüfungsnahe Aufgaben lösen." Fünf Schritte in einem Satz muss
 * man lesen und sich nebenbei merken, in welcher Reihenfolge sie kommen.
 * Nebeneinander sieht man die Reihenfolge, ohne sie zu lesen.
 *
 * Die Nummern stehen im Markup, nicht nur in CSS: Wer die Seite vorgelesen
 * bekommt, soll „Schritt 1 von 5" hören und nicht einen Haufen loser Wörter.
 */
const SCHRITTE = [
  { titel: 'Verstehen', text: 'Zusammenfassung zum Thema lesen' },
  { titel: 'Rechnen', text: 'Übungsaufgabe selbst lösen' },
  { titel: 'Vergleichen', text: 'Lösungsweg Schritt für Schritt nachgehen' },
  { titel: 'Nachschauen', text: 'Erklärvideo ansehen, wo es hakt' },
  { titel: 'Prüfen', text: 'Prüfungsnahe Aufgabe lösen' },
] as const;

export default function LernSchritte() {
  return (
    <ol className={styles.schritte} aria-label="Der Weg durch ein Thema in fünf Schritten">
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
